import styled from "styled-components";
import { theme } from "../lib/theme";
import { IData, IFunction, IMethod } from "../lib/types";
import { parseData } from "../lib/utils";

export function Result({ func }: { func: IFunction }) {
  return (
    <div>
      <div style={{ display: "flex" }}>
        <Reserved>function</Reserved> {func.name} {`() {`}
      </div>
      {func.statements.map((statement, i) => {
        let variable = Boolean(statement.variable) && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Reserved>let</Reserved> <Variable>{statement.variable}</Variable>
            <span>=</span>
          </div>
        );
        let data = statement.entities[0] as IData;
        let methods = statement.entities.slice(1) as IMethod[];
        return (
          <div style={{ display: "flex", paddingLeft: "1rem" }} key={i}>
            {variable}
            <Data type={data.type}>{data.name || parseData(data)}</Data>
            <div style={{ display: "flex" }}>
              {methods.map((method) => {
                let params = method.parameters.map((params) =>
                  parseData(params)
                );
                return (
                  <>
                    <Method>.{method.name}</Method>
                    <span>{`(${params.join(", ")})`}</span>
                  </>
                );
              })}
            </div>
          </div>
        );
      })}
      <span>{"}"}</span>
    </div>
  );
}

const Reserved = styled.div`
  color: ${theme.color.reserved};
`;

const Variable = styled.div`
  color: ${theme.color.variable};
`;

const Method = styled.div`
  color: ${theme.color.method};
`;

const Data = styled.div<{ type: string }>`
  color: ${({ type }) => theme.color[type === "string" ? "string" : "white"]};
  margin-left: 0.5rem;
`;
