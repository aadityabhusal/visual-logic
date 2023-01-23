import { IFunction } from "../../lib/types";
import { ParseCondition } from "./ParseCondition";
import { ParseStatement } from "./ParseStatement";
import { Reserved } from "./styles";

export function ParseFunction({ func }: { func: IFunction }) {
  return (
    <div>
      <div style={{ display: "flex" }}>
        <Reserved>function</Reserved> {func.name} {`() {`}
      </div>
      <div style={{ paddingLeft: "1rem" }}>
        {func.statements.map((statement, i) =>
          statement.entityType === "statement" ? (
            <ParseStatement key={i} statement={statement} />
          ) : (
            <ParseCondition key={i} condition={statement} />
          )
        )}
      </div>
      <span>{"}"}</span>
    </div>
  );
}
