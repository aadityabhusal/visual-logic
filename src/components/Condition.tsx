import { Equals } from "@styled-icons/fa-solid";
import { theme } from "../lib/theme";
import { ICondition, IStatement } from "../lib/types";
import { createData } from "../lib/utils";
import { Input } from "./Input/Input";
import { Statement } from "./Statement";

export function Condition({
  condition,
  handleCondition,
}: {
  condition: ICondition;
  handleCondition: (condition: ICondition, remove?: boolean) => void;
}) {
  const hasVariable = condition.variable !== undefined;

  function handleOperators(
    operator: ICondition["condition"],
    remove?: boolean
  ) {
    let result = Boolean(operator.result.value)
      ? condition.true
      : condition.false;
    handleCondition(
      { ...condition, condition: operator, result: result.result },
      remove
    );
  }

  function handleResult(key: "true" | "false", statement: IStatement) {
    let result = Boolean(condition.condition.result.value)
      ? key === "true"
        ? statement
        : condition.true
      : key === "false"
      ? statement
      : condition.false;
    handleCondition({ ...condition, [key]: statement, result: result.result });
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
      {hasVariable ? (
        <Input
          data={createData("string", condition.variable || "")}
          handleData={(data) =>
            handleCondition({
              ...condition,
              variable: data.value as string,
            })
          }
          color={theme.color.variable}
          noQuotes
        />
      ) : null}
      <Equals
        size={10}
        style={{ cursor: "pointer" }}
        onClick={() =>
          handleCondition({
            ...condition,
            variable: hasVariable ? undefined : "",
          })
        }
      />
      <Statement
        statement={condition.condition}
        handleStatement={handleOperators}
        disableVariable={true}
      />
      <span>?</span>
      <Statement
        statement={condition.true}
        handleStatement={(statement) => handleResult("true", statement)}
        disableDelete={true}
        disableVariable={true}
      />
      <span>:</span>
      <Statement
        statement={condition.false}
        handleStatement={(statement) => handleResult("false", statement)}
        disableDelete={true}
        disableVariable={true}
      />
    </div>
  );
}
