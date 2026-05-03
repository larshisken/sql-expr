import type { BinaryOperator } from "./operators.js";

export const binaryNodeType = "be";
export const columnNodeType = "cre";
export const listNodeType = "le";
export const booleanLiteralNodeType = "ble";
export const numberLiteralNodeType = "nle";
export const stringLiteralNodeType = "sle";
export const nullNodeType = "ne";
export const callNodeType = "ce";

export type Binary = {
  readonly $t: typeof binaryNodeType;
  readonly l: Node;
  readonly op: BinaryOperator;
  readonly r: Node;
};

export type Column = {
  readonly $t: typeof columnNodeType;
  readonly r: string;
};

export type List = {
  readonly $t: typeof listNodeType;
  readonly v: readonly Node[];
};

export type Boolean = {
  readonly $t: typeof booleanLiteralNodeType;
  readonly v: boolean;
};

export type Number = {
  readonly $t: typeof numberLiteralNodeType;
  readonly v: number;
};

export type String = {
  readonly $t: typeof stringLiteralNodeType;
  readonly v: string;
};

export type Null = {
  readonly $t: typeof nullNodeType;
};

export type Call = {
  readonly $t: typeof callNodeType;
  readonly f: string;
};

export type Node =
  | Binary
  | Column
  | List
  | Boolean
  | Number
  | String
  | Null
  | Call;
