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
    return <ParseArray data={data as IData<"array">} showData={showData} />;
  }
  if (data.value instanceof Map) {
    return <ParseObject data={data as IData<"object">} showData={showData} />;
  }
  return (
    <div style={{ color: theme.color[data.type] }}>
      {typeof data.value === "string" ? `"${data.value}"` : `${data.value}`}
    </div>
  );
}

function ParseObject({
  data,
  showData,
}: {
  data: IData<"object">;
  showData?: boolean;
}) {
  let val = Array.from(data.value);
  return (
    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
      <Brackets>{"{"}</Brackets>
      {val.map(([key, val], i, arr) => (
        <Fragment key={i}>
          <span style={{ marginRight: "4px" }}>{key}:</span>
          <ParseStatement statement={val} showData={showData} />
          {i + 1 < arr.length && <Comma>,</Comma>}
        </Fragment>
      ))}
      <Brackets>{"}"}</Brackets>
    </div>
  );
}

function ParseArray({
  data,
  showData,
}: {
  data: IData<"array">;
  showData?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
      <Brackets>{"["}</Brackets>
      {data.value.map((item, i, arr) => (
        <Fragment key={i}>
          <ParseStatement statement={item} showData={showData} />
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
