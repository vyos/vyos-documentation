import { describe, it, expect } from "vitest";
import { uaVerdict } from "../src/uagate";
import policy from "../ua-policy.json";

describe("UA gate (§3.2.1) — ships log-only for AI crawlers", () => {
  it("search engines always allowed", () => {
    expect(uaVerdict("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", policy)).toBe("allow");
    expect(uaVerdict("Mozilla/5.0 (compatible; bingbot/2.0)", policy)).toBe("allow");
  });
  it("AI-training crawlers are log-only initially", () => {
    expect(uaVerdict("GPTBot/1.0", policy)).toBe("log");
    expect(uaVerdict("CCBot/2.0", policy)).toBe("log");
  });
  it("named abusers blocked", () => {
    expect(uaVerdict("EvilScraper/0.1", { ...policy, block: ["EvilScraper"] })).toBe("block");
  });
  it("unknown UA → allow (fail-open for humans)", () => {
    expect(uaVerdict("Mozilla/5.0 (X11; Linux x86_64) Firefox/128.0", policy)).toBe("allow");
  });
  it("Applebot is allowed but Applebot-Extended is logged — most-specific match wins", () => {
    // Apple's AI-training crawler token CONTAINS the search crawler's, so plain
    // substring matching with a fixed allow-before-log precedence let the allow entry
    // swallow it: the AI crawler was allowed AND never logged, unlike every other AI
    // crawler in the log list.
    expect(uaVerdict("Mozilla/5.0 (compatible; Applebot/0.1; +http://www.apple.com/go/applebot)", policy)).toBe("allow");
    expect(uaVerdict("Mozilla/5.0 (compatible; Applebot-Extended/0.1)", policy)).toBe("log");
  });
  it("Google-Extended is not a UA token — it must not sit in the UA policy at all", () => {
    // Google-Extended is a robots.txt user-agent control token; it never appears in a
    // User-Agent header, so an entry for it could only ever be dead weight.
    // Compared case-INSENSITIVELY on both sides: bestMatch() lowercases every policy entry
    // before matching, so "google-extended" would be functionally identical to the token
    // this guard exists to keep out — but toContain() compares primitives by strict
    // equality, so a lowercase variant would sail past a case-sensitive assertion and
    // quietly restore the entry. Match the matcher's own case semantics.
    const entries = [...policy.allow, ...policy.log, ...policy.block].map((e) => e.toLowerCase());
    expect(entries).not.toContain("google-extended");
  });
  it("block takes precedence over allow on a UA matching both lists", () => {
    const dualMatch = { ...policy, allow: ["Googlebot"], block: ["Googlebot EvilScraper"] };
    expect(uaVerdict("Mozilla/5.0 (compatible; Googlebot EvilScraper/1.0)", dualMatch)).toBe("block");
  });

  // --- allow-vs-log contests. Pinned verdicts for the four UAs that distinguish every
  // candidate rule, so a future tweak to the precedence cannot silently drop telemetry. ---

  it("a UA carrying BOTH a log token and a longer allow token is logged, not allowed", () => {
    // "GPTBot/1.0 DuckDuckBot" matches allow "DuckDuckBot" (11 chars) and log "GPTBot" (6).
    // Under the longest-match rule the longer ALLOW needle won and the ua-log event never
    // fired; under the original allow-before-log rule it also won. A UA presenting two
    // different crawlers' tokens is precisely the shape worth recording, and `log` costs
    // nothing but a log line — the request is served either way.
    expect(uaVerdict("GPTBot/1.0 DuckDuckBot", policy)).toBe("log");
  });

  it("pinned verdicts for the four discriminating UAs", () => {
    expect(uaVerdict("Mozilla/5.0 (compatible; Applebot/0.1)", policy)).toBe("allow");
    expect(uaVerdict("Mozilla/5.0 (compatible; Applebot-Extended/0.1)", policy)).toBe("log");
    expect(uaVerdict("GPTBot/1.0 DuckDuckBot", policy)).toBe("log");
    expect(uaVerdict("Mozilla/5.0 (compatible; Googlebot/2.1)", policy)).toBe("allow");
  });

  it("a narrow allow entry no longer overrides a matched log entry — log wins outright", () => {
    // This branch used to return "allow" when the matched allow entry strictly CONTAINED
    // the matched log entry, so a policy could carve a narrow allow out of a broad log
    // entry. Removed as spoofable (see the next test). Both rows are now "log", which is
    // the safe verdict — the request is still served either way; only telemetry differs.
    const carveOut = { allow: ["Bytespider-Search"], log: ["Bytespider"], block: [] };
    expect(uaVerdict("Bytespider-Search/1.0", carveOut)).toBe("log");
    expect(uaVerdict("Bytespider/1.0", carveOut)).toBe("log");
  });

  it("the removed carve-out was spoofable by quoting both tokens independently", () => {
    // The concrete bypass. Containment was tested between the two matched ENTRIES, never
    // against the UA's own token structure, so a request-controlled string naming both
    // tokens separately matched allow "Bytespider-Search" and log "Bytespider", satisfied
    // the containment test, and bought the AI crawler an `allow`. It must be logged.
    const carveOut = { allow: ["Bytespider-Search"], log: ["Bytespider"], block: [] };
    expect(uaVerdict("Bytespider/2.0 Bytespider-Search/1.0", carveOut)).toBe("log");
  });

  it("dropping the carve-out leaves every SHIPPED-policy verdict unchanged", () => {
    // The vendor pair the shipped policy actually depends on runs the other way round: log
    // "Applebot-Extended" is LONGER than allow "Applebot", so the allow entry never
    // contained the log entry and log already won. No pair in ua-policy.json took the
    // removed branch, so its removal is behaviour-preserving for what we ship.
    expect(uaVerdict("Mozilla/5.0 (compatible; Applebot/0.1)", policy)).toBe("allow");
    expect(uaVerdict("Mozilla/5.0 (compatible; Applebot-Extended/0.1)", policy)).toBe("log");
  });

  it("an entry present in BOTH lists resolves to log, not allow", () => {
    // Equality is not containment. Listing the same token twice is an authoring error, and
    // `log` is the resolution that cannot lose data.
    const contradictory = { allow: ["CCBot"], log: ["CCBot"], block: [] };
    expect(uaVerdict("CCBot/2.0", contradictory)).toBe("log");
  });

  it("block still short-circuits ahead of the allow-vs-log contest", () => {
    const all3 = { allow: ["DuckDuckBot"], log: ["GPTBot"], block: ["EvilScraper"] };
    expect(uaVerdict("GPTBot/1.0 DuckDuckBot EvilScraper", all3)).toBe("block");
  });
});
