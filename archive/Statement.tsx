import { useState } from "react";
import { initialStatement } from "../src/lib/data";
import { IData, IStatement } from "../src/lib/types";
import { createOperationResult, createOperation } from "../lib/utils";
import { Data } from "../src/components/Data";
import { Operation } from "../src/components/Operation";
import { Result } from "../src/components/Result";

export function Statement() {
  const [sequence, setSequence] = useState<IStatement>(initialStatement);

  function handleSequence(data: IData | IOperation) {
    setSequence((prev) => {
      let index = prev.findIndex((item) => item.id === data.id);
      let operation = data.entityType === "data" ? [createOperation(data)] : [];
      return [...prev.slice(0, index), data, ...operation];
    });
  }

  function addToSequence() {
    setSequence((prev) => {
      let lastItem = prev[prev.length - 1];
      if (lastItem.entityType === "operation") {
        let data = createOperationResult(
          lastItem,
          prev[prev.length - 2] as IData
        );
        let operation = createOperation(data);
        return [...prev, data, operation];
      } else return prev;
    });
  }

  return (
    <>
      <div className="statement">
        <Data
          data={sequence[0] as IData}
          handleData={(data) => handleSequence(data)}
        />
        {sequence.slice(1).map((item, i, arr) => (
          <div
            style={{ opacity: i === arr.length - 1 ? 0.7 : 1 }}
            key={item.id}
          >
            {item.entityType === "operation" ? (
              <Operation
                operation={item}
                handleOperation={(operation) => handleSequence(operation)}
              />
            ) : null}
          </div>
        ))}
        {sequence[sequence.length - 1].entityType === "operation" ? (
          <button onClick={addToSequence}>{">"}</button>
        ) : null}
      </div>
      <Result sequence={sequence} />
    </>
  );
}