import { describe, it, expect } from "vitest";
import { factory } from "../../src/factory.js";
import { buildSql } from "../../src/builders.js";
import type { QuerySchema } from "../../src/types/schema.js";

describe("buildSql", () => {
  it("should build a simple equality SQL string", () => {
    const schema: QuerySchema = {
      columns: {
        "user.name": { table: "users", column: "name" },
      },
    };

    const expression = factory.equals(
      factory.column("user.name"),
      factory.string("John"),
    );

    const result = buildSql(expression, schema);

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      const {
        value: { sql, values },
      } = result;

      expect(sql).toBe('"users"."name" = $1');
      expect(values).toEqual(["John"]);
    }
  });

  it("should build a complex AND SQL string", () => {
    const schema: QuerySchema = {
      columns: {
        "user.age": { table: "users", column: "age" },
        "user.status": { table: "users", column: "status" },
      },
    };

    const expression = factory.and(
      factory.greaterThan(
        factory.column("user.age"),
        factory.number(18),
      ),
      factory.equals(
        factory.column("user.status"),
        factory.string("active"),
      ),
    );

    const result = buildSql(expression, schema);

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      const {
        value: { sql, values },
      } = result;

      expect(sql).toBe('("users"."age" > $1 AND "users"."status" = $2)');
      expect(values).toEqual([18, "active"]);
    }
  });

  it("should build an IN clause SQL string", () => {
    const schema: QuerySchema = {
      columns: {
        status: { table: "orders", column: "status" },
      },
    };

    const expression = factory.in(
      factory.column("status"),
      factory.list([
        factory.string("active"),
        factory.string("pending"),
        factory.string("trial"),
      ]),
    );

    const result = buildSql(expression, schema);

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      const {
        value: { sql, values },
      } = result;

      expect(sql).toBe('"orders"."status" IN ($1, $2, $3)');
      expect(values).toEqual(["active", "pending", "trial"]);
    }
  });

  it("should handle JSON field extraction (->)", () => {
    const schema: QuerySchema = {
      columns: {
        "user.profile.name": {
          table: "users",
          column: "profile_data",
          jsonOperations: [{ type: "->", key: "name" }],
        },
      },
    };

    const expression = factory.equals(
      factory.column("user.profile.name"),
      factory.string("John"),
    );

    const result = buildSql(expression, schema);

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      const {
        value: { sql, values },
      } = result;

      expect(sql).toBe('"users"."profile_data" -> \'name\' = $1');
      expect(values).toEqual(["John"]);
    }
  });

  it("should handle JSON array index extraction (->)", () => {
    const schema: QuerySchema = {
      columns: {
        "items.first": {
          table: "orders",
          column: "items",
          jsonOperations: [{ type: "->", index: 0 }],
        },
      },
    };

    const expression = factory.equals(
      factory.column("items.first"),
      factory.string("widget"),
    );

    const result = buildSql(expression, schema);

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      const {
        value: { sql, values },
      } = result;

      expect(sql).toBe('"orders"."items" -> 0 = $1');
      expect(values).toEqual(["widget"]);
    }
  });

  it("should handle JSON field text extraction (->>)", () => {
    const schema: QuerySchema = {
      columns: {
        "user.name": {
          table: "users",
          column: "data",
          jsonOperations: [{ type: "->>", key: "name" }],
        },
      },
    };

    const expression = factory.equals(
      factory.column("user.name"),
      factory.string("John"),
    );

    const result = buildSql(expression, schema);

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      const {
        value: { sql, values },
      } = result;

      expect(sql).toBe('"users"."data" ->> \'name\' = $1');
      expect(values).toEqual(["John"]);
    }
  });

  it("should handle JSON path extraction (#>)", () => {
    const schema: QuerySchema = {
      columns: {
        "nested.value": {
          table: "documents",
          column: "content",
          jsonOperations: [{ type: "#>", path: ["a", "b", 1] }],
        },
      },
    };

    const expression = factory.equals(
      factory.column("nested.value"),
      factory.string("bar"),
    );

    const result = buildSql(expression, schema);

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      const {
        value: { sql, values },
      } = result;

      expect(sql).toBe('"documents"."content" #> \'{"a","b",1}\' = $1');
      expect(values).toEqual(["bar"]);
    }
  });

  it("should handle JSON path text extraction (#>>)", () => {
    const schema: QuerySchema = {
      columns: {
        "nested.text": {
          table: "documents",
          column: "content",
          jsonOperations: [{ type: "#>>", path: ["user", "preferences", 0] }],
        },
      },
    };

    const expression = factory.equals(
      factory.column("nested.text"),
      factory.string("dark"),
    );

    const result = buildSql(expression, schema);

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      const {
        value: { sql, values },
      } = result;

      expect(sql).toBe(
        '"documents"."content" #>> \'{"user","preferences",0}\' = $1',
      );

      expect(values).toEqual(["dark"]);
    }
  });

  it("should handle schema mapping", () => {
    const schema: QuerySchema = {
      columns: {
        "user.name": {
          table: "customers",
          column: "full_name",
        },
        "user.email": {
          table: "customers",
          column: "email_address",
        },
      },
    };

    const expression = factory.equals(
      factory.column("user.name"),
      factory.string("John"),
    );

    const result = buildSql(expression, schema);

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      const {
        value: { sql, values },
      } = result;

      expect(sql).toBe('"customers"."full_name" = $1');
      expect(values).toEqual(["John"]);
    }
  });

  it("should handle NULL values", () => {
    const schema: QuerySchema = {
      columns: {
        "user.deleted_at": { table: "users", column: "deleted_at" },
      },
    };

    const expression = factory.equals(
      factory.column("user.deleted_at"),
      factory.null(),
    );

    const result = buildSql(expression, schema);

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      const {
        value: { sql, values },
      } = result;

      expect(sql).toBe('"users"."deleted_at" IS NULL');
      expect(values).toEqual([]);
    }
  });

  it("should handle NOT NULL values", () => {
    const schema: QuerySchema = {
      columns: {
        "user.deleted_at": { table: "users", column: "deleted_at" },
      },
    };

    const expression = factory.notEquals(
      factory.column("user.deleted_at"),
      factory.null(),
    );

    const result = buildSql(expression, schema);

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      const {
        value: { sql, values },
      } = result;

      expect(sql).toBe('"users"."deleted_at" IS NOT NULL');
      expect(values).toEqual([]);
    }
  });

  it("should handle function calls", () => {
    const schema: QuerySchema = {
      columns: {
        created_at: { table: "orders", column: "created_at" },
      },
      allowedFunctions: ["now", "current_timestamp"],
    };

    const expression = factory.greaterThan(
      factory.column("created_at"),
      factory.call("now"),
    );

    const result = buildSql(expression, schema);

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      const {
        value: { sql, values },
      } = result;

      expect(sql).toBe('"orders"."created_at" > "now"()');
      expect(values).toEqual([]);
    }
  });

  it("should handle chained JSON operations", () => {
    const schema: QuerySchema = {
      columns: {
        "user.profile.name": {
          table: "users",
          column: "data",
          jsonOperations: [
            { type: "->", key: "user" },
            { type: "->", key: "profile" },
            { type: "->>", key: "name" },
          ],
        },
      },
    };

    const expression = factory.equals(
      factory.column("user.profile.name"),
      factory.string("John"),
    );

    const result = buildSql(expression, schema);

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      const {
        value: { sql, values },
      } = result;

      expect(sql).toBe(
        "\"users\".\"data\" -> 'user' -> 'profile' ->> 'name' = $1",
      );

      expect(values).toEqual(["John"]);
    }
  });

  it("should handle mixed chained JSON operations", () => {
    const schema: QuerySchema = {
      columns: {
        "items.first.details": {
          table: "orders",
          column: "items",
          jsonOperations: [
            { type: "->", index: 0 },
            { type: "->", key: "details" },
            { type: "#>", path: ["price", "currency"] },
          ],
        },
      },
    };

    const expression = factory.equals(
      factory.column("items.first.details"),
      factory.string("USD"),
    );

    const result = buildSql(expression, schema);

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      const {
        value: { sql, values },
      } = result;

      expect(sql).toBe(
        '"orders"."items" -> 0 -> \'details\' #> \'{"price","currency"}\' = $1',
      );
      expect(values).toEqual(["USD"]);
    }
  });

  it("should handle mixed string/number paths", () => {
    const schema: QuerySchema = {
      columns: {
        "complex.path": {
          table: "data",
          column: "json_col",
          jsonOperations: [
            { type: "#>", path: ["users", 0, "preferences", 2, "theme"] },
          ],
        },
      },
    };

    const expression = factory.equals(
      factory.column("complex.path"),
      factory.string("dark"),
    );

    const result = buildSql(expression, schema);

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      const {
        value: { sql, values },
      } = result;

      expect(sql).toBe(
        '"data"."json_col" #> \'{"users",0,"preferences",2,"theme"}\' = $1',
      );
      expect(values).toEqual(["dark"]);
    }
  });

  it("should reject function calls not in whitelist", () => {
    const schema: QuerySchema = {
      columns: {
        created_at: { table: "orders", column: "created_at" },
      },
      allowedFunctions: ["now"], // Only 'now' is allowed
    };

    const expression = factory.greaterThan(
      factory.column("created_at"),
      factory.call("DROP_DATABASE"), // Dangerous function not in whitelist
    );

    const result = buildSql(expression, schema);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.name).toBe("FunctionNotAllowedError");
      expect(result.error.message).toContain("DROP_DATABASE");
      expect(result.error.message).toContain("Allowed functions: now");
    }
  });

  it("should allow function calls when no whitelist is specified", () => {
    const schema: QuerySchema = {
      columns: {
        created_at: { table: "orders", column: "created_at" },
      },
      // No allowedFunctions - should allow all
    };

    const expression = factory.greaterThan(
      factory.column("created_at"),
      factory.call("custom_function"),
    );

    const result = buildSql(expression, schema);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const {
        value: { sql, values },
      } = result;

      expect(sql).toBe('"orders"."created_at" > "custom_function"()');
      expect(values).toEqual([]);
    }
  });

  it("should allow function calls in whitelist", () => {
    const schema: QuerySchema = {
      columns: {
        created_at: { table: "orders", column: "created_at" },
      },
      allowedFunctions: ["now", "current_timestamp", "extract"],
    };

    const expression = factory.greaterThan(
      factory.column("created_at"),
      factory.call("current_timestamp"),
    );

    const result = buildSql(expression, schema);

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      const {
        value: { sql, values },
      } = result;

      expect(sql).toBe('"orders"."created_at" > "current_timestamp"()');
      expect(values).toEqual([]);
    }
  });
});
