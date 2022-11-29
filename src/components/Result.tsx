import { useEffect, useState } from "react";
import { IData } from "../lib/types";
import { sequenceToCode } from "../lib/utils";

export function Result({ sequence }: { sequence: IData[] }) {
  const [codeText, setCodeText] = useState("");
  useEffect(() => {
    setCodeText(sequenceToCode(sequence));
  }, [sequence]);
  return <div>{codeText}</div>;
}
