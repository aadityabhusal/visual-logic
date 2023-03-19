import { IOperation } from "../../lib/types";
import { ParseStatement } from "./ParseStatement";
import { Reserved } from "./styles";

export function ParseOperation({
  operation,
  showVariable,
}: {
  operation: IOperation;
  showVariable?: boolean;
}) {
  return (
    <div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Reserved>function</Reserved> {operation.name} {`() {`}
      </div>
      <div style={{ paddingLeft: "1rem" }}>
        {operation.statements.map((statement, i) => (
          <ParseStatement
            key={i}
            statement={statement}
            showVariable={showVariable}
            isTopLevel={true}
          />
        ))}
      </div>
      <span>{"}"}</span>
    </div>
  );
}