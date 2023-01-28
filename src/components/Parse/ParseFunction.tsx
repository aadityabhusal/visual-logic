import { IFunction } from "../../lib/types";
import { ParseStatement } from "./ParseStatement";
import { Reserved } from "./styles";

export function ParseFunction({ func }: { func: IFunction }) {
  return (
    <div>
      <div style={{ display: "flex" }}>
        <Reserved>function</Reserved> {func.name} {`() {`}
      </div>
      <div style={{ paddingLeft: "1rem" }}>
        {func.statements.map((statement, i) => (
          <ParseStatement key={i} statement={statement} />
        ))}
      </div>
      <span>{"}"}</span>
    </div>
  );
}
