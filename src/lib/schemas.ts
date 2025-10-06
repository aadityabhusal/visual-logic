import * as z from "zod";
import type {
  IType,
  IData,
  IMethod,
  IStatement,
  IOperation,
  IDropdownItem,
} from "./types";

export const IStatementSchema: z.ZodType<IStatement> = z.object({
  id: z.string(),
  entityType: z.literal("statement"),
  name: z.string().optional(),
  get data() {
    return z.union([IDataSchema, IOperationSchema]);
  },
  get methods() {
    return z.array(IMethodSchema);
  },
});

const IDataTypeValueSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("string"), value: z.string() }),
  z.object({ type: z.literal("number"), value: z.number() }),
  z.object({ type: z.literal("boolean"), value: z.boolean() }),
  z.object({
    type: z.literal("array"),
    get value() {
      return z.array(IStatementSchema);
    },
  }),
  z.object({
    type: z.literal("object"),
    get value() {
      return z.map(z.string(), IStatementSchema);
    },
  }),
]);

export const IDataSchema: z.ZodType<IData> = z
  .object({
    id: z.string(),
    entityType: z.literal("data"),
    isGeneric: z.boolean().optional(),
    reference: z.object({ id: z.string(), name: z.string() }).optional(),
  })
  .and(IDataTypeValueSchema);

export const IOperationSchema: z.ZodType<IOperation> = z.object({
  id: z.string(),
  entityType: z.literal("operation"),
  name: z.string().optional(),
  isGeneric: z.boolean().optional(),
  reference: z
    .object({
      id: z.string(),
      name: z.string(),
      isCalled: z.boolean().optional(),
    })
    .optional(),
  get parameters() {
    return z.array(IStatementSchema);
  },
  get closure() {
    return z.array(IStatementSchema);
  },
  get statements() {
    return z.array(IStatementSchema);
  },
});

export const IMethodSchema: z.ZodType<IMethod> = z.object({
  id: z.string(),
  name: z.string(),
  entityType: z.literal("method"),
  get parameters() {
    return z.array(IStatementSchema);
  },
  get result() {
    return z.union([IDataSchema, IOperationSchema]);
  },
});

export const IDropdownItemSchema = z.object({
  label: z.string().optional(),
  secondaryLabel: z.string().optional(),
  value: z.string(),
  entityType: z.enum(["data", "method", "operation"]),
  onClick: z.function().optional(),
});

export const ITypeSchema = z.object({
  string: z.string(),
  number: z.number(),
  boolean: z.boolean(),
  get array() {
    return z.array(IStatementSchema);
  },
  get object() {
    return z.map(z.string(), IStatementSchema);
  },
});

// Type inference helpers to verify schemas match the original types
export type InferredIData = z.infer<typeof IDataSchema>;
export type InferredIMethod = z.infer<typeof IMethodSchema>;
export type InferredIStatement = z.infer<typeof IStatementSchema>;
export type InferredIOperation = z.infer<typeof IOperationSchema>;
export type InferredIDropdownItem = z.infer<typeof IDropdownItemSchema>;
export type InferredIType = z.infer<typeof ITypeSchema>;
