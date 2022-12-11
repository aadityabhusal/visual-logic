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
    if (data.value instanceof Map && !data.value.has("")) {
      let newMap = new Map(data.value);
      newMap.set("", createData("string", TypeMapper.string.defaultValue));
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
      <span>{"{"}</span>
      {data.value instanceof Map
        ? Array.from(data.value).map(([key, value], i, arr) => {
            return (
              <div key={i} style={{ display: "flex" }}>
                <Input
                  data={createData("string", key)}
                  handleData={(val) => handleKeyUpdate(arr, i, val)}
                />
                <span>:</span>
                <Data
                  data={value}
                  handleData={(val, remove) =>
                    handleUpdate(arr, i, val, remove)
                  }
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
