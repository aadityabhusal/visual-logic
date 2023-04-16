import { Fragment } from "react";
import { IOperation } from "../../lib/types";
import { ParseStatement } from "./ParseStatement";
import { Comma, Reserved, Variable } from "./styles";

export function ParseOperation({ operation }: { operation: IOperation }) {
  return (
    <div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Reserved>function</Reserved> {operation.name} {`(`}
        {operation.parameters.map((parameter, i, arr) => (
          <Fragment key={i}>
            <Variable>{parameter.name}</Variable>
            {i + 1 < arr.length && <Comma>,</Comma>}
          </Fragment>
        ))}
        {`) {`}
      </div>
      <div style={{ paddingLeft: "1rem" }}>
        {operation.statements.map((statement, i, statements) => (
          <div style={{ display: "flex" }} key={i}>
            {i + 1 === statements.length ? (
              <Reserved style={{ marginRight: 8 }}>return</Reserved>
            ) : (
              <ParseVariable name={statement.name} />
            )}
            <ParseStatement key={i} statement={statement} />
            <span>;</span>
          </div>
        ))}
      </div>
      <span>{"}"}</span>
    </div>
  );
}

export function ParseVariable({ name }: { name?: string }) {
  return !name ? null : (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <Reserved>let</Reserved> <Variable>{name}</Variable>
      <span style={{ marginRight: "0.25rem" }}>=</span>
    </div>
  );
}
