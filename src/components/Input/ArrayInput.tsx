import { TypeMapper } from "../../lib/data";
import styled from "styled-components";
import { IData, IStatement } from "../../lib/types";
import { Data } from "../Data";
import { createData } from "../../lib/utils";
import { theme } from "../../lib/theme";

export interface IArrayInput {
  data: IData;
  handleData: (data: IData) => void;
  parentStatement?: IStatement;
}

export function ArrayInput({ data, handleData, parentStatement }: IArrayInput) {
  function addToArray() {
    Array.isArray(data.value) &&
      handleData({
        ...data,
        type: "array",
        value: [
          ...data.value,
          createData("string", TypeMapper.string.defaultValue, true),
        ],
      });
  }

  function handleUpdate(result: IData, index: number, remove?: boolean) {
    if (Array.isArray(data.value)) {
      let resList = [...data.value];
      if (remove) resList.splice(index, 1);
      else resList[index] = result;
      handleData({
        ...data,
        type: "array",
        value: resList,
      });
    }
  }
  return (
    <ArrayContainer>
      <span style={{ color: theme.color.method }}>{"["}</span>
      {Array.isArray(data.value)
        ? data.value.map((item, i, arr) => {
            return (
              <div key={i} style={{ display: "flex" }}>
                <Data
                  data={item}
                  handleData={(val, remove) => handleUpdate(val, i, remove)}
                  parentStatement={parentStatement}
                />
                {i < arr.length - 1 ? <span>{", "}</span> : null}
              </div>
            );
          })
        : null}
      <div onClick={addToArray} style={{ cursor: "pointer" }}>
        +
      </div>
      <span style={{ color: theme.color.method }}>{"]"}</span>
    </ArrayContainer>
  );
}

const ArrayContainer = styled.div`
  display: flex;
  align-items: center;
`;
