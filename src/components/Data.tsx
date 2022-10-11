import { useState } from "react";
import styled from "styled-components";
import { typeToComponent, typeToObject } from "../lib/data";
import { IData, IValue } from "../lib/types";
import { Dropdown } from "./Dropdown";

interface IProps {
  data: IData;
  handleData: (data: IData) => void;
  readOnly?: boolean;
}

export function Data({ data, handleData, readOnly }: IProps) {
  const [dropdown, setDropdown] = useState(false);
  const ValueConstructor = typeToObject[typeof data.value];
  const Input = typeToComponent[typeof data.value];

  function handleDropdown(value: IValue) {
    setDropdown(false);
    value !== typeof data.value &&
      handleData({
        ...data,
        value: typeToObject[value](Number(data.value) || ""),
      });
  }

  return (
    <DataWrapper>
      <Input
        value={data.value}
        onChange={(e) =>
          handleData({ ...data, value: ValueConstructor(e.target.value) })
        }
        readOnly={readOnly}
      />
      {!readOnly ? (
        <Dropdown display={dropdown} setDisplay={setDropdown}>
          <DropdownOptions>
            {Object.keys(typeToObject).map((item) => (
              <DropdownOption
                key={item}
                onClick={() => handleDropdown(item)}
                selected={typeof data.value === item}
              >
                {item}
              </DropdownOption>
            ))}
          </DropdownOptions>
        </Dropdown>
      ) : null}
    </DataWrapper>
  );
}

const DataWrapper = styled.div`
  position: relative;
  display: flex;
`;

export const DropdownOptions = styled.div`
  cursor: pointer;
  background-color: #fff;
  color: #000;
`;

export const DropdownOption = styled.div<{ selected?: boolean }>`
  font-size: 0.8rem;
  padding: 0.1rem 0.2rem;
  background-color: ${({ selected }) => (selected ? "#bbb" : "inherit")};
  &:hover {
    background-color: #ddd;
  }
`;
