import { useEffect, useRef } from "react";
import styled from "styled-components";
import { TypeMapper } from "../lib/data";
import { operationMethods } from "../lib/methods";
import { IContextProps, IData, IType } from "../lib/types";
import { ArrayInput } from "./Input/ArrayInput";
import { Input } from "./Input/Input";
import { ObjectInput } from "./Input/ObjectInput";
import { Operation } from "./Operation";
import { createData, createDataResult, getPosition } from "../lib/utils";
import { theme } from "../lib/theme";
import { useStore } from "../lib/store";

interface IProps {
  data: IData;
  handleData: (data: IData, remove?: boolean) => void;
  context: IContextProps;
}

export function Data({ data, handleData, context }: IProps) {
  const setDropdown = useStore((state) => state.setDropdown);
  let ref = useRef<HTMLDivElement>(null);
  const dataIndex = context.statements.findIndex(
    (statement) => statement.id === data.id
  );

  function handleDropdown(value: keyof IType) {
    const inputDefaultValue = TypeMapper[value].defaultValue;
    let returnVal = { type: value, value: inputDefaultValue };
    value !== data.type &&
      handleData({
        ...data,
        ...returnVal,
        entityType: "data",
        return: returnVal,
        referenceId: undefined,
        name: undefined,
        selectedMethod: undefined,
      });
  }

  function addMethod() {
    const selectedMethod = operationMethods[data.type][0];
    let returnVal = createDataResult(data, selectedMethod);
    if (!returnVal) return;
    handleData({
      ...data,
      selectedMethod: { ...selectedMethod, result: returnVal },
      return: returnVal.return,
    });
  }

  function createVariable(value?: string, remove?: boolean) {
    handleData({ ...data, variable: remove ? undefined : value || "" });
  }

  function selectVariable(variable: IData) {
    handleData({
      id: data.id,
      entityType: "variable",
      variable: data.variable,
      referenceId: variable.id,
      return: variable.return,
      ...variable.return,
    });
  }

  useEffect(() => {
    handleData(data);
  }, [data?.variable, data?.type]);

  return (
    <DataWrapper>
      {data.variable !== undefined ? (
        <>
          <div style={{ color: theme.color.reserved }}>let</div>
          <div>
            <Input
              data={createData("string", data.variable)}
              handleData={(value) => createVariable(value.value as string)}
              color={theme.color.variable}
              noQuotes
            />
          </div>
          <div>=</div>
        </>
      ) : null}
      <DataInner
        ref={ref}
        onClick={(e) => {
          e.stopPropagation();
          setDropdown({
            position: getPosition(e.currentTarget),
            display: true,
            data,
            targetRef: ref,
            options: [],
            toggleVariable: (remove: boolean) => createVariable("", remove),
            addMethod: !data.selectedMethod ? addMethod : undefined,
            handleDelete: () => handleData(data, true),
          });
        }}
      >
        {data.type === "array" ? (
          <ArrayInput data={data} handleData={handleData} context={context} />
        ) : data.value instanceof Map ? (
          <ObjectInput data={data} handleData={handleData} context={context} />
        ) : (
          <Input
            data={data}
            handleData={handleData}
            color={theme.color[data.type === "number" ? "number" : "string"]}
          />
        )}
      </DataInner>
      {/*<Dropdown
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
            <span style={{ color: theme.color.variable }}>{data.name}</span>
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
                <Input
                  data={data}
                  handleData={handleData}
                  color={
                    theme.color[data.type === "number" ? "number" : "string"]
                  }
                />
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
              selected={!data.referenceId && data.type === item}
            >
              {item}
            </DropdownOption>
          ))}
          <div style={{ borderBottom: `1px solid ${theme.color.border}` }} />
          {context.statements.map((statement, i) =>
            i < dataIndex && statement.variable ? (
              <DropdownOption
                key={statement.id}
                onClick={() => {
                  setDropdown(false);
                  selectVariable(statement);
                }}
                selected={statement.id === data.referenceId}
              >
                {statement.variable}
              </DropdownOption>
            ) : null
          )}
        </DropdownOptions>
        </Dropdown>*/}
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
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
`;

const DataInner = styled.div`
  background-color: inherit;
  &:hover {
    background-color: ${theme.color.hover};
  }
`;
