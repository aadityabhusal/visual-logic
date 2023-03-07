import { IFunction } from "../../lib/types";
import { ParseStatement } from "./ParseStatement";
import { Reserved } from "./styles";

export function ParseFunction({
  func,
  showVariable,
}: {
  func: IFunction;
  showVariable?: boolean;
}) {
  return (
    <div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Reserved>function</Reserved> {func.name} {`() {`}
      </div>
      <div style={{ paddingLeft: "1rem" }}>
        {func.statements.map((statement, i) => (
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
