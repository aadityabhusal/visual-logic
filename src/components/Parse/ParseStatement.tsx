import { Fragment } from "react";
import { IStatement } from "../../lib/types";
import { ParseData } from "./ParseData";
import { Method } from "./styles";
import { ParseOperation } from "./ParseOperation";
import { getStatementResult } from "../../lib/utils";

export function ParseStatement({
  statement,
  showData,
}: {
  statement: IStatement;
  showData?: boolean;
}) {
  if (showData) {
    let result = getStatementResult(statement);
    return result.entityType === "data" ? (
      <ParseData data={result} showData={showData} />
    ) : (
      <ParseOperation operation={result} />
    );
  }

  let dataNode =
    statement.data.entityType === "data" ? (
      <ParseData data={statement.data} showData={showData} />
    ) : (
      <ParseOperation operation={statement.data} />
    );

  return (
    <div style={{ display: "flex" }}>
      {statement.methods.reduce(
        (prev, method, i) => (
          <div key={i} style={{ display: "flex", gap: 4 }}>
            <Method>{`V.${method.name}`}</Method>
            <span>{"("}</span>
            {prev}
            {method.parameters.length ? "," : ""}
            {method.parameters.map((param, i, arr) => (
              <span style={{ display: "flex" }} key={i}>
                <ParseStatement statement={param} />
                {i + 1 < arr.length && <span>{","}</span>}
              </span>
            ))}
            <span>{")"}</span>
          </div>
        ),
        dataNode
      )}
    </div>
  );
}
