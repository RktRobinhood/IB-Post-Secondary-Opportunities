/**
 * One definition of "this host refuses robots", for every tool that needs it.
 *
 * WHY THIS EXISTS
 *
 * Two tools in this repository learned the same distinction separately and only
 * one of them got it right.
 *
 * `check-institution-links.mjs` was built around it: a host that returns 403 to
 * everything is not a dead link, it is a host we cannot read, and the verdict is
 * `unknowable` rather than `broken`. It records those hosts in
 * `link-policy.json` with a reason and a date.
 *
 * `verify-evidence.mjs` had it backwards. It marked any unreachable source
 * `unavailable`, which `release-check.mjs` gates on, and so a 403 from a host
 * a counsellor can open perfectly well blocked the release over ten live pages.
 *
 * Same distinction, two tools, opposite answers, and no shared definition to
 * disagree with. So the definition lives here, and a host discovered by either
 * tool is known to both.
 *
 * `link-policy.json` stays the record; this is only the reader.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const POLICY_FILE = path.resolve(import.meta.dirname, 'link-policy.json');

/** Lowercased host, or '' when the URL will not parse. */
export function hostOf(url) {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Statuses that mean "we were refused", as distinct from "it is not there".
 *
 * 404 and 410 are absent on purpose: those mean gone, and a claim whose source
 * is gone must not be published as current. Everything here is a page that very
 * likely still exists and that this project cannot fetch.
 */
export const REFUSAL_STATUS = new Set([401, 403, 405, 406, 418, 423, 429, 451, 500, 502, 503, 504]);

export const isRefusal = (status) => REFUSAL_STATUS.has(Number(status));
export const isGone = (status) => Number(status) === 404 || Number(status) === 410;

export async function loadLinkPolicy() {
  let raw;
  try {
    raw = JSON.parse(await fs.readFile(POLICY_FILE, 'utf8'));
  } catch {
    raw = {};
  }

  const refusingHosts = new Map(
    (raw.hostsThatRefuseAutomatedRetrieval || []).map((e) => [String(e.host || '').toLowerCase(), e])
  );

  return {
    refusingHosts,

    /** The recorded entry for a URL's host, or null. */
    refusalFor(url) {
      return refusingHosts.get(hostOf(url)) || null;
    },

    /** Is this URL on a host we already know refuses us? */
    isKnownRefuser(url) {
      return refusingHosts.has(hostOf(url));
    },

    /**
     * What a tool should say about a failed fetch.
     *
     * The third case is the useful one: a host that refused us and is NOT yet
     * recorded is a finding worth surfacing, because the next tool to meet it
     * will otherwise rediscover it from scratch — which is exactly what
     * happened here.
     */
    classify(url, status, error) {
      if (isGone(status)) {
        return { kind: 'gone', gates: true, reason: `source is gone (HTTP ${status})` };
      }
      const known = this.refusalFor(url);
      if (known) {
        return {
          kind: 'refused-known',
          gates: false,
          reason: `host refuses automated retrieval, which is recorded: ${known.reason}`,
        };
      }
      if (isRefusal(status) || !status) {
        return {
          kind: 'refused-new',
          gates: false,
          reason:
            `host refuses automated fetching (${error || `HTTP ${status}`}) and is not yet in ` +
            `link-policy.json — open it by hand, and record the host there if it refuses everything`,
        };
      }
      return { kind: 'unreadable', gates: false, reason: error || `HTTP ${status}` };
    },
  };
}
