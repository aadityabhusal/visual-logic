import { ArrayType, Context, IData, IStatement } from "../../lib/types";
import { Statement } from "../Statement";
import { AddStatement } from "../AddStatement";
import { forwardRef, HTMLAttributes } from "react";
import { inferTypeFromValue } from "../../lib/utils";

export interface ArrayInputProps extends HTMLAttributes<HTMLDivElement> {
  data: IData<ArrayType>;
  handleData: (data: IData<ArrayType>) => void;
  context: Context;
}

export const ArrayInput = forwardRef<HTMLDivElement, ArrayInputProps>(
  ({ data, handleData, context, ...props }, ref) => {
    const isMultiline = data.value.length > 3;

    function handleUpdate(result: IStatement, index: number, remove?: boolean) {
      const newValue = [...data.value];
      if (remove) newValue.splice(index, 1);
      else newValue[index] = result;
      handleData({
        ...data,
        type: inferTypeFromValue(newValue),
        value: newValue,
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
                context={context}
              />
              {i < arr.length - 1 ? <span>{","}</span> : null}
            </div>
          );
        })}
        <AddStatement
          id={data.id}
          onSelect={(value) => {
            const newVal = [...data.value, value];
            handleData({
              ...data,
              type: inferTypeFromValue(newVal),
              value: newVal,
            });
          }}
          iconProps={{ title: "Add array item" }}
          context={context}
        />
        <span>{"]"}</span>
      </div>
    );
  }
);

ArrayInput.displayName = "ArrayInput";
