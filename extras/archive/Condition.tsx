import { Equals } from "@styled-icons/fa-solid";
import { theme } from "../../src/lib/theme";
import { IData, IStatement } from "../../src/lib/types";
import { createData, createStatement } from "../../src/lib/utils";
import { Input } from "../../src/components/Input/Input";
import { Statement } from "../../src/components/Statement";
import { ParseStatement } from "../../src/components/Parse/ParseStatement";
import { ParseVariable } from "../../src/components/Parse/ParseOperation";
import { createMethod } from "../../src/lib/methods";

export interface ICondition {
  id: string;
  entityType: "condition";
  condition: IStatement;
  true: IStatement;
  false: IStatement;
  result: IData;
  variable?: string;
}

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

export function createCondition(): ICondition {
  let data = createData("string", "");
  const method = createMethod({ data, name: "==" });
  const condition = createStatement(data, [method]);
  const first = createStatement();
  return {
    id: nanoid(),
    entityType: "condition",
    condition,
    true: first,
    false: createStatement(),
    result: first.result,
  };
}

export function ParseCondition({ condition }: { condition: ICondition }) {
  return (
    <div style={{ display: "flex", gap: "5px" }}>
      <ParseVariable
        statement={{ ...condition.condition, variable: condition.variable }}
      />
      <ParseStatement statement={condition.condition} />
      <span>{"?"}</span>
      <ParseStatement statement={condition.true} />
      <span>{":"}</span>
      <ParseStatement statement={condition.false} />
    </div>
  );
}
