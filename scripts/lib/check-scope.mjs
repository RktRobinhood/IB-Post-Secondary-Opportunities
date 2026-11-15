import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const gitAt = root => args => spawnSync('git', args, { cwd: root, encoding: 'utf8' });
const settings = env => ({ base: (env.SITE_BASE || '').replace(/\/$/, ''), origin: env.SITE_ORIGIN || '',
  today: env.SITE_TODAY || new Date().toISOString().slice(0, 10) });
const validBaseline = (baseline, env) => /^[a-f0-9]{7,64}$/.test(baseline?.revision || '') && baseline.base === settings(env).base &&
  baseline.origin === settings(env).origin && baseline.today === settings(env).today && baseline.dirty && typeof baseline.dirty === 'object' && !Array.isArray(baseline.dirty);
function changedFiles(git, revision) {
  const changed = git(['diff', '--no-renames', '--name-only', '-z', revision, '--']);
  const untracked = git(['ls-files', '--others', '--exclude-standard', '-z']);
  if (changed.status !== 0 || untracked.status !== 0) throw new Error('Cannot inspect Git changes');
  return [...new Set((changed.stdout + untracked.stdout).split('\0').filter(Boolean))];
}
async function workingHash(root, file, git) {
  const target = path.resolve(root, file);
  const relative = path.relative(root, target);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Invalid baseline path');
  try { await fs.lstat(target); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  const hash = git(['hash-object', '--no-filters', '--', file]);
  if (hash.status !== 0) throw new Error('Cannot fingerprint build input');
  return hash.stdout.trim();
}

/** Capture dirty inputs too: a preview built from uncommitted files is valid. */
export async function buildBaseline({ root, env = process.env }) {
  const git = gitAt(root);
  const head = git(['rev-parse', 'HEAD']);
  if (head.status !== 0) return null;
  const revision = head.stdout.trim();
  try {
    const dirty = {};
    for (const file of changedFiles(git, revision)) dirty[file] = await workingHash(root, file, git);
    return { revision, ...settings(env), dirty };
  } catch { return null; }
}

/** Keep track of what each quick build actually wrote, including reverted edits. */
export async function schoolBuildBaseline({ root, baseline, key, env = process.env }) {
  if (!validBaseline(baseline, env) || !/^[a-z][a-z0-9-]*$/.test(key || '')) return null;
  const file = `data/schools/${key}.json`;
  try { return { ...baseline, dirty: { ...baseline.dirty, [file]: await workingHash(root, file, gitAt(root)) } }; }
  catch { return null; }
}

/** A quick gate needs a full-build baseline and exactly one changed school. */
export async function checkScope({ root, dist, full = false, env = process.env }) {
  if (full || (env.CI && env.CI !== 'false')) return null;
  let baseline;
  try { baseline = JSON.parse(await fs.readFile(path.join(dist, '.build-info.json'), 'utf8')); }
  catch { return null; }
  if (!validBaseline(baseline, env)) return null;
  const git = gitAt(root);
  try {
    const candidates = new Set([...changedFiles(git, baseline.revision), ...Object.keys(baseline.dirty)]);
    const files = [];
    for (const file of candidates) {
      const stored = git(['rev-parse', '--verify', `${baseline.revision}:${file}`]);
      const expected = Object.hasOwn(baseline.dirty, file) ? baseline.dirty[file] : stored.status === 0 ? stored.stdout.trim() : null;
      if (await workingHash(root, file, git) !== expected) files.push(file);
    }
    if (files.length !== 1) return null;
    return /^data\/schools\/([a-z][a-z0-9-]*)\.json$/.exec(files[0])?.[1] || null;
  } catch { return null; }
}
