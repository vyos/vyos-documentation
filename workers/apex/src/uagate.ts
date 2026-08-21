export interface UaPolicy {
  allow: string[];
  log: string[];
  block: string[];
}

export type UaVerdict = "allow" | "block" | "log";

/**
 * The LONGEST entry in `list` occurring in the (already-lowercased) UA, lowercased, or null.
 * Longest rather than first-hit so the containment test in uaVerdict() compares against the
 * most specific entry a multi-token UA matched, not an arbitrary earlier one.
 */
function bestMatch(lowerUa: string, list: string[]): string | null {
  return list.reduce<string | null>((best, entry) => {
    const needle = entry.toLowerCase();
    if (!lowerUa.includes(needle)) return best;
    return best === null || needle.length > best.length ? needle : best;
  }, null);
}

export function uaVerdict(ua: string, policy: UaPolicy): UaVerdict {
  const lowerUa = ua.toLowerCase();
  // Explicit blocks take precedence — a request-controlled UA string that spoofs an
  // allow-listed substring (e.g. "Googlebot EvilScraper") must not be able to bypass a
  // block entry just by also matching the allow list.
  if (bestMatch(lowerUa, policy.block) !== null) return "block";

  // A log match WINS over any competing allow match, unconditionally. `log` is a telemetry
  // verdict, not a denial (the request is served either way), so resolving a contest the
  // wrong way is asymmetric: choosing `allow` loses the ua-log event permanently, while
  // choosing `log` costs one log line. A UA presenting BOTH an allow token and a log token
  // (e.g. "GPTBot/1.0 DuckDuckBot") is exactly the shape worth recording.
  //
  // There used to be a carve-out here: a matched allow entry that strictly CONTAINED the
  // matched log entry won, so a policy could express a narrow allow exception inside a
  // broader log entry (log "Foo", allow "Foo-Search"). It is gone, for two reasons. It was
  // spoofable — containment was tested between the two matched ENTRIES, never against the
  // UA's own token structure, so a caller writing "Bytespider/2.0 Bytespider-Search/1.0"
  // matched both entries as independent tokens and bought itself `allow`, and the UA
  // string is entirely request-controlled. And it bought nothing: no entry pair in
  // ua-policy.json takes that branch. The pair the shipped policy does depend on runs the
  // OTHER way — Apple ships "Applebot" (search, allow) and "Applebot-Extended" (AI
  // training, log), where the log entry is the longer one, so there is no containment and
  // log wins regardless. Losing the carve-out costs a future narrow-allow vendor variant
  // nothing worse than being logged as well as served.
  return bestMatch(lowerUa, policy.log) === null ? "allow" : "log"; // unknown UAs fail open
}
