import { useEffect, useState } from "react";
import { IData, IOperation } from "../lib/types";
import { sequenceToCode } from "../lib/utils";

export function Result({ sequence }: { sequence: (IData | IOperation)[] }) {
  const [codeText, setCodeText] = useState("");
  useEffect(() => {
    setCodeText(sequenceToCode(sequence));
  }, [sequence]);
  return <div>{codeText}</div>;
}
