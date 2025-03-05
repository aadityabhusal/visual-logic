import { Fragment } from "react";
import { theme } from "../../lib/theme";
import { IData } from "../../lib/types";
import { ParseStatement } from "./ParseStatement";

export function ParseData({
  data,
  showData,
  nest = 0,
}: {
  data: IData;
  showData?: boolean;
  nest?: number;
}) {
  if (!showData && data.reference?.name) {
    return <span className="text-variable">{data.reference?.name}</span>;
  }
  if (Array.isArray(data.value)) {
    return (
      <ParseArray
        data={data as IData<"array">}
        showData={showData}
        nest={nest}
      />
    );
  }
  if (data.value instanceof Map) {
    return (
      <ParseObject
        data={data as IData<"object">}
        showData={showData}
        nest={nest}
      />
    );
  }
  return (
    <span style={{ whiteSpace: "pre", color: theme.color[data.type] }}>
      {data.type === "string" ? `"${data.value}"` : `${data.value}`}
    </span>
  );
}

function ParseObject({
  data,
  showData,
  nest = 0,
}: {
  data: IData<"object">;
  showData?: boolean;
  nest?: number;
}) {
  let val = Array.from(data.value);
  return (
    <span className="gap-1">
      <span className="text-method">{"{"}</span>
      {val.map(([key, val], i, arr) => (
        <Fragment key={i}>
          <span className="text-property">{key}</span>
          {": "}
          <ParseStatement statement={val} showData={showData} nest={nest} />
          {i + 1 < arr.length && ", "}
        </Fragment>
      ))}
      <span className="text-method">{"}"}</span>
    </span>
  );
}

function ParseArray({
  data,
  showData,
  nest = 0,
}: {
  data: IData<"array">;
  showData?: boolean;
  nest?: number;
}) {
  return (
    <span className="gap-1">
      <span className="text-method">{"["}</span>
      {data.value.map((item, i, arr) => (
        <Fragment key={i}>
          <ParseStatement statement={item} showData={showData} nest={nest} />
          {i + 1 < arr.length && ", "}
        </Fragment>
      ))}
      <span className="text-method">{"]"}</span>
    </span>
  );
}
