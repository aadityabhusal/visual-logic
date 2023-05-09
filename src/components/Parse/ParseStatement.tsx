import { Fragment } from "react";
import { IStatement } from "../../lib/types";
import { ParseData } from "./ParseData";
import { Comma, Method } from "./styles";
import { ParseOperation } from "./ParseOperation";

export function ParseStatement({ statement }: { statement: IStatement }) {
  return (
    <div style={{ display: "flex" }}>
      {statement.data.entityType === "data" ? (
        <ParseData data={statement.data} />
      ) : (
        <ParseOperation operation={statement.data} />
      )}
      <div style={{ display: "flex" }}>
        {statement.methods.map((method, i) => (
          <Fragment key={i}>
            <Method>{`.${method.name}(`}</Method>
            {method.parameters.map((param, i, arr) => (
              <span style={{ display: "flex" }} key={i}>
                <ParseStatement statement={param} />
                {i + 1 < arr.length && <Comma>,</Comma>}
              </span>
            ))}
            <span>{")"}</span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
