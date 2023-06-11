import { IStatement } from "../../lib/types";
import { ParseData } from "./ParseData";
import { Method } from "./styles";
import { ParseOperation } from "./ParseOperation";
import { getStatementResult } from "../../lib/utils";

export function ParseStatement({
  statement,
  showData,
  nest = 0,
}: {
  statement: IStatement;
  showData?: boolean;
  nest?: number;
}) {
  if (showData) {
    let result = getStatementResult(statement);
    return result.entityType === "data" ? (
      <ParseData data={result} showData={showData} nest={nest + 1} />
    ) : (
      <ParseOperation operation={result} nest={nest + 1} />
    );
  }

  let dataNode =
    statement.data.entityType === "data" ? (
      <ParseData data={statement.data} showData={showData} nest={nest + 1} />
    ) : (
      <ParseOperation operation={statement.data} nest={nest + 1} />
    );

  return statement.methods.reduce(
    (prev, method, i) => (
      <span key={i}>
        <Method>{`V.${method.name}`}</Method>
        {"("}
        {prev}
        {method.parameters.length ? ", " : ""}
        {method.parameters.map((param, i, arr) => (
          <span key={i}>
            <ParseStatement nest={nest + 1} statement={param} />
            {i + 1 < arr.length && ", "}
          </span>
        ))}
        {")"}
      </span>
    ),
    dataNode
  );
}
