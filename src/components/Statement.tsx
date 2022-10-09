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
      return [
        ...prev.slice(0, index),
        data,
        ...(data.entityType === "data" ? [prev[index + 1]] : []),
      ];
    });
  }

  function addToSequence() {
    setSequence((prev) => {
      let lastItem = prev[prev.length - 1];
      if (lastItem.entityType === "operation") {
        let data = createData(lastItem, prev[prev.length - 2] as IData);
        let operation = createOperation(data);
        return [...prev, data, operation];
      } else return prev;
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
      {sequence[sequence.length - 1].entityType === "operation" ? (
        <button onClick={addToSequence}>{">"}</button>
      ) : null}
    </div>
  );
}
