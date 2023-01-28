import styled from "styled-components";
import { theme } from "../../lib/theme";
import { IData } from "../../lib/types";
import { Comma } from "./styles";

export function ParseData({ data }: { data: IData }) {
  if (Array.isArray(data.value)) {
    return <ParseArray data={data as IData<"array">} />;
  }
  if (data.value instanceof Map) {
    return <ParseObject data={data as IData<"object">} />;
  }
  return (
    <Data type={data.type} variable={data.name}>
      {typeof data.value === "string" ? `"${data.value}"` : `${data.value}`}
    </Data>
  );
}

function ParseObject({ data }: { data: IData<"object"> }) {
  let val = Array.from(data.value);
  return (
    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
      <Brackets>{"{"}</Brackets>
      {val.map(([key, val], i, arr) => (
        <>
          <span style={{ marginRight: "4px" }}>{key}:</span>
          {val.name ? (
            <Variable>{val.name}</Variable>
          ) : (
            <ParseData data={val} />
          )}
          {i + 1 < arr.length && <Comma>,</Comma>}
        </>
      ))}
      <Brackets>{"}"}</Brackets>
    </div>
  );
}

function ParseArray({ data }: { data: IData<"array"> }) {
  return (
    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
      <Brackets>{"["}</Brackets>
      {data.value.map((item, i, arr) => (
        <>
          {item.name ? (
            <Variable>{item.name}</Variable>
          ) : (
            <ParseData data={item} />
          )}
          {i + 1 < arr.length && <Comma>,</Comma>}
        </>
      ))}
      <Brackets>{"]"}</Brackets>
    </div>
  );
}

const Data = styled.div<{
  type: keyof typeof theme["color"];
  variable?: string;
}>`
  color: ${({ type, variable }) =>
    theme.color[variable ? "variable" : type] || "white"};
`;

const Brackets = styled.span`
  color: ${theme.color.method};
`;

const Variable = styled.span`
  color: ${theme.color.variable};
`;
