import styled from "styled-components";
import { theme } from "../../lib/theme";
import { IData, IOperation, IStatement } from "../../lib/types";
import { createData, createStatement } from "../../lib/utils";
import { Input } from "./Input";
import { Statement } from "../Statement";

export interface IObjectInput {
  data: IData;
  handleData: (data: IData) => void;
  prevStatements: IStatement[];
  prevOperations: IOperation[];
}
export function ObjectInput({
  data,
  handleData,
  prevStatements,
  prevOperations,
}: IObjectInput) {
  function addToObject() {
    if (data.value instanceof Map && !data.value.has("")) {
      let newMap = new Map(data.value);
      let newData = createStatement({
        data: createData({ type: "string" }),
        metadata: { disableName: true, isGeneric: true },
      });
      newMap.set("", newData);
      handleData({
        ...data,
        type: "object",
        value: newMap,
      });
    }
  }

  function handleUpdate(
    dataArray: [string, IStatement][],
    index: number,
    result: IStatement,
    remove?: boolean
  ) {
    if (remove) dataArray.splice(index, 1);
    else dataArray[index] = [dataArray[index][0], result];
    handleData({
      ...data,
      type: "object",
      value: new Map(dataArray),
    });
  }

  function handleKeyUpdate(
    dataArray: [string, IStatement][],
    index: number,
    result: IData
  ) {
    if (
      typeof result.value === "string" &&
      data.value instanceof Map &&
      !data.value.has(result.value)
    ) {
      dataArray[index] = [result.value, dataArray[index][1]];
      handleData({
        ...data,
        type: "object",
        value: new Map(dataArray),
      });
    }
  }

  return (
    <ObjectContainer>
      <span style={{ color: theme.color.method }}>{"{"}</span>
      {data.value instanceof Map
        ? Array.from(data.value).map(([key, value], i, arr) => {
            return (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                <Input
                  data={{
                    id: `${i}-${key}`,
                    type: "string",
                    value: key,
                    entityType: "data",
                  }}
                  handleData={(val) => handleKeyUpdate(arr, i, val)}
                  color={theme.color.property}
                  noQuotes
                />
                <span>:</span>
                <Statement
                  statement={value}
                  handleStatement={(val, remove) =>
                    handleUpdate(arr, i, val, remove)
                  }
                  prevOperations={prevOperations}
                  prevStatements={prevStatements}
                />
                {i < arr.length - 1 ? <span>{", "}</span> : null}
              </div>
            );
          })
        : null}
      <div onClick={addToObject} style={{ cursor: "pointer" }}>
        +
      </div>
      <span style={{ color: theme.color.method }}>{"}"}</span>
    </ObjectContainer>
  );
}

const ObjectContainer = styled.div`
  display: flex;
  align-items: center;
`;
