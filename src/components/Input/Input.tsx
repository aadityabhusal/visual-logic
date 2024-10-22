import { useState } from "react";
import { IData } from "../../lib/types";
import { BaseInput } from "../../ui/BaseInput";
import { theme } from "../../lib/theme";

export interface IInput {
  data: IData;
  handleData: (data: IData) => void;
  noQuotes?: boolean;
  color?: keyof typeof theme.color;
  disabled?: boolean;
}
export function Input({ data, handleData, noQuotes, color, disabled }: IInput) {
  const inputData = {
    quote: !noQuotes && data.type === "string",
    type: data.type === "string" ? `text` : "number",
    placeholder: data.type === "string" ? `..` : "0",
    text: typeof data.value === "number" ? BigInt(data.value) : data.value,
  };

  return typeof data.value === "string" || typeof data.value === "number" ? (
    <BaseInput
      containerClassName={inputData.quote ? "px-[7px] input-quotes" : "px-0"}
      className={color ? `text-${color}` : ""}
      type={inputData.type}
      value={data.value.toString()}
      placeholder={inputData.placeholder}
      disabled={disabled}
      onChange={(value) => {
        handleData({
          ...data,
          value: data.type === "number" ? Number(value.slice(0, 16)) : value,
        });
      }}
      onClick={(e) => e.stopPropagation()}
    />
  ) : null;
}
