import { IStatement } from "../../lib/types";
import { ParseData } from "./ParseData";
import { Method, Reserved, Variable } from "./styles";

export function ParseStatement({ statement }: { statement: IStatement }) {
  return (
    <div style={{ display: "flex" }}>
      <ParseVariable statement={statement} />
      <ParseData data={statement.data} />
      <div style={{ display: "flex" }}>
        {statement.methods.map((method) => (
          <>
            <Method>{`.${method.name}(`}</Method>
            {method.parameters.map((param) => (
              <ParseStatement statement={param} />
            ))}
            <span>{")"}</span>
          </>
        ))}
      </div>
    </div>
  );
}

export function ParseVariable({ statement }: { statement: IStatement }) {
  return !statement.variable ? null : (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <Reserved>let</Reserved> <Variable>{statement.variable}</Variable>
      <span style={{ marginRight: "0.25rem" }}>=</span>
    </div>
  );
}
