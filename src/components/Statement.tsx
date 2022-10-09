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
      let index = prev.findIndex((item) => item.id === data.id);
      return [...prev.slice(0, index), data];
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
