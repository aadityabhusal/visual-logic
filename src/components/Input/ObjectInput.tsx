import styled from "styled-components";
import { TypeMapper } from "../../lib/data";
import { IData } from "../../lib/types";
import { createData } from "../../lib/utils";
import { Data } from "../Data";
import { Input } from "./Input";

export interface IObjectInput {
  data: IData;
  handleData: (data: IData) => void;
}
export function ObjectInput({ data, handleData }: IObjectInput) {
  function addToObject() {
    if (data.value.value instanceof Map && !data.value.value.has("")) {
      let newMap = new Map(data.value.value);
      newMap.set("", createData("string", TypeMapper.string.defaultValue));
      handleData({
        ...data,
        value: {
          type: "object",
          value: newMap,
        },
      });
    }
  }

  function handleUpdate(
    dataArray: [string, IData][],
    index: number,
    result: IData
  ) {
    dataArray[index] = [dataArray[index][0], result];
    handleData({
      ...data,
      value: {
        type: "object",
        value: new Map(dataArray),
      },
    });
  }

  function handleKeyUpdate(
    dataArray: [string, IData][],
    index: number,
    result: IData
  ) {
    if (
      typeof result.value.value === "string" &&
      data.value.value instanceof Map &&
      !data.value.value.has(result.value.value)
    ) {
      dataArray[index] = [result.value.value, dataArray[index][1]];
      handleData({
        ...data,
        value: {
          type: "object",
          value: new Map(dataArray),
        },
      });
    }
  }

  return (
    <ObjectContainer>
      <span>{"{"}</span>
      {data.value.value instanceof Map
        ? Array.from(data.value.value).map(([key, value], i, arr) => {
            return (
              <div key={i} style={{ display: "flex" }}>
                <Input
                  data={createData("string", key)}
                  handleData={(val) => handleKeyUpdate(arr, i, val)}
                />
                <span>:</span>
                <Data
                  data={value}
                  handleData={(val) => handleUpdate(arr, i, val)}
                />
                {i < arr.length - 1 ? <span>{", "}</span> : null}
              </div>
            );
          })
        : null}
      <div onClick={addToObject} style={{ cursor: "pointer" }}>
        +
      </div>
      <span>{"}"}</span>
    </ObjectContainer>
  );
}

const ObjectContainer = styled.div`
  display: flex;
  align-items: center;
`;
