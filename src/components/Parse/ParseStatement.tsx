import { Fragment } from "react";
import { IStatement } from "../../lib/types";
import { ParseData } from "./ParseData";
import { Comma, Method, Reserved, Variable } from "./styles";

export function ParseStatement({
  statement,
  showVariable,
  isTopLevel,
  isLast,
}: {
  statement: IStatement;
  showVariable?: boolean;
  isTopLevel?: boolean;
  isLast?: boolean;
}) {
  return (
    <div style={{ display: "flex" }}>
      {isLast ? (
        <Reserved style={{ marginRight: 8 }}>return</Reserved>
      ) : (
        <ParseVariable statement={statement} />
      )}
      <ParseData data={statement.data} showVariable={showVariable} />
      <div style={{ display: "flex" }}>
        {statement.methods.map((method, i) => (
          <Fragment key={i}>
            <Method>{`.${method.name}(`}</Method>
            {method.parameters.map((param, i, arr) => (
              <span style={{ display: "flex" }} key={i}>
                <ParseStatement statement={param} showVariable={showVariable} />
                {i + 1 < arr.length && <Comma>,</Comma>}
              </span>
            ))}
            <span>{")"}</span>
          </Fragment>
        ))}
      </div>
      {isTopLevel ? <span>{";"}</span> : null}
    </div>
  );
}

export function ParseVariable({ statement }: { statement: IStatement }) {
  return !statement.name ? null : (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <Reserved>let</Reserved> <Variable>{statement.name}</Variable>
      <span style={{ marginRight: "0.25rem" }}>=</span>
    </div>
  );
}
