import { Fragment } from "react";
import styled from "styled-components";
import { theme } from "../../lib/theme";
import { IData } from "../../lib/types";
import { Comma } from "./styles";
import { ParseStatement } from "./ParseStatement";

export function ParseData({
  data,
  showData,
}: {
  data: IData;
  showData?: boolean;
}) {
  if (!showData && data.reference?.name) {
    return <Variable>{data.reference?.name}</Variable>;
  }
  if (Array.isArray(data.value)) {
    return <ParseArray data={data as IData<"array">} />;
  }
  if (data.value instanceof Map) {
    return <ParseObject data={data as IData<"object">} />;
  }
  return (
    <div style={{ color: theme.color[data.type] }}>
      {typeof data.value === "string" ? `"${data.value}"` : `${data.value}`}
    </div>
  );
}

function ParseObject({ data }: { data: IData<"object"> }) {
  let val = Array.from(data.value);
  return (
    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
      <Brackets>{"{"}</Brackets>
      {val.map(([key, val], i, arr) => (
        <Fragment key={i}>
          <span style={{ marginRight: "4px" }}>{key}:</span>
          {val.reference?.name ? (
            <Variable>{val.reference?.name}</Variable>
          ) : (
            <ParseData data={val} />
          )}
          {i + 1 < arr.length && <Comma>,</Comma>}
        </Fragment>
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
        <Fragment key={i}>
          {item.data.reference?.name ? (
            <Variable>{item.data.reference?.name}</Variable>
          ) : (
            <ParseStatement statement={item} />
          )}
          {i + 1 < arr.length && <Comma>,</Comma>}
        </Fragment>
      ))}
      <Brackets>{"]"}</Brackets>
    </div>
  );
}

const Brackets = styled.span`
  color: ${theme.color.method};
`;

const Variable = styled.span`
  color: ${theme.color.variable};
`;
