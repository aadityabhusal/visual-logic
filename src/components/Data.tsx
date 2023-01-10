import styled from "styled-components";
import { TypeMapper } from "../lib/data";
import { IData, IStatement, IType } from "../lib/types";
import { Dropdown, DropdownOption, DropdownOptions } from "./Dropdown";
import { ArrayInput } from "./Input/ArrayInput";
import { Input } from "./Input/Input";
import { ObjectInput } from "./Input/ObjectInput";
import { BooleanInput } from "./Input/BooleanInput";
import { theme } from "../lib/theme";
import { useEffect } from "react";
import { useStore } from "../lib/store";

interface IProps {
  data: IData;
  handleData: (data: IData, remove?: boolean) => void;
  fixedType?: keyof IType;
  disableDelete?: boolean;
  parentStatement?: IStatement;
}

export function Data({
  data,
  handleData,
  fixedType,
  disableDelete,
  parentStatement,
}: IProps) {
  const context = useStore((state) => state.functions);
  const contextStatements = context.flatMap((func) => func.statements);
  const dataIndex = contextStatements.findIndex(
    (item) => item.entities[0].id === parentStatement?.entities[0].id
  );
  const reference = data.referenceId
    ? contextStatements.find((statement) => statement.id === data.referenceId)
    : undefined;

  function handleDropdown(value: keyof IType) {
    const inputDefaultValue = TypeMapper[value].defaultValue;
    let returnVal = { type: value, value: inputDefaultValue };
    (data.referenceId || value !== data.type) &&
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
        if (fixedType) handleDropdown(data.type);
        else
          handleData({
            ...data,
            name: reference.variable,
            type: reference.return.type,
            value: reference.return.value,
          });
      }
    } else if (data.referenceId) handleDropdown(data.type);
  }, [reference?.variable, reference?.return.type, reference?.return.value]);

  return (
    <DataWrapper>
      <Dropdown
        data={{ result: data }}
        handleDelete={!disableDelete ? () => handleData(data, true) : undefined}
        head={
          data.entityType === "variable" ? (
            <span style={{ color: theme.color.variable }}>{data.name}</span>
          ) : (
            <>
              {data.type === "array" ? (
                <ArrayInput
                  data={data}
                  handleData={handleData}
                  parentStatement={parentStatement}
                />
              ) : data.value instanceof Map ? (
                <ObjectInput
                  data={data}
                  handleData={handleData}
                  parentStatement={parentStatement}
                />
              ) : typeof data.value === "boolean" ? (
                <BooleanInput data={data} handleData={handleData} />
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
          {Object.keys(TypeMapper).map((item) => {
            if (fixedType && item !== fixedType) return;
            return (
              <DropdownOption
                key={item}
                onClick={() => handleDropdown(item as keyof IType)}
                selected={!data.referenceId && data.type === item}
              >
                {item}
              </DropdownOption>
            );
          })}
          <div style={{ borderBottom: `1px solid ${theme.color.border}` }} />
          {contextStatements.map((statement, i) => {
            if (i >= dataIndex || !statement.variable) return;
            let statementData = statement.return;
            if (fixedType && statementData.type !== fixedType) return;
            return (
              <DropdownOption
                key={statement.id}
                onClick={() => selectVariable(statement)}
                selected={statement.id === data.referenceId}
              >
                {statement.variable}
              </DropdownOption>
            );
          })}
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
