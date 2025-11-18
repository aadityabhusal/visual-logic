import { forwardRef, HTMLAttributes } from "react";
import { ConditionType, IData, IStatement } from "../../lib/types";
import { getConditionResult, getStatementResult } from "../../lib/utils";
import { Statement } from "../Statement";

export interface ConditionInputProps extends HTMLAttributes<HTMLDivElement> {
  data: IData<ConditionType>;
  handleData: (data: IData<ConditionType>) => void;
  prevStatements: IStatement[];
}

export const Condition = forwardRef<HTMLDivElement, ConditionInputProps>(
  ({ data, handleData, prevStatements, ...props }, ref) => {
    function handleUpdate(
      key: "condition" | "true" | "false",
      val: IStatement
    ) {
      const value = { ...data.value, [key]: val };
      const types =
        key === "true"
          ? [getStatementResult(value.true).type, data.type.type.types[1]]
          : key === "false"
          ? [data.type.type.types[0], getStatementResult(value.false).type]
          : data.type.type.types;

      handleData({
        ...data,
        type: { kind: "condition", type: { kind: "union", types: types } },
        value: { ...value, result: getConditionResult(value) },
      });
    }

    return (
      <div
        {...props}
        ref={ref}
        className={[
          "flex items-start gap-1 [&>span]:text-method",
          props?.className,
        ].join(" ")}
      >
        <Statement
          statement={data.value.condition}
          handleStatement={(val) => handleUpdate("condition", val)}
          prevStatements={prevStatements}
          options={{ disableDelete: true }}
        />
        <span>{"?"}</span>
        <Statement
          statement={data.value.true}
          handleStatement={(val) => handleUpdate("true", val)}
          options={{ disableDelete: true }}
          prevStatements={prevStatements}
        />
        <span>{":"}</span>
        <Statement
          statement={data.value.false}
          handleStatement={(val) => handleUpdate("false", val)}
          prevStatements={prevStatements}
          options={{ disableDelete: true }}
        />
      </div>
    );
  }
);
