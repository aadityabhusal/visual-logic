import { useState } from "react";
import { initialStatement } from "../lib/data";
import { IData, IOperation } from "../lib/types";
import { createData, createOperation } from "../lib/utils";
import { Data } from "./Data";
import { Operation } from "./Operation";

export function Statement() {
  const [sequence, setSequence] =
    useState<(IData | IOperation)[]>(initialStatement);

  function handleSequence(data: IData | IOperation) {
    setSequence((prev) => {
      const result = [...prev];
      let index = prev.findIndex((item) => item.id === data.id);
      if (index !== -1) {
        result[index] = data;
        if (data.entityType === "operation") result.length = index + 1;
      }
      return result;
    });
  }

  function addData() {
    setSequence((prev) => {
      let lastItem = prev[prev.length - 1];
      let data =
        lastItem.entityType === "operation"
          ? createData(lastItem, prev[prev.length - 2] as IData)
          : createOperation(lastItem);
      return [...prev, data];
    });
  }
  return (
    <div className="statement">
      {sequence.map((item, i) => (
        <div style={{ marginLeft: i / 1.5 + 1 + "rem" }} key={item.id}>
          {item.entityType === "operation" ? (
            <Operation
              operation={item}
              handleOperation={(operation) => handleSequence(operation)}
            />
          ) : (
            <Data data={item} handleData={(data) => handleSequence(data)} />
          )}
        </div>
      ))}
      <button onClick={addData}>{">"}</button>
    </div>
  );
}
