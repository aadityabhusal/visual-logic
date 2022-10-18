import { nanoid } from "nanoid";
import styled from "styled-components";
import { TypeMapper } from "../../lib/data";
import { IData } from "../../lib/types";
import { getValueType } from "../../lib/utils";
import { Data } from "../Data";
import { Input } from "./Input";

export interface IObjectInput {
  data: IData;
  handleData: (data: IData) => void;
}
export function ObjectInput({ data, handleData }: IObjectInput) {
  function addToObject() {
    if (
      typeof data.value.value === "object" &&
      !Array.isArray(data.value.value) &&
      data.value.value !== null
    ) {
      handleData({
        ...data,
        value: {
          type: "object",
          value: {
            ...data.value.value,
            "": TypeMapper.string.defaultValue,
          },
        },
      });
    }
  }

  function handleUpdate(result: IData, key: string) {
    if (
      typeof data.value.value === "object" &&
      !Array.isArray(data.value.value) &&
      data.value.value !== null
    ) {
      let resList = Object.assign({}, data.value.value);
      resList[key] = result;
      handleData({
        ...data,
        value: {
          type: "object",
          value: resList,
        },
      });
    }
  }

  function handleKeyUpdate(
    dataArray: [string, IData][],
    index: number,
    key: IData
  ) {
    if (typeof key.value.value === "string") {
      let prevValue = dataArray[index];
      let resList = [...dataArray];
      resList[index] = [key.value.value, prevValue[1]];
      handleData({
        ...data,
        value: {
          type: "object",
          value: Object.fromEntries(resList),
        },
      });
    }
  }

  return (
    <ObjectContainer>
      <span>{"{"}</span>
      {getValueType(data.value.value) === "object"
        ? Object.entries(data.value.value).map(([key, value], i, arr) => {
            return (
              <div key={i} style={{ display: "flex" }}>
                <Input
                  data={{
                    id: nanoid(),
                    entityType: "data",
                    value: { type: "string", value: key },
                  }}
                  handleData={(val) => handleKeyUpdate(arr, i, val)}
                />
                <span>:</span>
                <Data
                  data={value}
                  handleData={(val) => handleUpdate(val, key)}
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
