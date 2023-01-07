import styled from "styled-components";
import { TypeMapper } from "../lib/data";
import { IData, IStatement, IType } from "../lib/types";
import { Dropdown, DropdownOption, DropdownOptions } from "./Dropdown";
import { ArrayInput } from "./Input/ArrayInput";
import { Input } from "./Input/Input";
import { ObjectInput } from "./Input/ObjectInput";
import { theme } from "../lib/theme";
import { useEffect } from "react";
import { useStore } from "../lib/store";

interface IProps {
  data: IData;
  handleData: (data: IData, remove?: boolean) => void;
}

export function Data({ data, handleData }: IProps) {
  const context = useStore((state) => state.functions);
  const contextStatements = context.flatMap((func) => func.statements);
  const dataIndex = contextStatements.findIndex(
    (statement) => statement.entities[0].id === data.id
  );
  const reference = data.referenceId
    ? contextStatements.find((statement) => statement.id === data.referenceId)
    : undefined;

  function handleDropdown(value: keyof IType) {
    const inputDefaultValue = TypeMapper[value].defaultValue;
    let returnVal = { type: value, value: inputDefaultValue };
    value !== data.type &&
      handleData({
        ...data,
        ...returnVal,
        entityType: "data",
        referenceId: undefined,
        name: undefined,
      });
  }

  function selectVariable(statement: IStatement) {
    handleData({
      id: data.id,
      entityType: "variable",
      referenceId: statement.id,
      name: statement.variable,
      type: statement.return.type,
      value: statement.return.value,
    });
  }

  useEffect(() => {
    if (reference) {
      if (
        data.type !== reference.return.type ||
        data.name !== reference.variable ||
        JSON.stringify(data.value) !== JSON.stringify(reference.return.value)
      ) {
        handleData({
          ...data,
          name: reference.variable,
          type: reference.return.type,
          value: reference.return.value,
        });
      }
    }
  }, [reference?.variable, reference?.return.type, reference?.return.value]);

  return (
    <DataWrapper>
      <Dropdown
        data={{ result: data }}
        handleDelete={() => handleData(data, true)}
        head={
          data.entityType === "variable" ? (
            <span style={{ color: theme.color.variable }}>{data.name}</span>
          ) : (
            <>
              {data.type === "array" ? (
                <ArrayInput data={data} handleData={handleData} />
              ) : data.value instanceof Map ? (
                <ObjectInput data={data} handleData={handleData} />
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
          {contextStatements.map(
            (statement, i) =>
              i < dataIndex && (
                <DropdownOption
                  key={statement.id}
                  onClick={() => selectVariable(statement)}
                  selected={statement.id === data.referenceId}
                >
                  {statement.variable}
                </DropdownOption>
              )
          )}
        </DropdownOptions>
      </Dropdown>
    </DataWrapper>
  );
}

const DataWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
`;
