import { useState } from "react";
import { IData } from "../../lib/types";

export interface IInput {
  data: IData;
  handleData: (data: IData) => void;
  noQuotes?: boolean;
  color?: string;
  disabled?: boolean;
}

export function Input({ data, handleData, noQuotes, color, disabled }: IInput) {
  const [textWidth, setTextWidth] = useState(0);
  const inputData = {
    quote: !noQuotes && data.type === "string",
    type: data.type === "string" ? `text` : "number",
    placeholder: data.type === "string" ? `..` : "0",
    text: typeof data.value === "number" ? BigInt(data.value) : data.value,
  };
  return typeof data.value === "string" || typeof data.value === "number" ? (
    <div
      className={
        "relative flex flex-col py-0 " +
        (inputData.quote ? "px-[7px] input-quotes" : "px-0")
      }
    >
      <div
        className="self-start h-0 overflow-hidden whitespace-pre"
        ref={(elem) => setTextWidth(elem?.clientWidth || 7)}
      >
        {inputData.text.toString()}
      </div>
      <input
        className="outline-none bg-inherit border-none p-0 text-white number-input"
        style={{
          ...(textWidth ? { width: textWidth } : {}),
          ...(color ? { color } : {}),
        }}
        type={inputData.type}
        value={data.value.toString()}
        placeholder={inputData.placeholder}
        disabled={disabled}
        onChange={(e) => {
          let value = e.target.value;
          handleData({
            ...data,
            value: data.type === "number" ? Number(value.slice(0, 16)) : value,
          });
        }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  ) : null;
}
