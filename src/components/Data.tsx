import { useState } from "react";
import styled from "styled-components";
import { TypeMapper } from "../lib/data";
import { IData, ITypeName } from "../lib/types";
import { Dropdown } from "./Dropdown";
import { ArrayInput } from "./Input/ArrayInput";
import { Input } from "./Input/Input";

interface IProps {
  data: IData;
  handleData: (data: IData) => void;
}

export function Data({ data, handleData }: IProps) {
  const [dropdown, setDropdown] = useState(false);

  function handleDropdown(value: ITypeName) {
    setDropdown(false);
    const inputDefaultValue = TypeMapper[value].defaultValue;
    value !== data.value.type &&
      handleData({
        ...data,
        value: {
          type: value,
          value: inputDefaultValue,
        },
      });
  }

  return (
    <DataWrapper>
      <Dropdown
        display={dropdown}
        setDisplay={setDropdown}
        head={
          <>
            {data.value.type === "array" ? (
              <ArrayInput data={data} handleData={handleData} />
            ) : (
              <Input data={data} handleData={handleData} />
            )}
          </>
        }
      >
        <DropdownOptions>
          {Object.keys(TypeMapper).map((item) => (
            <DropdownOption
              key={item}
              onClick={() => handleDropdown(item as ITypeName)}
              selected={typeof data.value === item}
            >
              {item}
            </DropdownOption>
          ))}
        </DropdownOptions>
      </Dropdown>
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
