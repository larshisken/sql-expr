import type { BinaryOperator } from "./types.js";
import type {
  Binary,
  Boolean,
  Call,
  Column,
  Node,
  List,
  Null,
  Number,
  String,
} from "./types/nodes.js";
import {
  binaryNodeType,
  booleanLiteralNodeType,
  callNodeType,
  columnNodeType,
  listNodeType,
  nullNodeType,
  numberLiteralNodeType,
  stringLiteralNodeType,
} from "./types/nodes.js";

function createColumnNode(ref: string): Column {
  return {
    $t: columnNodeType,
    r: ref,
  };
}

function createBooleanNode(value: boolean): Boolean {
  return {
    $t: booleanLiteralNodeType,
    v: value,
  };
}

function createNumberNode(value: number): Number {
  return {
    $t: numberLiteralNodeType,
    v: value,
  };
}

function createStringNode(value: string): String {
  return {
    $t: stringLiteralNodeType,
    v: value,
  };
}

function createListNode(values: readonly Node[]): List {
  return {
    $t: listNodeType,
    v: values,
  };
}

function createNullNode(): Null {
  return {
    $t: nullNodeType,
  };
}

function createCallNode(func: string): Call {
  return {
    $t: callNodeType,
    f: func,
  };
}

export function createBinaryNode(
  left: Node,
  operator: BinaryOperator,
  right: Node,
): Binary {
  return {
    $t: binaryNodeType,
    l: left,
    op: operator,
    r: right,
  };
}

// Comparison operations
function createEqualsNode(left: Node, right: Node): Binary {
  return createBinaryNode(left, "Eq", right);
}

function createNotEqualsNode(left: Node, right: Node): Binary {
  return createBinaryNode(left, "Ne", right);
}

function createGreaterThanNode(left: Node, right: Node): Binary {
  return createBinaryNode(left, "Gt", right);
}

function createGreaterThanOrEqualNode(left: Node, right: Node): Binary {
  return createBinaryNode(left, "Gte", right);
}

function createLessThanNode(left: Node, right: Node): Binary {
  return createBinaryNode(left, "Lt", right);
}

function createLessThanOrEqualNode(left: Node, right: Node): Binary {
  return createBinaryNode(left, "Lte", right);
}

function createLikeNode(left: Node, right: Node): Binary {
  return createBinaryNode(left, "Like", right);
}

function createInNode(left: Node, right: Node): Binary {
  return createBinaryNode(left, "In", right);
}

// Logical operations
function createAndNode(left: Node, right: Node): Binary {
  return createBinaryNode(left, "And", right);
}

function createOrNode(left: Node, right: Node): Binary {
  return createBinaryNode(left, "Or", right);
}

// Arithmetic operations
function createAddNode(left: Node, right: Node): Binary {
  return createBinaryNode(left, "+", right);
}

function createSubtractNode(left: Node, right: Node): Binary {
  return createBinaryNode(left, "-", right);
}

function createMultiplyNode(left: Node, right: Node): Binary {
  return createBinaryNode(left, "*", right);
}

function createDivideNode(left: Node, right: Node): Binary {
  return createBinaryNode(left, "/", right);
}

export const factory = {
  // Node creators
  binary: createBinaryNode,
  column: createColumnNode,
  list: createListNode,
  bool: createBooleanNode,
  number: createNumberNode,
  string: createStringNode,
  null: createNullNode,
  call: createCallNode,

  // Comparison operations
  equals: createEqualsNode,
  notEquals: createNotEqualsNode,
  greaterThan: createGreaterThanNode,
  greaterThanOrEqual: createGreaterThanOrEqualNode,
  lessThan: createLessThanNode,
  lessThanOrEqual: createLessThanOrEqualNode,
  like: createLikeNode,
  in: createInNode,

  // Logical operations
  and: createAndNode,
  or: createOrNode,

  // Arithmetic operations
  add: createAddNode,
  subtract: createSubtractNode,
  multiply: createMultiplyNode,
  divide: createDivideNode,

  // Operators namespace
  operators: {
    and: "And",
    equals: "Eq",
    greaterThan: "Gt",
    greaterThanOrEqual: "Gte",
    in: "In",
    like: "Like",
    lessThan: "Lt",
    lessThanOrEqual: "Lte",
    notEquals: "Ne",
    or: "Or",
    add: "+",
    subtract: "-",
    divide: "/",
    multiply: "*",
  },
} as const;
