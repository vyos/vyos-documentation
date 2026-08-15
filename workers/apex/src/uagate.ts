export interface UaPolicy {
  allow: string[];
  log: string[];
  block: string[];
}

export type UaVerdict = "allow" | "block" | "log";

/** Length of the longest entry in `list` occurring in the (already-lowercased) UA, or 0. */
function longestMatch(lowerUa: string, list: string[]): number {
  return list.reduce(
    (best, needle) => (lowerUa.includes(needle.toLowerCase()) ? Math.max(best, needle.length) : best),
    0,
  );
}

export function uaVerdict(ua: string, policy: UaPolicy): UaVerdict {
  const lowerUa = ua.toLowerCase();
  // Explicit blocks take precedence — a request-controlled UA string that spoofs an
  // allow-listed substring (e.g. "Googlebot EvilScraper") must not be able to bypass a
  // block entry just by also matching the allow list.
  if (longestMatch(lowerUa, policy.block) > 0) return "block";

  // Between allow and log the MOST SPECIFIC match wins. Substring matching with a fixed
  // allow-before-log precedence cannot express "allow Applebot, log Applebot-Extended":
  // Apple's AI-training crawler token literally contains the search crawler's, so the allow
  // entry swallowed it and that crawler was allowed AND never logged — inconsistent with
  // every other AI crawler in the log list. Comparing matched-needle length resolves it
  // without per-entry escapes; equal-length matches keep the allow-before-log tie-break.
  const allow = longestMatch(lowerUa, policy.allow);
  const log = longestMatch(lowerUa, policy.log);
  if (allow > 0 && allow >= log) return "allow";
  if (log > 0) return "log";
  return "allow"; // fail-open default
}
