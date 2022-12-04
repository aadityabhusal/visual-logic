import { useRef } from "react";
import styled from "styled-components";
import { IData } from "../../lib/types";

export interface IInput {
  data: IData;
  handleData: (data: IData) => void;
}

export function Input({ data, handleData }: IInput) {
  const textRef = useRef<HTMLDivElement>(null);
  const inputData = {
    quote: data.type === "string",
    type: data.type === "string" ? `text` : "number",
    placeholder: data.type === "string" ? `..` : "0",
    text: typeof data.value === "number" ? BigInt(data.value) : data.value,
    constructor: data.type === "string" ? String : Number,
  };
  return typeof data.value === "string" || typeof data.value === "number" ? (
    <InputWrapper quote={inputData.quote}>
      <div ref={textRef}>{inputData.text.toString()}</div>
      <InputStyled
        type={inputData.type}
        value={data.value}
        placeholder={inputData.placeholder}
        textWidth={inputData.text.toString() ? textRef.current?.clientWidth : 0}
        onChange={(e) =>
          handleData({
            ...data,
            value: inputData.constructor(e.target.value),
          })
        }
        onClick={(e) => e.stopPropagation()}
      />
    </InputWrapper>
  ) : null;
}

const InputWrapper = styled.div<{ quote?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0 ${({ quote }) => (quote ? "1ch" : "0")};

  & > div {
    align-self: flex-start;
    height: 0px;
    overflow: hidden;
  }

  &::before {
    position: absolute;
    top: 0;
    left: 0;
    content: ${({ quote }) => (quote ? "open-quote" : "")};
  }
  &::after {
    position: absolute;
    top: 0;
    right: 0;
    content: ${({ quote }) => (quote ? "close-quote" : "")};
  }
`;

const InputStyled = styled.input<{ textWidth?: number }>`
  outline: none;
  background-color: inherit;
  border: none;
  color: #eee;
  padding: 0;
  ${({ textWidth }) => `width: ${7 + (textWidth || 0)}px`};

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type="number"] {
    -moz-appearance: textfield;
  }
`;
