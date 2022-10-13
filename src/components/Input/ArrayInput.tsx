import styled from "styled-components";
import { IData, IValue } from "../../lib/types";
import { createEmptyData } from "../../lib/utils";
import { Data } from "../Data";

export interface IArrayInput {
  data: IData;
  handleData: (data: IData) => void;
}

export function ArrayInput({ data, handleData }: IArrayInput) {
  function addToArray() {
    Array.isArray(data.value.value) &&
      handleData({
        ...data,
        value: {
          type: "array",
          subType: "string",
          value: [...data.value.value, ""],
        },
      });
  }

  function handleUpdate(result: IData, index: number) {
    if (Array.isArray(data.value.value)) {
      let resList = [...data.value.value];
      resList[index] = result.value.value as string | number;
      handleData({
        ...data,
        value: {
          type: "array",
          subType: result.value.type,
          value: resList,
        },
      });
    }
  }
  return (
    <ArrayContainer>
      <>
        <span>{"["}</span>
        {Array.isArray(data.value.value)
          ? data.value.value.map((item, i, arr) => {
              let createData = createEmptyData(
                data.value.subType || "string",
                item
              );
              return (
                <>
                  <Data
                    key={i}
                    data={createData}
                    handleData={(val) => handleUpdate(val, i)}
                  />
                  {i < arr.length - 1 ? <span>{", "}</span> : null}
                </>
              );
            })
          : null}
        <div onClick={addToArray} style={{ cursor: "pointer" }}>
          +
        </div>
        <span>{"]"}</span>
      </>
    </ArrayContainer>
  );
}

const ArrayContainer = styled.div`
  display: flex;
`;
