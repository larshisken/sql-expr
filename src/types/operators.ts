export const binaryOperator = [
  "And",
  "Eq",
  "Gt",
  "Gte",
  "In",
  "Like",
  "Lt",
  "Lte",
  "Ne",
  "Or",
  "+",
  "-",
  "/",
  "*",
] as const;

export type BinaryOperator = (typeof binaryOperator)[number];