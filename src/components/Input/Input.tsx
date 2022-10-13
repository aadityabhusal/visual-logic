import { useRef } from "react";
import styled from "styled-components";
import { IData } from "../../lib/types";

export interface IInput {
  data: IData;
  handleData: (data: IData) => void;
}

export function Input({ data, handleData }: IInput) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputData = {
    wrap: data.value.type === "string" ? `"` : "",
    type: data.value.type === "string" ? `text` : "number",
    constructor: data.value.type === "string" ? String : Number,
  };
  return typeof data.value.value === "string" ||
    typeof data.value.value === "number" ? (
    <div>
      {inputData.wrap && <span>"</span>}
      <InputWrapper
        ref={inputRef}
        width={inputRef.current?.value.length}
        type={inputData.type}
        value={data.value.value}
        onChange={(e) =>
          handleData({
            ...data,
            value: {
              ...data.value,
              value: inputData.constructor(e.target.value),
            },
          })
        }
        onClick={(e) => e.stopPropagation()}
      />
      {inputData.wrap && <span>"</span>}
    </div>
  ) : null;
}

const InputWrapper = styled.input<{ width?: number }>`
  outline: none;
  background-color: inherit;
  border: none;
  color: #eee;
  width: ${({ width }) => width || 1}ch;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type="number"] {
    -moz-appearance: textfield;
  }
`;
