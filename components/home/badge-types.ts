export const BADGES = [
  { label: "Dog Dad", key: "dog-dad" },
  { label: "Human Father", key: "human-father" },
  { label: "Husband", key: "husband" },
  { label: "Tinkerer", key: "tinkerer" },
  { label: "designing and building", key: "designing-building" },
] as const;

export type BadgeKey =
  | (typeof BADGES)[number]["key"]
  | "write"
  | "cv"
  | "contact"
  | "last-10-years"
  | null;

export type PreviewSide = "left" | "right";
