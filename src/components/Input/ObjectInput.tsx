import { IData, IOperation, IStatement } from "../../lib/types";
import { Statement } from "../Statement";
import { BaseInput } from "./BaseInput";
import { AddStatement } from "../AddStatement";
import { forwardRef, HTMLAttributes } from "react";
import { createVariableName } from "../../lib/utils";

export interface IObjectInput extends HTMLAttributes<HTMLDivElement> {
  data: IData<"object">;
  handleData: (data: IData) => void;
  prevStatements: IStatement[];
  prevOperations: IOperation[];
}
export const ObjectInput = forwardRef<HTMLDivElement, IObjectInput>(
  ({ data, handleData, prevStatements, prevOperations, ...props }, ref) => {
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
        {...props}
        ref={ref}
        className={[
          "flex items-start gap-1 [&>span]:text-method",
          isMultiline ? "flex-col" : "flex-row",
          props?.className,
        ].join(" ")}
      >
        <span>{"{"}</span>
        {Array.from(data.value).map(([key, value], i, arr) => {
          return (
            <div
              key={i}
              style={{ display: "flex", marginLeft: isMultiline ? 8 : 0 }}
            >
              <BaseInput
                className="text-property"
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
              />
              {i < arr.length - 1 ? <span>{","}</span> : null}
            </div>
          );
        })}
        <AddStatement
          id={`${data.id}_addStatement`}
          prevStatements={prevStatements}
          prevOperations={prevOperations}
          onSelect={(value) => {
            if (!data.value.has("")) {
              let newMap = new Map(data.value);
              newMap.set(
                createVariableName({
                  prefix: "key",
                  prev: Array.from(data.value.keys()),
                }),
                value
              );
              handleData({ ...data, type: "object", value: newMap });
            }
          }}
          iconProps={{ title: "Add object item" }}
        />
        <span>{"}"}</span>
      </div>
    );
  }
);
