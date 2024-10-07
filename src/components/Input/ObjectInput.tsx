import { theme } from "../../lib/theme";
import { IData, IOperation, IStatement } from "../../lib/types";
import { createData, createStatement } from "../../lib/utils";
import { Input } from "./Input";
import { Statement } from "../Statement";

export interface IObjectInput {
  data: IData<"object">;
  handleData: (data: IData) => void;
  prevStatements: IStatement[];
  prevOperations: IOperation[];
}
export function ObjectInput({
  data,
  handleData,
  prevStatements,
  prevOperations,
}: IObjectInput) {
  const isMultiline = data.value.size > 2;

  function addToObject() {
    if (!data.value.has("")) {
      let newMap = new Map(data.value);
      let newData = createStatement({
        data: createData({ type: "string", isGeneric: true }),
      });
      newMap.set("", newData);
      handleData({
        ...data,
        type: "object",
        value: newMap,
      });
    }
  }

  function handleUpdate(
    dataArray: [string, IStatement][],
    index: number,
    result: IStatement,
    remove?: boolean
  ) {
    if (remove) dataArray.splice(index, 1);
    else dataArray[index] = [dataArray[index][0], result];
    handleData({
      ...data,
      type: "object",
      value: new Map(dataArray),
    });
  }

  function handleKeyUpdate(
    dataArray: [string, IStatement][],
    index: number,
    result: IData
  ) {
    if (typeof result.value === "string" && !data.value.has(result.value)) {
      dataArray[index] = [result.value, dataArray[index][1]];
      handleData({
        ...data,
        type: "object",
        value: new Map(dataArray),
      });
    }
  }

  return (
    <div
      className={
        "flex items-start gap-1 [&>span]:text-method " +
        (isMultiline ? "flex-col" : "flex-row")
      }
    >
      <span>{"{"}</span>
      {Array.from(data.value).map(([key, value], i, arr) => {
        return (
          <div
            key={i}
            style={{ display: "flex", marginLeft: isMultiline ? 8 : 0 }}
          >
            <Input
              data={{
                id: `${i}-${key}`,
                type: "string",
                value: key,
                entityType: "data",
              }}
              handleData={(val) => handleKeyUpdate(arr, i, val)}
              color={theme.color.property}
              noQuotes
            />
            <span style={{ marginRight: 4 }}>:</span>
            <Statement
              statement={value}
              handleStatement={(val, remove) =>
                handleUpdate(arr, i, val, remove)
              }
              prevOperations={prevOperations}
              prevStatements={prevStatements}
              disableName={true}
            />
            {i < arr.length - 1 ? <span>{","}</span> : null}
          </div>
        );
      })}
      <div onClick={addToObject} style={{ cursor: "pointer" }}>
        +
      </div>
      <span>{"}"}</span>
    </div>
  );
}
