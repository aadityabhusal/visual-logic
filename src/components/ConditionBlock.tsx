import { Equals } from "@styled-icons/fa-solid";
import { theme } from "../lib/theme";
import { IConditionBlock } from "../lib/types";
import { createData } from "../lib/utils";
import { Condition } from "./Condition";
import { Data } from "./Data";
import { Input } from "./Input/Input";

export function ConditionBlock({
  conditionBlock,
  handleConditionBlock,
}: {
  conditionBlock: IConditionBlock;
  handleConditionBlock: (condition: IConditionBlock, remove?: boolean) => void;
}) {
  const hasVariable = conditionBlock.variable !== undefined;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
      {hasVariable ? (
        <Input
          data={createData("string", conditionBlock.variable || "")}
          handleData={(data) =>
            handleConditionBlock({
              ...conditionBlock,
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
          handleConditionBlock({
            ...conditionBlock,
            variable: hasVariable ? undefined : "",
          })
        }
      />
      <Condition
        condition={conditionBlock.condition}
        handleCondition={(condition, remove) =>
          handleConditionBlock({ ...conditionBlock, condition })
        }
      />
      <span>?</span>
      <Data
        data={conditionBlock.true}
        handleData={(data) =>
          handleConditionBlock({ ...conditionBlock, true: data })
        }
        disableDelete={true}
      />
      <span>:</span>
      <Data
        data={conditionBlock.false}
        handleData={(data) =>
          handleConditionBlock({ ...conditionBlock, false: data })
        }
        disableDelete={true}
      />
    </div>
  );
}
