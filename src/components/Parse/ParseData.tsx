import { Fragment } from "react";
import styled from "styled-components";
import { theme } from "../../lib/theme";
import { IData } from "../../lib/types";
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
    <div style={{ whiteSpace: "pre", color: theme.color[data.type] }}>
      {data.type === "string" ? `"${data.value}"` : `${data.value}`}
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
    <DataWrapper>
      <Brackets>{"{"}</Brackets>
      {val.map(([key, val], i, arr) => (
        <Fragment key={i}>
          <div>{key}:</div>
          <ParseStatement statement={val} showData={showData} />
          {i + 1 < arr.length && <span>{","}</span>}
        </Fragment>
      ))}
      <Brackets>{"}"}</Brackets>
    </DataWrapper>
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
    <DataWrapper>
      <Brackets>{"["}</Brackets>
      {data.value.map((item, i, arr) => (
        <Fragment key={i}>
          <ParseStatement statement={item} showData={showData} />
          {i + 1 < arr.length && <span>{","}</span>}
        </Fragment>
      ))}
      <Brackets>{"]"}</Brackets>
    </DataWrapper>
  );
}

const Brackets = styled.span`
  color: ${({ theme }) => theme.color.method};
`;

const Variable = styled.span`
  color: ${({ theme }) => theme.color.variable};
`;

const DataWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 4px;
  & > span {
    color: ${({ theme }) => theme.color.method};
  }
`;
