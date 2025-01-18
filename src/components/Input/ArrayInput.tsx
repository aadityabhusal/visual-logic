import { IData, IOperation, IStatement } from "../../lib/types";
import { Statement } from "../Statement";
import { AddStatement } from "../AddStatement";
import { forwardRef, HTMLAttributes } from "react";

export interface IArrayInput extends HTMLAttributes<HTMLDivElement> {
  data: IData<"array">;
  handleData: (data: IData) => void;
  prevStatements: IStatement[];
  prevOperations: IOperation[];
}

export const ArrayInput = forwardRef<HTMLDivElement, IArrayInput>(
  ({ data, handleData, prevStatements, prevOperations, ...props }, ref) => {
    const isMultiline = data.value.length > 3;

    function handleUpdate(result: IStatement, index: number, remove?: boolean) {
      let resList = [...data.value];
      if (remove) resList.splice(index, 1);
      else resList[index] = result;
      handleData({
        ...data,
        type: "array",
        value: resList,
      });
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
        <span>{"["}</span>
        {data.value.map((item, i, arr) => {
          return (
            <div
              key={i}
              style={{ display: "flex", marginLeft: isMultiline ? 8 : 0 }}
            >
              <Statement
                statement={item}
                handleStatement={(val, remove) => handleUpdate(val, i, remove)}
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
            handleData({
              ...data,
              type: "array",
              value: [...data.value, value],
            });
          }}
        />
        <span>{"]"}</span>
      </div>
    );
  }
);
