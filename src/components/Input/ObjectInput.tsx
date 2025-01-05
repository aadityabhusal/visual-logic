import { IData, IOperation, IStatement } from "../../lib/types";
import { Statement } from "../Statement";
import { BaseInput } from "./BaseInput";
import { AddStatement } from "../AddStatement";

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
            <BaseInput
              type="property"
              value={key}
              onChange={(value) =>
                handleKeyUpdate(arr, i, {
                  id: `${i}-${key}`,
                  type: "string",
                  value,
                  entityType: "data",
                })
              }
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
      <AddStatement
        prevStatements={prevStatements}
        prevOperations={prevOperations}
        onSelect={(value) => {
          if (!data.value.has("")) {
            let newMap = new Map(data.value);
            newMap.set("", value);
            handleData({ ...data, type: "object", value: newMap });
          }
        }}
      />
      <span>{"}"}</span>
    </div>
  );
}
