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
});
