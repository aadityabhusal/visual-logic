import { useState } from "react";
import styled from "styled-components";
import { Play } from "@styled-icons/fa-solid";
import { TypeMapper } from "../lib/data";
import { operationMethods } from "../lib/methods";
import { IData, IType } from "../lib/types";
import { Dropdown } from "./Dropdown";
import { ArrayInput } from "./Input/ArrayInput";
import { Input } from "./Input/Input";
import { ObjectInput } from "./Input/ObjectInput";
import { Operation } from "./Operation";

interface IProps {
  data: IData;
  handleData: (data: IData) => void;
}

export function Data({ data, handleData }: IProps) {
  const [dropdown, setDropdown] = useState(false);

  function handleDropdown(value: keyof IType) {
    setDropdown(false);
    const inputDefaultValue = TypeMapper[value].defaultValue;
    value !== data.value.type &&
      handleData({
        ...data,
        value: {
          type: value,
          value: inputDefaultValue,
        },
        methods: [],
        selectedMethod: undefined,
      });
  }

  function addMethods() {
    handleData({
      ...data,
      methods: operationMethods[data.value.type],
    });
    setDropdown(false);
  }

  return (
    <DataWrapper>
      <Dropdown
        display={dropdown}
        setDisplay={setDropdown}
        hoverContent={
          !data.methods.length ? (
            <Play
              size={10}
              onClick={addMethods}
              style={{ marginLeft: "auto", cursor: "pointer" }}
            />
          ) : null
        }
        head={
          <>
            {data.value.type === "array" ? (
              <ArrayInput data={data} handleData={handleData} />
            ) : data.value.value instanceof Map ? (
              <ObjectInput data={data} handleData={handleData} />
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
              onClick={() => handleDropdown(item as keyof IType)}
              selected={data.value.type === item}
            >
              {item}
            </DropdownOption>
          ))}
        </DropdownOptions>
      </Dropdown>
      {data.methods.length ? (
        <Operation data={data} handleData={(data) => handleData(data)} />
      ) : null}
    </DataWrapper>
  );
}

const DataWrapper = styled.div`
  position: relative;
  display: flex;
  flex-wrap: wrap;
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
