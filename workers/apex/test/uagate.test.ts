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
    expect([...policy.allow, ...policy.log, ...policy.block]).not.toContain("Google-Extended");
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

  it("an allow entry that STRICTLY CONTAINS the matched log entry is a deliberate exception", () => {
    // The mirror image of the Applebot case: a vendor shipping a broad token that is logged
    // plus a narrower variant that is allowed. No pair in the shipped ua-policy.json takes
    // this branch today — it keeps both directions of the vendor-variant pattern
    // expressible, since the shipped policy already relies on one of them.
    const carveOut = { allow: ["Bytespider-Search"], log: ["Bytespider"], block: [] };
    expect(uaVerdict("Bytespider-Search/1.0", carveOut)).toBe("allow");
    expect(uaVerdict("Bytespider/1.0", carveOut)).toBe("log");
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
