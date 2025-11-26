import { IData, IStatement, ObjectType } from "../../lib/types";
import { Statement } from "../Statement";
import { BaseInput } from "./BaseInput";
import { AddStatement } from "../AddStatement";
import { forwardRef, HTMLAttributes } from "react";
import { createVariableName, getObjectPropertiesType } from "../../lib/utils";

export interface ObjectInputProps extends HTMLAttributes<HTMLDivElement> {
  data: IData<ObjectType>;
  handleData: (data: IData<ObjectType>) => void;
  prevStatements: IStatement[];
}
export const ObjectInput = forwardRef<HTMLDivElement, ObjectInputProps>(
  ({ data, handleData, prevStatements, ...props }, ref) => {
    const isMultiline = data.value.size > 2;

    function handleUpdate(
      dataArray: [string, IStatement][],
      index: number,
      result: IStatement,
      remove?: boolean
    ) {
      if (remove) dataArray.splice(index, 1);
      else dataArray[index] = [dataArray[index][0], result];
      const newValue = new Map(dataArray);
      const properties = getObjectPropertiesType(newValue);
      handleData({
        ...data,
        type: { kind: "object", properties },
        value: newValue,
      });
    }

    function handleKeyUpdate(
      dataArray: [string, IStatement][],
      index: number,
      value: string
    ) {
      if (typeof value === "string" && !data.value.has(value)) {
        dataArray[index] = [value, dataArray[index][1]];
        const newValue = new Map(dataArray);
        const properties = getObjectPropertiesType(newValue);
        handleData({
          ...data,
          type: { kind: "object", properties },
          value: newValue,
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
                onChange={(value) => handleKeyUpdate(arr, i, value)}
              />
              <span style={{ marginRight: 4 }}>:</span>
              <Statement
                statement={value}
                handleStatement={(val, remove) =>
                  handleUpdate(arr, i, val, remove)
                }
                prevStatements={prevStatements}
              />
              {i < arr.length - 1 ? <span>{","}</span> : null}
            </div>
          );
        })}
        <AddStatement
          id={data.id}
          onSelect={(value) => {
            if (!data.value.has("")) {
              const newMap = new Map(data.value);
              newMap.set(
                createVariableName({
                  prefix: "key",
                  prev: Array.from(data.value.keys()),
                }),
                value
              );
              handleData({
                ...data,
                type: {
                  kind: "object",
                  properties: getObjectPropertiesType(newMap),
                },
                value: newMap,
              });
            }
          }}
          iconProps={{ title: "Add object item" }}
        />
        <span>{"}"}</span>
      </div>
    );
  }
);

ObjectInput.displayName = "ObjectInput";
