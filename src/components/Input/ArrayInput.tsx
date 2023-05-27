import styled from "styled-components";
import { IData, IOperation, IStatement } from "../../lib/types";
import { createData, createStatement } from "../../lib/utils";
import { theme } from "../../lib/theme";
import { Statement } from "../Statement";

export interface IArrayInput {
  data: IData;
  handleData: (data: IData) => void;
  prevStatements: IStatement[];
  prevOperations: IOperation[];
}

export function ArrayInput({
  data,
  handleData,
  prevStatements,
  prevOperations,
}: IArrayInput) {
  function addToArray() {
    Array.isArray(data.value) &&
      handleData({
        ...data,
        type: "array",
        value: [
          ...data.value,
          createStatement({
            data: createData({ type: "string", isGeneric: true }),
            metadata: { disableName: true },
          }),
        ],
      });
  }

  function handleUpdate(result: IStatement, index: number, remove?: boolean) {
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
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                <Statement
                  statement={item}
                  handleStatement={(val, remove) =>
                    handleUpdate(val, i, remove)
                  }
                  prevOperations={prevOperations}
                  prevStatements={prevStatements}
                />
                {i < arr.length - 1 ? (
                  <span style={{ marginRight: "4px" }}>{", "}</span>
                ) : null}
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
