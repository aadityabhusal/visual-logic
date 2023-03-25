import styled from "styled-components";
import { TypeMapper } from "../lib/data";
import { IData, IOperation, IStatement, IType } from "../lib/types";
import { Dropdown, DropdownOption, DropdownOptions } from "./Dropdown";
import { ArrayInput } from "./Input/ArrayInput";
import { Input } from "./Input/Input";
import { ObjectInput } from "./Input/ObjectInput";
import { BooleanInput } from "./Input/BooleanInput";
import { theme } from "../lib/theme";
import { useStore } from "../lib/store";
import { getOperationResult } from "../lib/update";

interface IProps {
  data: IData;
  handleData: (data: IData, remove?: boolean) => void;
  disableDelete?: boolean;
  path: string[];
}

export function Data({ data, handleData, disableDelete, path }: IProps) {
  const operations = useStore((state) => state.operations);
  const operationIndex = operations.findIndex((item) => item.id === path[0]);
  const statements = operations[operationIndex]?.statements || [];
  const statementIndex = statements.findIndex((item) => item.id === path[1]);

  function handleDropdown(type: keyof IType) {
    (data.reference?.id || type !== data.type) &&
      handleData({
        ...data,
        type,
        value: TypeMapper[type].defaultValue,
        reference: undefined,
      });
  }

  function selectStatement(statement: IStatement) {
    handleData({
      ...data,
      type: statement.result.type,
      value: statement.result.value,
      reference: statement.variable
        ? {
            id: statement.id,
            name: statement.variable,
            type: "statement",
          }
        : undefined,
    });
  }

  function selectOperation(operation: IOperation) {
    handleData({
      ...data,
      type: operation.result.type,
      value: operation.result.value,
      reference: {
        id: operation.id,
        name: operation.name,
        type: "operation",
      },
    });
  }

  return (
    <DataWrapper>
      <Dropdown
        result={{ data }}
        index={statements.length - statementIndex}
        handleDelete={!disableDelete ? () => handleData(data, true) : undefined}
        head={
          data.reference?.name ? (
            <>
              <span style={{ color: theme.color.variable }}>
                {data.reference?.name}
              </span>
              <span>{data.reference.type === "operation" && "()"}</span>
            </>
          ) : (
            <>
              {data.type === "array" ? (
                <ArrayInput data={data} handleData={handleData} path={path} />
              ) : data.value instanceof Map ? (
                <ObjectInput data={data} handleData={handleData} path={path} />
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
            if (!data.isGeneric && item !== data.type) return;
            return (
              <DropdownOption
                key={item}
                onClick={() => handleDropdown(item as keyof IType)}
                selected={!data.reference?.id && data.type === item}
              >
                {item}
              </DropdownOption>
            );
          })}
          <div style={{ borderBottom: `1px solid ${theme.color.border}` }} />
          {statements.map((statement, i) => {
            if (i >= statementIndex || !statement.variable) return;
            let statementData = statement.result;
            if (!data.isGeneric && statementData.type !== data.type) return;
            return (
              <DropdownOption
                key={statement.id}
                onClick={() => selectStatement(statement)}
                selected={statement.id === data.reference?.id}
              >
                {statement.variable}
              </DropdownOption>
            );
          })}
          <div style={{ borderBottom: `1px solid ${theme.color.border}` }} />
          {operations.map((operation, i) => {
            if (i >= operationIndex) return;
            let operationResult = getOperationResult(operation);
            if (!data.isGeneric && operationResult.type !== data.type) return;
            return (
              <DropdownOption
                key={operation.id}
                onClick={() => selectOperation(operation)}
                selected={operation.id === data.reference?.id}
              >
                {operation.name}
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
