import { FC, useRef } from "react";
import styled from "styled-components";
import { IInput } from "../lib/types";

export const Input: FC<IInput> = ({ value, onChange, readOnly }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      {typeof value === "string" && <span>"</span>}
      <InputWrapper
        ref={inputRef}
        width={inputRef.current?.value.length}
        type={typeof value === "number" ? "number" : "text"}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        style={{ opacity: readOnly ? 0.9 : 1 }}
      />
      {typeof value === "string" && <span>"</span>}
    </div>
  );
};

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
