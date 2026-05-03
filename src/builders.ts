import { fromThrowable } from "neverthrow";
import type { Binary, Node } from "./types/nodes.js";
import {
  binaryNodeType,
  columnNodeType,
  listNodeType,
  booleanLiteralNodeType,
  numberLiteralNodeType,
  stringLiteralNodeType,
  nullNodeType,
  callNodeType,
} from "./types/nodes.js";
import type { BinaryOperator } from "./types/operators.js";
import type { QuerySchema, JsonOperation } from "./types/schema.js";
import { FieldNotInSchemaError, FunctionNotAllowedError } from "./errors.js";

// Operator mapping for SQL output
const operatorMap: Record<BinaryOperator, string> = {
  Eq: "=",
  Ne: "!=",
  Gt: ">",
  Gte: ">=",
  Lt: "<",
  Lte: "<=",
  And: "AND",
  Or: "OR",
  In: "IN",
  Like: "LIKE",
  "+": "+",
  "-": "-",
  "*": "*",
  "/": "/",
};

function escapeIdentifier(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

export function formatJsonOperation(
  baseIdentifier: string,
  operation: JsonOperation,
): string {
  switch (operation.type) {
    case "->": {
      return "key" in operation
        ? `${baseIdentifier} -> '${operation.key}'`
        : `${baseIdentifier} -> ${operation.index}`;
    }
    case "->>": {
      return "key" in operation
        ? `${baseIdentifier} ->> '${operation.key}'`
        : `${baseIdentifier} ->> ${operation.index}`;
    }
    case "#>": {
      const pathArray = operation.path
        .map((pathItem) =>
          typeof pathItem === "string" ? `"${pathItem}"` : pathItem,
        )
        .join(",");

      return `${baseIdentifier} #> '{${pathArray}}'`;
    }
    case "#>>": {
      const pathArray = operation.path
        .map((pathItem) =>
          typeof pathItem === "string" ? `"${pathItem}"` : pathItem,
        )
        .join(",");

      return `${baseIdentifier} #>> '{${pathArray}}'`;
    }
    default: {
      throw new Error(
        `Unsupported JSON operation type: ${(operation as any).type}`,
      );
    }
  }
}

export function formatJsonOperations(
  baseIdentifier: string,
  operations: JsonOperation[],
): string {
  return operations.reduce(
    (identifier, operation) => formatJsonOperation(identifier, operation),
    baseIdentifier,
  );
}

export type SqlResult = {
  sql: string;
  values: (string | number | boolean)[];
};

export function unsafeBuildSql(
  expression: Binary,
  schema: QuerySchema,
): SqlResult {
  const values: (string | number | boolean)[] = [];

  function recur(expression: Node): string {
    switch (expression.$t) {
      case binaryNodeType: {
        const left = recur(expression.l);
        const right = recur(expression.r);

        let operator = operatorMap[expression.op];

        // Handle NULL comparisons
        if (expression.r.$t === nullNodeType) {
          if (expression.op === "Eq") {
            operator = "IS";
          }

          if (expression.op === "Ne") {
            operator = "IS NOT";
          }
        }

        const clause = `${left} ${operator} ${right}`;

        return ["And", "Or"].includes(expression.op) ? `(${clause})` : clause;
      }
      case columnNodeType: {
        const fieldKey = expression.r;
        const columnSpec = schema.columns[fieldKey];

        if (!columnSpec) {
          throw new FieldNotInSchemaError(
            `The field '${fieldKey}' is not included in the filter schema. Please ensure all referenced fields are part of the defined filter criteria.`,
          );
        }

        let identifier = `${escapeIdentifier(columnSpec.table)}.${escapeIdentifier(columnSpec.column)}`;

        if (columnSpec.jsonOperations && columnSpec.jsonOperations.length > 0) {
          identifier = formatJsonOperations(
            identifier,
            columnSpec.jsonOperations,
          );
        }

        return identifier;
      }
      case listNodeType: {
        return `(${expression.v.map(recur).join(", ")})`;
      }
      case booleanLiteralNodeType:
      case numberLiteralNodeType:
      case stringLiteralNodeType: {
        values.push(expression.v);
        return `$${values.length}`;
      }
      case nullNodeType: {
        return "NULL";
      }
      case callNodeType: {
        // Check if function is in the whitelist
        if (schema.allowedFunctions && !schema.allowedFunctions.includes(expression.f)) {
          throw new FunctionNotAllowedError(
            `The function '${expression.f}' is not allowed. Allowed functions: ${schema.allowedFunctions.join(', ')}`
          );
        }
        
        return `${escapeIdentifier(expression.f)}()`;
      }
      default: {
        throw new Error(`Unsupported node type: ${(expression as any).$t}`);
      }
    }
  }

  const sql = recur(expression);

  return {
    sql,
    values,
  };
}

export const buildSql = fromThrowable(unsafeBuildSql, (error) =>
  error instanceof Error ? error : new Error("Unknown error"),
);
