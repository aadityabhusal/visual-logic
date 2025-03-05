import { Fragment } from "react";
import { IOperation } from "../../lib/types";
import { ParseStatement } from "./ParseStatement";

export function ParseOperation({
  operation,
  nest = 0,
}: {
  operation: IOperation;
  nest?: number;
}) {
  function getTabs(level: number) {
    if (level <= 0) return "";
    return [...Array(level)].map((_) => "\t").join("");
  }
  return operation.reference ? (
    <>
      <span className="text-variable">{operation.reference.name}</span>
      {operation.reference.isCalled && (
        <>
          {"("}
          {operation.parameters?.map((item, i, paramList) => (
            <Fragment key={item.id}>
              <ParseStatement statement={item} nest={nest} />
              {i + 1 < paramList.length && <span>,</span>}
            </Fragment>
          ))}
          {")"}
        </>
      )}
    </>
  ) : (
    <>
      <span>
        <span className="text-reserved">function</span>{" "}
        <span className="text-variable">{operation.name}</span>
        {`(`}
        {operation.parameters.map((parameter, i, arr) => (
          <Fragment key={i}>
            <span className="text-variable">{parameter.name}</span>
            {i + 1 < arr.length && <span>{","}</span>}
          </Fragment>
        ))}
        <span>{`) {\n`}</span>
      </span>
      <span>
        {operation.statements.map((statement, i, statements) => (
          <span key={i}>
            {getTabs(nest + 1)}
            {i + 1 === statements.length ? (
              <span className="text-reserved">return </span>
            ) : (
              <ParseVariable name={statement.name} />
            )}
            <ParseStatement key={i} statement={statement} nest={nest} />
            {";\n"}
          </span>
        ))}
      </span>
      {getTabs(nest)}
      <span>{"}"}</span>
    </>
  );
}

export function ParseVariable({ name }: { name?: string }) {
  return !name ? null : (
    <>
      <span className="text-reserved">let</span>{" "}
      <span className="text-variable">{name}</span> <span>= </span>
    </>
  );
}
