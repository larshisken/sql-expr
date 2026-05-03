# SQL Expr

A TypeScript library for building serializable SQL (PostgreSQL) filters with a safe user-generated approach. Utilizes a filter schema to ensure that only permitted filters are generated.

## Features

- **Parameterized values** - All values are parameterized automatically
- **Type Safe** - Full TypeScript support with discriminated unions
- **Schema-Driven** - Define your database structure once, use everywhere
- **JSON Operations** - Complete PostgreSQL JSON operator support with chaining
- **Serializable** - Filter expressions can be JSON serialized/deserialized
- **Framework Agnostic** - Works with any PostgreSQL client (pg, Prisma, Slonik, etc.)

## Usage

### Simple Example

```typescript
import { factory, buildSql } from 'sql-expr';

// Simple equality filter
const filter = factory.equals(
  factory.column("user.email"),
  factory.string("john@example.com")
);

const result = buildSql(filter, {
  columns: {
    "user.email": {
      table: "users",
      column: "email"
    }
  }
});

if (result.isOk()) {
  console.log(result.value.sql);
  // ("users"."email") = $1

  console.log(result.value.values);
  // ["john@example.com"]
}
```

### Available Factory Functions

```typescript
// Comparison operations
factory.equals(left, right)
factory.notEquals(left, right)
factory.greaterThan(left, right)
factory.greaterThanOrEqual(left, right)
factory.lessThan(left, right)
factory.lessThanOrEqual(left, right)
factory.like(left, right)
factory.in(left, right)

// Logical operations
factory.and(left, right)
factory.or(left, right)

// Arithmetic operations
factory.add(left, right)
factory.subtract(left, right)
factory.multiply(left, right)
factory.divide(left, right)

// Value nodes
factory.column("column.path")
factory.string("text")
factory.number(42)
factory.bool(true)
factory.null()
factory.list([factory.string("a"), factory.string("b")])
```

## License

MIT
