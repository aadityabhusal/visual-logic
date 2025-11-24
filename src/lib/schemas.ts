import * as z from "zod";
import type {
  DataType,
  UndefinedType,
  StringType,
  NumberType,
  BooleanType,
  ArrayType,
  ObjectType,
  UnionType,
  OperationType,
  ConditionType,
  IData,
  IStatement,
  IDropdownItem,
  UnknownType,
} from "./types";

/**
 * Note: Zod schemas are derived from types because the type relations are complex and some not possible to express in Zod.
 */

const UnknownTypeSchema: z.ZodType<UnknownType> = z.object({
  kind: z.literal("unknown"),
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

const ArrayTypeSchema: z.ZodType<ArrayType> = z.object({
  kind: z.literal("array"),
  get elementType() {
    return DataTypeSchema;
  },
});

const ObjectTypeSchema: z.ZodType<ObjectType> = z.object({
  kind: z.literal("object"),
  get properties() {
    return z.record(z.string(), DataTypeSchema);
  },
});

const UnionTypeSchema: z.ZodType<UnionType> = z.object({
  kind: z.literal("union"),
  get types() {
    return z.array(DataTypeSchema);
  },
});

const OperationTypeSchema: z.ZodType<OperationType> = z.object({
  kind: z.literal("operation"),
  get parameters() {
    return z.array(
      z.object({ name: z.string().optional(), type: DataTypeSchema })
    );
  },
  get result() {
    return DataTypeSchema;
  },
});

const ConditionTypeSchema: z.ZodType<ConditionType> = z.object({
  kind: z.literal("condition"),
  get type() {
    return UnionTypeSchema;
  },
});

export const DataTypeSchema: z.ZodType<DataType> = z.union([
  UnknownTypeSchema,
  UndefinedTypeSchema,
  StringTypeSchema,
  NumberTypeSchema,
  BooleanTypeSchema,
  ArrayTypeSchema,
  ObjectTypeSchema,
  UnionTypeSchema,
  OperationTypeSchema,
  ConditionTypeSchema,
]);

export const IDataSchema: z.ZodType<IData> = z
  .object({
    id: z.string(),
    entityType: z.literal("data"),
    isGeneric: z.boolean().optional(),
    reference: z.object({ id: z.string(), name: z.string() }).optional(),
  })
  .and(
    // Note: We use z.union instead of z.discriminatedUnion because the discriminator (kind) is nested inside the type object.
    z.union([
      z.object({
        type: UnknownTypeSchema,
        value: z.unknown(),
      }),
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
        type: ArrayTypeSchema,
        get value() {
          return z.array(IStatementSchema);
        },
      }),
      z.object({
        type: ObjectTypeSchema,
        get value() {
          return z.map(z.string(), IStatementSchema);
        },
      }),
      z.object({
        type: UnionTypeSchema,
        get value() {
          return z.union([
            z.undefined(),
            z.string(),
            z.number(),
            z.boolean(),
            z.array(IStatementSchema),
            z.map(z.string(), IStatementSchema),
            z.object({
              parameters: z.array(IStatementSchema),
              statements: z.array(IStatementSchema),
              return: IDataSchema.optional(),
              name: z.string().optional(),
            }),
          ]);
        },
      }),
      z.object({
        type: OperationTypeSchema,
        get value() {
          return z.object({
            parameters: z.array(IStatementSchema),
            statements: z.array(IStatementSchema),
            return: IDataSchema.optional(),
            name: z.string().optional(),
          });
        },
      }),
      z.object({
        type: ConditionTypeSchema,
        get value() {
          return z.object({
            condition: IStatementSchema,
            true: IStatementSchema,
            false: IStatementSchema,
            result: IDataSchema.optional(),
          });
        },
      }),
    ])
  );

export const IStatementSchema: z.ZodType<IStatement> = z.object({
  id: z.string(),
  entityType: z.literal("statement"),
  name: z.string().optional(),
  get data() {
    return IDataSchema;
  },
  get operations() {
    return z
      .array(IDataSchema)
      .refine((ops) => ops.every((op) => op.type.kind === "operation"), {
        message: "All operations must have type.kind === 'operation'",
      }) as z.ZodType<IData<OperationType>[]>;
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
export type InferredIStatement = z.infer<typeof IStatementSchema>;
export type InferredIDropdownItem = z.infer<typeof IDropdownItemSchema>;
