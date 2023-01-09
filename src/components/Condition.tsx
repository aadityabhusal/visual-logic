import { operators } from "../lib/data";
import { ICondition } from "../lib/types";
import { getConditionResult } from "../lib/utils";
import { Data } from "./Data";
import { Dropdown, DropdownOption, DropdownOptions } from "./Dropdown";

export function Condition({
  condition,
  handleCondition,
}: {
  condition: ICondition;
  handleCondition: (condition: ICondition, remove?: boolean) => void;
}) {
  function handleOperator(operator: string) {
    handleCondition({
      ...condition,
      operator,
      return: getConditionResult(
        condition.first,
        condition.second,
        operator as keyof typeof operators
      ),
    });
  }

  function handleOperand(
    key: "first" | "second",
    operand: ICondition["first"],
    remove?: boolean
  ) {
    if (remove) return handleCondition(condition, true);
    let result = getConditionResult(
      key === "first" ? operand : condition.first,
      key === "second" ? operand : condition.second,
      condition.operator as keyof typeof operators
    );
    handleCondition({ ...condition, [key]: operand, return: result });
  }

  return (
    <div style={{ display: "flex", gap: "0.25rem" }}>
      {condition.first.entityType === "condition" ? (
        <Condition
          condition={condition.first}
          handleCondition={(cond, remove) =>
            handleOperand("first", cond, remove)
          }
        />
      ) : (
        <Data
          data={condition.first}
          handleData={(data, remove) => handleOperand("first", data, remove)}
        />
      )}
      <Dropdown
        data={{ result: condition.return }}
        head={<>{condition.operator}</>}
        handleDelete={() => handleCondition(condition, true)}
      >
        <DropdownOptions>
          {Object.keys(operators).map((item) => (
            <DropdownOption
              key={item}
              selected={item === condition.operator}
              onClick={() => handleOperator(item)}
            >
              {item}
            </DropdownOption>
          ))}
        </DropdownOptions>
      </Dropdown>
      {condition.second.entityType === "condition" ? (
        <Condition
          condition={condition.second}
          handleCondition={(cond, remove) =>
            handleOperand("second", cond, remove)
          }
        />
      ) : (
        <Data
          data={condition.second}
          handleData={(data, remove) => handleOperand("second", data, remove)}
        />
      )}
    </div>
  );
}
