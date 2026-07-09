export interface UaPolicy {
  allow: string[];
  log: string[];
  block: string[];
}

export type UaVerdict = "allow" | "block" | "log";

export function uaVerdict(ua: string, policy: UaPolicy): UaVerdict {
  const hit = (list: string[]) => list.some((n) => ua.toLowerCase().includes(n.toLowerCase()));
  if (hit(policy.allow)) return "allow"; // allow wins — search engines never blocked
  if (hit(policy.block)) return "block";
  if (hit(policy.log)) return "log";
  return "allow"; // fail-open default
}
