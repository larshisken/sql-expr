import { describe, it, expect } from "vitest";
import { factory } from "../../src/factory.js";
import {
  binaryNodeType,
  columnNodeType,
  stringLiteralNodeType,
} from "../../src/types/nodes.js";

describe("factory", () => {
  it("should create a column reference node", () => {
    const expr = factory.column("customer.name");

    expect(expr).toEqual({
      $t: columnNodeType,
      r: "customer.name",
    });
  });

  it("should create a string literal node", () => {
    const expr = factory.string("test");

    expect(expr).toEqual({
      $t: stringLiteralNodeType,
      v: "test",
    });
  });

  it("should create a binary node", () => {
    const left = factory.column("customer.segment");
    const right = factory.string("Enterprise");
    const expr = factory.binary(left, factory.operators.equals, right);

    expect(expr).toEqual({
      $t: binaryNodeType,
      l: left,
      op: "Eq",
      r: right,
    });
  });

  it("should create an equals node using specific function", () => {
    const left = factory.column("customer.segment");
    const right = factory.string("Enterprise");
    const expr = factory.equals(left, right);

    expect(expr).toEqual({
      $t: binaryNodeType,
      l: left,
      op: "Eq",
      r: right,
    });
  });

  it("should create complex nested nodes", () => {
    const expr = factory.and(
      factory.greaterThan(
        factory.column("customer.revenue"),
        factory.number(1000),
      ),
      factory.in(
        factory.column("customer.status"),
        factory.list([factory.string("active"), factory.string("trial")]),
      ),
    );

    expect(expr.$t).toBe(binaryNodeType);
    expect(expr.op).toBe("And");
  });

  it("should create arithmetic operations", () => {
    const addExpr = factory.add(factory.number(5), factory.number(3));
    const subtractExpr = factory.subtract(factory.number(10), factory.number(4));
    const multiplyExpr = factory.multiply(factory.number(2), factory.number(6));
    const divideExpr = factory.divide(factory.number(8), factory.number(2));

    expect(addExpr.op).toBe("+");
    expect(subtractExpr.op).toBe("-");
    expect(multiplyExpr.op).toBe("*");
    expect(divideExpr.op).toBe("/");
  });

  it("should create comparison operations", () => {
    const notEqualsExpr = factory.notEquals(factory.number(1), factory.number(2));
    const greaterThanExpr = factory.greaterThan(factory.number(5), factory.number(3));
    const lessThanExpr = factory.lessThan(factory.number(2), factory.number(7));
    const likeExpr = factory.like(factory.column("name"), factory.string("%john%"));

    expect(notEqualsExpr.op).toBe("Ne");
    expect(greaterThanExpr.op).toBe("Gt");
    expect(lessThanExpr.op).toBe("Lt");
    expect(likeExpr.op).toBe("Like");
  });
});
