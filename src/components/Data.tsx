import styled from "styled-components";
import { TypeMapper } from "../lib/data";
import { IData, IOperation, IStatement, IType } from "../lib/types";
import { Dropdown, DropdownOption, DropdownOptions } from "./Dropdown";
import { ArrayInput } from "./Input/ArrayInput";
import { Input } from "./Input/Input";
import { ObjectInput } from "./Input/ObjectInput";
import { BooleanInput } from "./Input/BooleanInput";
import { theme } from "../lib/theme";
import { createOperation } from "../lib/utils";

interface IProps {
  data: IData;
  handleData: (data: IData, remove?: boolean) => void;
  selectOperation: (operation: IOperation, remove?: boolean) => void;
  disableDelete?: boolean;
  path: string[];
  prevStatements: IStatement[];
  addMethod?: () => void;
}

export function Data({
  data,
  handleData,
  selectOperation,
  disableDelete,
  path,
  addMethod,
  prevStatements,
}: IProps) {
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

  function selectOperations(statement: IStatement) {
    let operation = statement.data as IOperation;
    selectOperation({
      ...operation,
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
                handleData={() => {}}
                disabled={true}
                color={theme.color.variable}
                noQuotes
              />
            </>
          ) : (
            <>
              {data.type === "array" ? (
                <ArrayInput
                  data={data}
                  handleData={handleData}
                  path={path}
                  prevStatements={prevStatements}
                  selectOperation={selectOperation}
                />
              ) : data.value instanceof Map ? (
                <ObjectInput
                  data={data}
                  handleData={handleData}
                  path={path}
                  prevStatements={prevStatements}
                  selectOperation={selectOperation}
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
          {prevStatements.map((statement) => {
            if (!data.isGeneric && statement.result.type !== data.type) return;
            return (
              <DropdownOption
                key={statement.id}
                onClick={() =>
                  statement.data.entityType === "operation"
                    ? selectOperations(statement)
                    : selectStatement(statement)
                }
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
