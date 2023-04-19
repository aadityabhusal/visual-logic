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
import { createOperation } from "../lib/utils";

interface IProps {
  data: IData;
  handleData: (data: IData, remove?: boolean) => void;
  selectOperation: (operation: IOperation, remove?: boolean) => void;
  disableDelete?: boolean;
  path: string[];
  editVariable?: boolean;
  addMethod?: () => void;
}

export function Data({
  data,
  handleData,
  selectOperation,
  disableDelete,
  path,
  editVariable,
  addMethod,
}: IProps) {
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
      reference: statement.name
        ? { id: statement.id, name: statement.name }
        : undefined,
    });
  }

  return (
    <DataWrapper>
      <Dropdown
        result={{ data }}
        handleDelete={!disableDelete ? () => handleData(data, true) : undefined}
        addMethod={addMethod}
        head={
          data.reference?.name ? (
            <>
              <Input
                data={{
                  id: "",
                  type: "string",
                  value: data.reference?.name,
                  entityType: "data",
                }}
                handleData={(item) =>
                  handleData({
                    ...data,
                    reference: data.reference && {
                      ...data.reference,
                      name: (item.value as string) || "",
                    },
                  })
                }
                disabled={!editVariable}
                color={theme.color.variable}
                noQuotes
              />
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
          {data.isGeneric && (
            <DropdownOption
              onClick={() => selectOperation(createOperation(""))}
            >
              operation
            </DropdownOption>
          )}
          <div style={{ borderBottom: `1px solid ${theme.color.border}` }} />
          {operations[operationIndex]?.parameters.map((parameter) => {
            if (!data.isGeneric && parameter.result.type !== data.type) return;
            return (
              <DropdownOption
                key={parameter.id}
                onClick={() => selectStatement(parameter)}
                selected={parameter.id === data.reference?.id}
              >
                {parameter.name}
              </DropdownOption>
            );
          })}
          {statements.map((statement, i) => {
            if (i >= statementIndex || !statement.name) return;
            let statementData = statement.result;
            if (!data.isGeneric && statementData.type !== data.type) return;
            return (
              <DropdownOption
                key={statement.id}
                onClick={() => selectStatement(statement)}
                selected={statement.id === data.reference?.id}
              >
                {statement.name}
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
