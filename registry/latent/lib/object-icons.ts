import { Flag, Layers, Route, Star, Users, Wrench, type LucideIcon } from "lucide-react";

/** One icon per triage object, used everywhere the object appears (nav, counts, related lists). */
export const OBJECT_ICONS = {
  path: Route,
  remediation: Wrench,
  finding: Flag,
  resource: Layers,
  crownJewel: Star,
  owner: Users,
} satisfies Record<string, LucideIcon>;

export type ObjectKind = keyof typeof OBJECT_ICONS;
