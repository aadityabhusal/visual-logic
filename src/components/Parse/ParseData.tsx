import { Fragment } from "react";
import styled from "styled-components";
import { theme } from "../../lib/theme";
import { IData, IOperation, IReference } from "../../lib/types";
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
    return <ParseReference reference={data.reference} />;
  }
  if (data.type === "operation") {
    return <ParseData data={(data.value as IOperation).result} showData />;
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
          {item.reference?.name ? (
            <Variable>{item.reference?.name}</Variable>
          ) : (
            <ParseData data={item} />
          )}
          {i + 1 < arr.length && <Comma>,</Comma>}
        </Fragment>
      ))}
      <Brackets>{"]"}</Brackets>
    </div>
  );
}

function ParseReference({ reference }: { reference: IReference }) {
  return reference.parameters ? (
    <>
      <Variable>{reference.name}</Variable>
      {"("}
      {reference.parameters?.map((item, i, paramList) => (
        <Fragment key={item.id}>
          <ParseStatement statement={item} />
          {i + 1 < paramList.length && <span>,</span>}
        </Fragment>
      ))}
      {")"}
    </>
  ) : (
    <div style={{ color: theme.color.variable }}>{reference?.name}</div>
  );
}

const Brackets = styled.span`
  color: ${theme.color.method};
`;

const Variable = styled.span`
  color: ${theme.color.variable};
`;
