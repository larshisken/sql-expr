import { z } from "zod";
import { binaryOperator } from "../types/operators.js";
import {
  binaryNodeType,
  booleanLiteralNodeType,
  callNodeType,
  columnNodeType,
  listNodeType,
  nullNodeType,
  numberLiteralNodeType,
  stringLiteralNodeType,
} from "../types/nodes.js";

export const binaryZodSchema: z.ZodDiscriminatedUnionOption<"$t"> = z.object({
  $t: z.literal(binaryNodeType),
  l: z.lazy(() => nodeZodSchema),
  op: z.enum(binaryOperator),
  r: z.lazy(() => nodeZodSchema),
});

export const columnZodSchema = z.object({
  $t: z.literal(columnNodeType),
  r: z.array(z.string()),
});

export const listZodSchema: z.ZodDiscriminatedUnionOption<"$t"> = z.object({
  $t: z.literal(listNodeType),
  v: z.array(z.lazy(() => nodeZodSchema)),
});

export const booleanZodSchema = z.object({
  $t: z.literal(booleanLiteralNodeType),
  v: z.boolean(),
});

export const numberZodSchema = z.object({
  $t: z.literal(numberLiteralNodeType),
  v: z.number(),
});

export const stringZodSchema = z.object({
  $t: z.literal(stringLiteralNodeType),
  v: z.string(),
});

export const nullZodSchema = z.object({
  $t: z.literal(nullNodeType),
});

export const callZodSchema = z.object({
  $t: z.literal(callNodeType),
  f: z.string(),
});

export const nodeZodSchema = z.discriminatedUnion("$t", [
  binaryZodSchema,
  columnZodSchema,
  listZodSchema,
  booleanZodSchema,
  numberZodSchema,
  stringZodSchema,
  nullZodSchema,
  callZodSchema,
]);
