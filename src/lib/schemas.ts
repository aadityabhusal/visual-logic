import * as z from "zod";
import type {
  DataType,
  UndefinedType,
  StringType,
  NumberType,
  BooleanType,
  TupleType,
  ListType,
  ObjectType,
  RecordType,
  UnionType,
  IData,
  IMethod,
  IStatement,
  IOperation,
  IDropdownItem,
  IReference,
} from "./types";

/**
 * Note: Zod schemas are derived from types because the type relations are complex and some not possible to express in Zod.
 */

export const IReferenceSchema: z.ZodType<IReference> = z.object({
  id: z.string(),
  name: z.string(),
  isCalled: z.boolean().optional(),
});

const UndefinedTypeSchema: z.ZodType<UndefinedType> = z.object({
  kind: z.literal("undefined"),
});

const StringTypeSchema: z.ZodType<StringType> = z.object({
  kind: z.literal("string"),
});

const NumberTypeSchema: z.ZodType<NumberType> = z.object({
  kind: z.literal("number"),
});

const BooleanTypeSchema: z.ZodType<BooleanType> = z.object({
  kind: z.literal("boolean"),
});

const TupleTypeSchema: z.ZodType<TupleType> = z.object({
  kind: z.literal("tuple"),
  get elementsType() {
    return z.array(DataTypeSchema);
  },
});

const ListTypeSchema: z.ZodType<ListType> = z.object({
  kind: z.literal("list"),
  get elementType() {
    return DataTypeSchema;
  },
});

const ObjectTypeSchema: z.ZodType<ObjectType> = z.object({
  kind: z.literal("object"),
  get properties() {
    return z.record(z.string(), DataTypeSchema);
  },
  sealed: z.boolean().optional(),
});

const RecordTypeSchema: z.ZodType<RecordType> = z.object({
  kind: z.literal("record"),
  get valueType() {
    return DataTypeSchema;
  },
});

const UnionTypeSchema: z.ZodType<UnionType> = z.object({
  kind: z.literal("union"),
  get types() {
    return z.array(DataTypeSchema);
  },
});

export const DataTypeSchema: z.ZodType<DataType> = z.union([
  UndefinedTypeSchema,
  StringTypeSchema,
  NumberTypeSchema,
  BooleanTypeSchema,
  TupleTypeSchema,
  ListTypeSchema,
  ObjectTypeSchema,
  RecordTypeSchema,
  UnionTypeSchema,
]);

export const IDataSchema: z.ZodType<IData> = z
  .object({
    id: z.string(),
    entityType: z.literal("data"),
    isGeneric: z.boolean().optional(),
    reference: IReferenceSchema.optional(),
  })
  .and(
    // Note: We use z.union instead of z.discriminatedUnion because the discriminator (kind) is nested inside the type object.
    z.union([
      z.object({
        type: UndefinedTypeSchema,
        value: z.undefined(),
      }),
      z.object({
        type: StringTypeSchema,
        value: z.string(),
      }),
      z.object({
        type: NumberTypeSchema,
        value: z.number(),
      }),
      z.object({
        type: BooleanTypeSchema,
        value: z.boolean(),
      }),
      z.object({
        type: TupleTypeSchema,
        get value() {
          return z.array(IStatementSchema);
        },
      }),
      z.object({
        type: ListTypeSchema,
        get value() {
          return z.array(IStatementSchema);
        },
      }),
      z.object({
        type: ObjectTypeSchema,
        get value() {
          return z.record(z.string(), IStatementSchema);
        },
      }),
      z.object({
        type: RecordTypeSchema,
        get value() {
          return z.map(z.string(), IStatementSchema);
        },
      }),
      z.object({
        type: UnionTypeSchema,
        get value() {
          return IStatementSchema;
        },
      }),
    ])
  );

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

export const IOperationSchema: z.ZodType<IOperation> = z.object({
  id: z.string(),
  entityType: z.literal("operation"),
  name: z.string().optional(),
  isGeneric: z.boolean().optional(),
  reference: IReferenceSchema.optional(),
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

export const IDropdownItemSchema: z.ZodType<IDropdownItem> = z.object({
  label: z.string().optional(),
  secondaryLabel: z.string().optional(),
  value: z.string(),
  entityType: z.enum(["data", "method", "operation"]),
  onClick: z.function().optional(),
});

// Type inference helpers to verify schemas match the original types
export type InferredDataType = z.infer<typeof DataTypeSchema>;
export type InferredIData = z.infer<typeof IDataSchema>;
export type InferredIMethod = z.infer<typeof IMethodSchema>;
export type InferredIStatement = z.infer<typeof IStatementSchema>;
export type InferredIOperation = z.infer<typeof IOperationSchema>;
export type InferredIDropdownItem = z.infer<typeof IDropdownItemSchema>;
