import { useState } from "react";
import styled from "styled-components";
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
    <InputWrapper quote={inputData.quote}>
      <div
        style={{ whiteSpace: "pre" }}
        ref={(elem) => setTextWidth(elem?.clientWidth || 7)}
      >
        {inputData.text.toString()}
      </div>
      <InputStyled
        type={inputData.type}
        value={data.value.toString()}
        placeholder={inputData.placeholder}
        textWidth={textWidth}
        color={color}
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
    </InputWrapper>
  ) : null;
}

const InputWrapper = styled.div<{ quote?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0 ${({ quote }) => (quote ? "7px" : "0")};

  & > div {
    align-self: flex-start;
    height: 0px;
    overflow: hidden;
  }

  &::before {
    position: absolute;
    top: 0;
    left: 0;
    color: ${({ theme }) => theme.color.string};
    content: ${({ quote }) => (quote ? "open-quote" : "")};
  }
  &::after {
    position: absolute;
    top: 0;
    right: 0;
    color: ${({ theme }) => theme.color.string};
    content: ${({ quote }) => (quote ? "close-quote" : "")};
  }
`;

export const InputStyled = styled.input<{ textWidth?: number; color?: string }>`
  outline: none;
  background-color: inherit;
  border: none;
  color: ${({ color, theme }) => color || theme.color.white};
  padding: 0;
  ${({ textWidth }) => `width: ${textWidth}px`};

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type="number"] {
    color: ${({ theme }) => theme.color.number};
    appearance: textfield;
  }
`;
