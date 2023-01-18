import { Equals } from "@styled-icons/fa-solid";
import { theme } from "../lib/theme";
import { ICondition } from "../lib/types";
import { createData } from "../lib/utils";
import { Data } from "./Data";
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
        handleStatement={(statement, remove) => {
          handleCondition({ ...condition, condition: statement }, remove);
        }}
        disableVariable={true}
      />
      <span>?</span>
      <Statement
        statement={condition.true}
        handleStatement={(statement) =>
          handleCondition({ ...condition, true: statement })
        }
        disableDelete={true}
        disableVariable={true}
      />
      <span>:</span>
      <Statement
        statement={condition.false}
        handleStatement={(statement) =>
          handleCondition({ ...condition, false: statement })
        }
        disableDelete={true}
        disableVariable={true}
      />
    </div>
  );
}
