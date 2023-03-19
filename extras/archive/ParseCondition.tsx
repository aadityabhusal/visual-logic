import { ICondition } from "./Condition";
import {
  ParseStatement,
  ParseVariable,
} from "../../src/components/Parse/ParseStatement";

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
