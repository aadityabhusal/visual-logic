import { useState } from "react";
import { IData, IOperation } from "../lib/types";
import { Data } from "./Data";
import { Operation } from "./Operation";

export function Statement() {
  const [sequence, setSequence] = useState<(IData | IOperation)[]>([]);

  function handleDataUpdate(data: IData) {
    setSequence((prev) => {
      const result = [...prev];
      let index = prev.findIndex((item) => item.id === data.id);
      if (index !== -1) result[index] = data;
      return result;
    });
  }
  return (
    <div>
      {sequence.map((item) =>
        item.entityType === "operation" ? (
          <Operation operation={item} key={item.id} />
        ) : (
          <Data
            data={item}
            handleData={(data) => handleDataUpdate(data)}
            key={item.id}
          />
        )
      )}
    </div>
  );
}
