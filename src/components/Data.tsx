import { useEffect, useState } from "react";
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
import { createData, createDataResult } from "../lib/utils";

interface IProps {
  data: IData;
  handleData: (data: IData, remove?: boolean) => void;
  context: IContextProps;
}

export function Data({ data, handleData, context }: IProps) {
  const [dropdown, setDropdown] = useState(false);
  const dataIndex = context.statements.findIndex(
    (statement) => statement.id === data.id
  );

  function handleDropdown(value: keyof IType) {
    setDropdown(false);
    const inputDefaultValue = TypeMapper[value].defaultValue;
    value !== data.type &&
      handleData({
        ...data,
        type: value,
        value: inputDefaultValue,
        selectedMethod: undefined,
      });
  }

  function addMethod() {
    setDropdown(false);
    const selectedMethod = operationMethods[data.type][0];
    selectedMethod.result = createDataResult(data, selectedMethod);
    handleData({ ...data, selectedMethod });
  }

  function createVariable(value?: string, remove?: boolean) {
    setDropdown(false);
    handleData({ ...data, variable: remove ? undefined : value || "" });
  }

  function selectVariable(variable: IData) {
    handleData({
      id: data.id,
      type: variable.type,
      value: variable.value,
      variable: undefined,

      entityType: "variable",
      referenceId: variable.id,
    });
  }

  useEffect(() => {
    handleData(data);
  }, [data?.variable, data?.type]);

  return (
    <DataWrapper>
      {data.variable !== undefined ? (
        <>
          <div>let</div>
          <div>
            <Input
              data={createData("string", data.variable)}
              handleData={(value) => createVariable(value.value as string)}
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
              <Equals size={10} onClick={() => createVariable()} />
            ) : (
              <NotEqual size={10} onClick={() => createVariable("", true)} />
            )}
            {!data.selectedMethod && <Play size={10} onClick={addMethod} />}
          </>
        }
        head={
          data.entityType === "variable" ? (
            data.name
          ) : (
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
          )
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
          {context.statements.map((statement, i) =>
            i < dataIndex && statement.variable ? (
              <DropdownOption
                key={statement.id}
                onClick={() => selectVariable(statement)}
              >
                {statement.variable}
              </DropdownOption>
            ) : null
          )}
        </DropdownOptions>
      </Dropdown>
      {data.selectedMethod ? (
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
