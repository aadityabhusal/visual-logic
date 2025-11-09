import { DataValue } from "../lib/types";
import { createData } from "../lib/utils";

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
  types: [{ kind: "string" }, { kind: "number" }];
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
