import { IValue } from "../lib/types";
import { createData } from "../lib/utils";

type stringValue = IValue<{
  kind: "string";
}>;

type numberValue = IValue<{
  kind: "number";
}>;

type booleanValue = IValue<{
  kind: "boolean";
}>;

type undefinedValue = IValue<{
  kind: "undefined";
}>;

type arrayValue = IValue<{
  kind: "list";
  elementType: {
    kind: "union";
    types: [{ kind: "string" }, { kind: "number" }];
  };
}>;

type tupleValue = IValue<{
  kind: "tuple";
  elementsType: [
    { kind: "string" },
    { kind: "number" },
    { kind: "union"; types: [{ kind: "string" }, { kind: "number" }] }
  ];
}>;

type recordValue = IValue<{
  kind: "record";
  valueType: { kind: "number" };
}>;

type objectValue = IValue<{
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

type unionValue = IValue<{
  kind: "union";
  types: [
    { kind: "string" },
    { kind: "number" },
    { kind: "tuple"; elementsType: [{ kind: "string" }, { kind: "number" }] }
  ];
}>;

const stringData = createData({ type: { kind: "string" } });
const numberData = createData({ type: { kind: "number" } });
const booleanData = createData({ type: { kind: "boolean" } });
const undefinedData = createData({ type: { kind: "undefined" } });
const arrayData = createData({
  type: { kind: "list", elementType: { kind: "string" } },
});
const tupleData = createData({
  type: {
    kind: "tuple",
    elementsType: [{ kind: "string" }, { kind: "number" }],
  },
});
const recordData = createData({
  type: { kind: "record", valueType: { kind: "string" } },
});
const objectData = createData({
  type: {
    kind: "object",
    properties: { name: { kind: "string" }, age: { kind: "number" } },
  },
});
const unionData = createData({
  type: { kind: "union", types: [{ kind: "string" }, { kind: "number" }] },
});

console.log(stringData);
console.log(numberData);
console.log(booleanData);
console.log(undefinedData);
console.log(arrayData);
console.log(tupleData);
console.log(recordData);
console.log(objectData);
console.log(unionData);
