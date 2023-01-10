import { operators } from "../lib/data";
import { ICondition, IOperator } from "../lib/types";
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
  function handleOperator(operator: IOperator) {
    handleCondition({
      ...condition,
      operator,
      result: getConditionResult(
        condition.left,
        condition.right,
        operator as keyof typeof operators
      ),
    });
  }

  function handleOperand(
    key: "left" | "right",
    operand: ICondition["left"],
    remove?: boolean
  ) {
    if (remove) return handleCondition(condition, true);
    let result = getConditionResult(
      key === "left" ? operand : condition.left,
      key === "right" ? operand : condition.right,
      condition.operator as keyof typeof operators
    );
    handleCondition({ ...condition, [key]: operand, result });
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
      {condition.left.entityType === "condition" ? (
        <Condition
          condition={condition.left}
          handleCondition={(cond, remove) => {
            handleOperand("left", cond, remove);
          }}
        />
      ) : (
        <Data
          data={condition.left}
          handleData={(data, remove) => {
            handleOperand("left", data, remove);
          }}
          disableDelete={true}
        />
      )}
      <Dropdown
        data={{ result: condition.result }}
        head={<>{condition.operator}</>}
        handleDelete={() => handleCondition(condition, true)}
      >
        <DropdownOptions>
          {(Object.keys(operators) as IOperator[]).map((item) => (
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
      {condition.right.entityType === "condition" ? (
        <Condition
          condition={condition.right}
          handleCondition={(cond, remove) =>
            handleOperand("right", cond, remove)
          }
        />
      ) : (
        <Data
          data={condition.right}
          handleData={(data, remove) => handleOperand("right", data, remove)}
          disableDelete={true}
        />
      )}
    </div>
  );
}
