/** Durable ownership for one institution at a time. No university facts are written here. */
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const NORDICS = new Set(['no', 'se', 'fi', 'is']);
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const optional = (file, fallback) => fs.existsSync(file) ? read(file) : fallback;
export function localDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Copenhagen', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
export function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
export function tierFor(row, countries) {
  return row.country_code === 'dk' ? 0 : NORDICS.has(row.country_code) ? 1 : countries.get(row.country_code)?.scope === 'europe' ? 2 : 3;
}
export function orderedInstitutions(queue, countries) {
  const seen = new Set();
  for (const row of queue) {
    if (!row.institution_key || seen.has(row.institution_key)) throw new Error('Queue has a missing or duplicate institution key');
    if (!countries.has(row.country_code) && row.country_code !== 'dk') throw new Error(`Unknown current country: ${row.country_code}`);
    seen.add(row.institution_key);
  }
  const km = (row) => Number.isFinite(row.approximate_distance_km) && row.approximate_distance_km >= 0 ? row.approximate_distance_km : Infinity;
  return [...queue].sort((a, b) => tierFor(a, countries) - tierFor(b, countries) || km(a) - km(b) || compare(a.institution_key, b.institution_key));
}
function atomicJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${randomUUID()}.tmp`;
  try {
    fs.writeFileSync(temporary, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
    fs.renameSync(temporary, file);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}
function currentCountries(root) {
  const countries = new Map();
  // Profiles are the current worldwide scope; canonical destinations supply Denmark.
  for (const dir of ['data/destinations', 'data/countries']) {
    const full = path.join(root, dir);
    if (!fs.existsSync(full)) continue;
    for (const file of fs.readdirSync(full).filter((f) => f.endsWith('.json')).sort()) {
      const country = read(path.join(full, file));
      countries.set(country.code || country.id, country);
    }
  }
  return countries;
}
function realCommit(root, sha) {
  if (!/^(?:[a-f\d]{40}|[a-f\d]{64})$/i.test(sha || '')) throw new Error('Complete requires a full real local commit SHA');
  try {
    return execFileSync('git', ['rev-parse', '--verify', `${sha}^{commit}`], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch {
    throw new Error('Commit SHA does not identify a real local commit');
  }
}
function acceptedReview(report, key) {
  const url = (value) => { try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; } };
  if (!report || report.institution_key !== key || report.accepted !== true || typeof report.reviewer !== 'string' || !report.reviewer.trim() ||
      !Array.isArray(report.evidence) || !report.evidence.length || !report.evidence.every(url) ||
      !['admissions', 'imagery', 'format'].every((category) => Number.isFinite(report.scores?.[category]) && report.scores[category] >= 8 && report.scores[category] <= 10) ||
      report.validation?.fullGate !== true || report.validation?.cleanRelease !== true) {
    throw new Error('Review must name this institution, accepted:true, reviewer, evidence URLs, scores 8–10, and passing fullGate/cleanRelease');
  }
}

export class HourlyUniversities {
  constructor(root, { today = localDate(), now = () => new Date().toISOString(), verifyCommit = realCommit } = {}) {
    if (!validDate(today)) throw new Error('Invalid date: use YYYY-MM-DD');
    this.root = path.resolve(root);
    this.today = today;
    this.now = now;
    this.verifyCommit = verifyCommit;
    this.stateFile = path.join(this.root, 'docs/research/imports/hourly-state.json');
    this.lockDir = path.join(this.root, '.cache/hourly-university.lock');
  }
  ledger() {
    const state = optional(this.stateFile, { schema_version: 1, coverage_scope: 'finite-current-catalogue', institutions: {} });
    if (state.schema_version !== 1 || !state.institutions || typeof state.institutions !== 'object' || Array.isArray(state.institutions)) throw new Error('Invalid hourly ledger; manual attention required');
    for (const [key, entry] of Object.entries(state.institutions)) {
      if (!['in_progress', 'complete', 'deferred', 'failed'].includes(entry.state)) throw new Error(`Invalid ledger state for ${key}`);
      if (entry.state === 'deferred' && !validDate(entry.next_check_on)) throw new Error(`Invalid deferred date for ${key}`);
      if (entry.next_check_on && !validDate(entry.next_check_on)) throw new Error(`Invalid recheck date for ${key}`);
      if (entry.state === 'complete' && (!entry.commit || !entry.review)) throw new Error(`Uncommitted completion for ${key}; manual attention required`);
    }
    return state;
  }
  selection(state) {
    const rows = read(path.join(this.root, 'docs/research/imports/proximity-queue.json')).institutions;
    const candidates = optional(path.join(this.root, 'docs/research/imports/discovery-candidates.json'), { institutions: [] }).institutions;
    const keys = new Set(rows.map((row) => row.institution_key));
    const additions = candidates.filter((row) => { if (keys.has(row.institution_key)) return false; keys.add(row.institution_key); return true; });
    const countries = currentCountries(this.root);
    const queue = orderedInstitutions([...rows, ...additions], countries);
    const initial = optional(path.join(this.root, 'docs/research/imports/queue.json'), { items: [] }).items;
    const skipped = { complete: 0, deferred: 0, supported_exclusion: 0 };
    const futureChecks = [];
    for (const row of queue) {
      const entry = state.institutions[row.institution_key];
      if (entry?.state === 'complete') { skipped.complete++; continue; }
      if (['deferred', 'failed'].includes(entry?.state) && entry.next_check_on > this.today) { skipped.deferred++; futureChecks.push(entry.next_check_on); continue; }
      const school = optional(path.join(this.root, `data/schools/${row.institution_key}.json`), null);
      if ((school?.scope || row.scope) === 'none' && !entry) {
        const old = initial.find((item) => item.institution_key === row.institution_key);
        const dates = [school?.next_check_on, old?.next_check_on, ...(old?.open_items || []).map((item) => item.next_check_on)].filter(validDate).sort();
        if (!dates.length || dates[0] > this.today) { skipped.supported_exclusion++; if (dates[0]) futureChecks.push(dates[0]); continue; }
      }
      return { status: 'ready', institution: { ...row, scope: school?.scope || row.scope, action: row.model === 'discovery-candidate' ? 'resolve-aliases-and-duplicates-then-establish-accreditation-and-English-scope' : 'audit-or-complete-existing-institution', tier: tierFor(row, countries) }, skipped, queue_size: queue.length, discovery_candidates: additions.length, world_coverage_complete: false };
    }
    const dates = futureChecks.sort();
    return { status: dates.length || skipped.supported_exclusion ? 'no-actionable-institution' : 'queue-exhausted', next_check_on: dates[0] || null, skipped, queue_size: queue.length, world_coverage_complete: false,
      message: 'This finite catalogue queue cannot establish country, Europe, or world coverage; expand and audit the inventory separately.' };
  }
  next() {
    const state = this.ledger();
    const running = Object.entries(state.institutions).filter(([, entry]) => entry.state === 'in_progress').map(([institution_key, entry]) => ({ institution_key, ...entry }));
    if (fs.existsSync(this.lockDir) || running.length) return { status: 'needs-attention', message: 'An existing reservation or lock blocks selection. Inspect its owner and working tree; locks are never stolen automatically.', running, lock: path.relative(this.root, this.lockDir).replaceAll('\\', '/') };
    return this.selection(state);
  }
  reserve() {
    const preview = this.next();
    if (preview.status !== 'ready') return preview;
    fs.mkdirSync(path.dirname(this.lockDir), { recursive: true });
    try { fs.mkdirSync(this.lockDir); } catch (error) {
      if (error.code === 'EEXIST') return { status: 'needs-attention', message: 'Another reservation owns the shared lock; no work was selected.' };
      throw error;
    }
    // Once acquired, any error leaves the lock for explicit inspection.
    const state = this.ledger();
    if (Object.values(state.institutions).some((entry) => entry.state === 'in_progress')) return { status: 'needs-attention', message: 'An in-progress ledger entry blocks this reservation.' };
    const selected = this.selection(state);
    if (selected.status !== 'ready') { fs.rmdirSync(this.lockDir); return selected; }
    const key = selected.institution.institution_key;
    const run = { state: 'in_progress', run_id: randomUUID(), started_at: this.now() };
    atomicJson(path.join(this.lockDir, 'owner.json'), { institution_key: key, ...run, pid: process.pid });
    const previous = state.institutions[key];
    state.institutions[key] = { ...run, attempts: previous ? [...(previous.attempts || []), Object.fromEntries(Object.entries(previous).filter(([name]) => name !== 'attempts'))] : [] };
    state.updated_at = this.now();
    atomicJson(this.stateFile, state);
    return { ...selected, status: 'reserved', run_id: run.run_id, started_at: run.started_at };
  }
  finish({ runId, state: outcome, review, commit, reason, nextCheckOn } = {}) {
    // Validate every argument and evidence requirement before touching either ledger or lock.
    if (!runId || !['complete', 'deferred', 'failed'].includes(outcome) || !review) throw new Error('Finish requires exact run ID, --state complete|deferred|failed, and --review file');
    if (outcome !== 'complete' && (typeof reason !== 'string' || !reason.trim())) throw new Error('Deferred/failed finish requires --reason');
    if (outcome === 'deferred' && (!validDate(nextCheckOn) || nextCheckOn <= this.today)) throw new Error('Deferred finish requires a future --next-check-on YYYY-MM-DD');
    if (nextCheckOn && (outcome === 'complete' || !validDate(nextCheckOn) || nextCheckOn <= this.today)) throw new Error('Recheck dates must be future calendar dates on deferred/failed outcomes');
    const state = this.ledger();
    const pair = Object.entries(state.institutions).find(([, entry]) => entry.state === 'in_progress' && entry.run_id === runId);
    if (!pair) throw new Error('No in-progress reservation matches this exact run ID');
    const [key] = pair;
    const ownerFile = path.join(this.lockDir, 'owner.json');
    const owner = optional(ownerFile, null);
    if (owner?.run_id !== runId || owner.institution_key !== key) throw new Error('Lock owner does not match the exact reservation; manual attention required');
    const reviewFile = path.resolve(this.root, review);
    const relative = path.relative(this.root, reviewFile);
    if (!relative || relative.startsWith(`..${path.sep}`) || relative === '..' || path.isAbsolute(relative)) throw new Error('Review must be a file within the repository');
    if (!fs.statSync(reviewFile).isFile() || !fs.readFileSync(reviewFile, 'utf8').trim()) throw new Error('Review must be a nonempty file');
    let resolvedCommit;
    if (outcome === 'complete') {
      acceptedReview(read(reviewFile), key);
    }
    if (outcome === 'complete' || commit) resolvedCommit = this.verifyCommit(this.root, commit);
    const ownsReservation = () => {
      const current = optional(ownerFile, null);
      return current?.run_id === runId && current.institution_key === key;
    };
    // Validation may take long enough for another finisher to complete this run.
    if (!ownsReservation()) throw new Error('Reservation changed before finish; manual attention required');
    // A guard belongs to one run, outside the reusable reservation directory. A
    // stale finisher cannot leave a marker inside (or block cleanup of) a new run.
    const finishing = `${this.lockDir}.finishing-${encodeURIComponent(runId)}`;
    try { fs.mkdirSync(finishing); } catch (error) {
      if (error.code === 'EEXIST') throw new Error('A finish is already running or needs manual attention');
      throw error;
    }
    try {
      const latest = this.ledger();
      if (latest.institutions[key]?.state !== 'in_progress' || latest.institutions[key]?.run_id !== runId || !ownsReservation()) throw new Error('Reservation changed before finish; manual attention required');
      latest.institutions[key] = { ...latest.institutions[key], state: outcome, finished_at: this.now(), review: relative.replaceAll('\\', '/'), ...(resolvedCommit ? { commit: resolvedCommit } : {}), ...(reason ? { reason: reason.trim() } : {}), ...(nextCheckOn ? { next_check_on: nextCheckOn } : {}) };
      latest.updated_at = this.now();
      atomicJson(this.stateFile, latest);
      fs.unlinkSync(ownerFile);
      fs.rmdirSync(this.lockDir);
      return { status: outcome, institution_key: key, run_id: runId, world_coverage_complete: false };
    } finally {
      // Only the caller that created this exact per-run guard may remove it.
      fs.rmdirSync(finishing);
    }
  }
}
