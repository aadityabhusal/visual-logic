import { DataValue } from "../lib/types";
import {
  createData,
  createStatement,
  getOperationType,
  getArrayElementType,
  getObjectPropertiesType,
} from "../lib/utils";

type stringValue = DataValue<{
  kind: "string";
}>;

type numberValue = DataValue<{
  kind: "number";
}>;

type booleanValue = DataValue<{
  kind: "boolean";
}>;

type undefinedValue = DataValue<{
  kind: "undefined";
}>;

type arrayValue = DataValue<{
  kind: "array";
  elementType: {
    kind: "union";
    types: [{ kind: "string" }, { kind: "number" }];
  };
}>;

type objectValue = DataValue<{
  kind: "object";
  properties: {
    name: { kind: "string" };
    age: { kind: "number" };
    address: {
      kind: "object";
      properties: {
        street: { kind: "string" };
        city: { kind: "string" };
        state: { kind: "string" };
        zip: { kind: "number" };
      };
    };
  };
}>;

type unionValue = DataValue<{
  kind: "union";
  types: [
    { kind: "string" },
    { kind: "number" },
    {
      kind: "object";
      properties: { name: { kind: "string" }; age: { kind: "number" } };
    }
  ];
}>;

const stringData = createData({ type: { kind: "string" } });

const numberData = createData({ type: { kind: "number" } });

const booleanData = createData({ type: { kind: "boolean" } });

const undefinedData = createData({ type: { kind: "undefined" } });

const arrayData = createData({
  type: {
    kind: "array",
    elementType: {
      kind: "union",
      types: [{ kind: "string" }, { kind: "number" }],
    },
  },
});

const objectData = createData({
  type: {
    kind: "object",
    properties: {
      name: { kind: "string" },
      age: { kind: "number" },
      address: {
        kind: "object",
        properties: {
          street: { kind: "string" },
          city: { kind: "string" },
          state: { kind: "string" },
          zip: { kind: "number" },
        },
      },
    },
  },
});

const unionData = createData({
  type: {
    kind: "union",
    types: [
      { kind: "string" },
      { kind: "number" },
      {
        kind: "object",
        properties: { name: { kind: "string" }, age: { kind: "number" } },
      },
    ],
  },
});

// Test getOperationType
const param1 = createStatement({
  name: "x",
  data: createData({ type: { kind: "number" } }),
});
const param2 = createStatement({
  name: "y",
  data: createData({ type: { kind: "number" } }),
});
const returnStatement = createStatement({
  data: createData({ type: { kind: "number" }, value: 42 }),
});

const operationType = getOperationType([param1, param2], [returnStatement]);
console.log("Operation Type:", operationType);
// Expected: { kind: "operation", parameters: [{ name: "x", type: { kind: "number" }}, { name: "y", type: { kind: "number" }}], result: { kind: "number" }}

// Test getArrayElementType
const arrayElements = [
  createStatement({ data: createData({ type: { kind: "string" } }) }),
  createStatement({ data: createData({ type: { kind: "string" } }) }),
];
const arrayElementType = getArrayElementType(arrayElements);
console.log("Array Element Type:", arrayElementType);
// Expected: { kind: "string" }

// Test getObjectPropertiesType
const objectEntries = new Map([
  ["name", createStatement({ data: createData({ type: { kind: "string" } }) })],
  ["age", createStatement({ data: createData({ type: { kind: "number" } }) })],
]);
const objectPropertiesType = getObjectPropertiesType(objectEntries);
console.log("Object Properties Type:", objectPropertiesType);
// Expected: { name: { kind: "string" }, age: { kind: "number" } }
