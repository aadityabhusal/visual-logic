import { useState } from "react";
import styled from "styled-components";
import { Equals, NotEqual, Play } from "@styled-icons/fa-solid";
import { TypeMapper } from "../lib/data";
import { operationMethods } from "../lib/methods";
import { IContextProps, IData, IType } from "../lib/types";
import { Dropdown } from "./Dropdown";
import { ArrayInput } from "./Input/ArrayInput";
import { Input } from "./Input/Input";
import { ObjectInput } from "./Input/ObjectInput";
import { Operation } from "./Operation";
import { createData } from "../lib/utils";

interface IProps {
  data: IData;
  handleData: (data: IData, remove?: boolean) => void;
  context: IContextProps;
}

export function Data({ data, handleData, context }: IProps) {
  const [dropdown, setDropdown] = useState(false);

  function handleDropdown(value: keyof IType) {
    setDropdown(false);
    const inputDefaultValue = TypeMapper[value].defaultValue;
    value !== data.type &&
      handleData({
        ...data,
        type: value,
        value: inputDefaultValue,
        methods: [],
        selectedMethod: undefined,
      });
  }

  function addMethod() {
    handleData({
      ...data,
      methods: operationMethods[data.type],
      selectedMethod: data.selectedMethod,
    });
    setDropdown(false);
  }

  function handleVariable(value?: string, remove?: boolean) {
    setDropdown(false);
    handleData({ ...data, variable: remove ? undefined : value || "" });
  }

  return (
    <DataWrapper>
      {data.variable !== undefined ? (
        <>
          <div>let</div>
          <div>
            <Input
              data={createData("string", data.variable)}
              handleData={(value) => handleVariable(value.value as string)}
              noQuotes
            />
          </div>
          <div>=</div>
        </>
      ) : null}
      <Dropdown
        display={dropdown}
        setDisplay={setDropdown}
        handleDelete={() => handleData(data, true)}
        hoverContent={
          <>
            {data.variable === undefined ? (
              <Equals size={10} onClick={() => handleVariable()} />
            ) : (
              <NotEqual size={10} onClick={() => handleVariable("", true)} />
            )}
            {!data.methods.length && (
              <Play size={10} onClick={() => addMethod()} />
            )}
          </>
        }
        head={
          <>
            {data.type === "array" ? (
              <ArrayInput
                data={data}
                handleData={handleData}
                context={context}
              />
            ) : data.value instanceof Map ? (
              <ObjectInput
                data={data}
                handleData={handleData}
                context={context}
              />
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
              selected={data.type === item}
            >
              {item}
            </DropdownOption>
          ))}
          <hr />
          {/* {context.statements.map(([key, value]) =>
            data.id !== key ? (
              <DropdownOption key={key}>{value}</DropdownOption>
            ) : null
          )} */}
        </DropdownOptions>
      </Dropdown>
      {data.methods.length ? (
        <Operation
          data={data}
          handleData={(data) => handleData(data)}
          context={context}
        />
      ) : null}
    </DataWrapper>
  );
}

const DataWrapper = styled.div`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
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
