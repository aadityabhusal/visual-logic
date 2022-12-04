import { TypeMapper } from "../../lib/data";
import styled from "styled-components";
import { IData } from "../../lib/types";
import { Data } from "../Data";
import { createData } from "../../lib/utils";

export interface IArrayInput {
  data: IData;
  handleData: (data: IData) => void;
}

export function ArrayInput({ data, handleData }: IArrayInput) {
  function addToArray() {
    Array.isArray(data.value) &&
      handleData({
        ...data,
        type: "array",
        value: [
          ...data.value,
          createData("string", TypeMapper.string.defaultValue),
        ],
      });
  }

  function handleUpdate(result: IData, index: number) {
    if (Array.isArray(data.value)) {
      let resList = [...data.value];
      resList[index] = result;
      handleData({
        ...data,
        type: "array",
        value: resList,
      });
    }
  }
  return (
    <ArrayContainer>
      <span>{"["}</span>
      {Array.isArray(data.value)
        ? data.value.map((item, i, arr) => {
            return (
              <div key={i} style={{ display: "flex" }}>
                <Data data={item} handleData={(val) => handleUpdate(val, i)} />
                {i < arr.length - 1 ? <span>{", "}</span> : null}
              </div>
            );
          })
        : null}
      <div onClick={addToArray} style={{ cursor: "pointer" }}>
        +
      </div>
      <span>{"]"}</span>
    </ArrayContainer>
  );
}

const ArrayContainer = styled.div`
  display: flex;
  align-items: center;
`;
