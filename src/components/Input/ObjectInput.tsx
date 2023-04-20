import styled from "styled-components";
import { TypeMapper } from "../../lib/data";
import { theme } from "../../lib/theme";
import { IData, IOperation, IStatement } from "../../lib/types";
import { createData } from "../../lib/utils";
import { Data } from "../Data";
import { Input } from "./Input";

export interface IObjectInput {
  data: IData;
  handleData: (data: IData) => void;
  path: string[];
  selectOperation: (operation: IOperation) => void;
  prevStatements: IStatement[];
}
export function ObjectInput({
  data,
  handleData,
  path,
  selectOperation,
  prevStatements,
}: IObjectInput) {
  function addToObject() {
    if (data.value instanceof Map && !data.value.has("")) {
      let newMap = new Map(data.value);
      let newData = createData("string", TypeMapper.string.defaultValue, true);
      newMap.set("", newData);
      handleData({
        ...data,
        type: "object",
        value: newMap,
      });
    }
  }

  function handleUpdate(
    dataArray: [string, IData][],
    index: number,
    result: IData,
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
    dataArray: [string, IData][],
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
                <Data
                  data={value}
                  handleData={(val, remove) =>
                    handleUpdate(arr, i, val, remove)
                  }
                  path={path}
                  prevStatements={prevStatements}
                  selectOperation={selectOperation}
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
