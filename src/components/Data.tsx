import { Fragment } from "react";
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
import { getOperationResult, updateStatements } from "../lib/update";
import { Statement } from "./Statement";
import { Operation } from "./Operation";

interface IProps {
  data: IData;
  handleData: (data: IData, remove?: boolean) => void;
  disableDelete?: boolean;
  prevStatements: IStatement[];
  editVariable?: boolean;
  addMethod?: () => void;
}

export function Data({
  data,
  handleData,
  disableDelete,
  prevStatements,
  editVariable,
  addMethod,
}: IProps) {
  const operations = useStore((state) => state.operations);

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
        ? {
            id: statement.id,
            name: statement.name,
            type:
              (statement.data.value as IOperation)?.entityType === "operation"
                ? "operation"
                : "statement",
            parameters: (statement.data.value as IOperation)?.parameters,
          }
        : undefined,
    });
  }

  function updateParameters(operation: IOperation, parameter?: IStatement) {
    let statements = updateStatements({
      statements: [
        ...prevStatements,
        ...operation.parameters,
        ...operation.statements,
      ],
      changedStatement: parameter,
      previousOperations: operations,
    });

    let result = getOperationResult({ ...operation, statements });

    handleData({
      ...data,
      type: result.type,
      value: result.value,
      reference: {
        id: operation.id,
        name: operation.name,
        type: "operation",
        parameters: statements
          .slice(prevStatements.length)
          .slice(0, operation.parameters.length),
      },
    });
  }

  function handleParameters(parameter: IStatement) {
    // Not just operations but also all internal operations should be passed similar to statements
    let operation = operations.find((item) => item.id === data.reference?.id);
    if (!operation) return;
    updateParameters(
      { ...operation, parameters: data.reference?.parameters || [] },
      parameter
    );
  }

  function selectOperation(operation: IOperation) {
    let parameters = operation.parameters.map((item) => ({
      ...item,
      data: {
        ...item.data,
        isGeneric: false,
        value: TypeMapper[item.data.type].defaultValue,
      },
      result: {
        ...item.result,
        value: TypeMapper[item.result.type].defaultValue,
      },
    }));

    updateParameters({ ...operation, parameters }, parameters[0]);
  }

  return (
    <DataWrapper>
      <Dropdown
        result={{ data }}
        handleDelete={!disableDelete ? () => handleData(data, true) : undefined}
        addMethod={data.type !== "operation" ? addMethod : undefined}
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
              {data.reference?.type === "operation" && "("}
              {data.reference.parameters?.map((item, i, paramList) => (
                <Fragment key={item.id}>
                  <Statement
                    statement={item}
                    handleStatement={(parameter) => handleParameters(parameter)}
                    prevStatements={prevStatements}
                    disableName={true}
                    disableDelete={true}
                  />
                  {i + 1 < paramList.length && <span>,</span>}
                </Fragment>
              ))}
              {data.reference?.type === "operation" && ")"}
            </>
          ) : (
            <>
              {data.type === "array" ? (
                <ArrayInput
                  data={data}
                  handleData={handleData}
                  prevStatements={prevStatements}
                />
              ) : data.value instanceof Map ? (
                <ObjectInput
                  data={data}
                  handleData={handleData}
                  prevStatements={prevStatements}
                />
              ) : typeof data.value === "boolean" ? (
                <BooleanInput data={data} handleData={handleData} />
              ) : data.type === "operation" ? (
                <Operation
                  operation={data.value as IOperation}
                  handleOperation={(operation) =>
                    handleData({ ...data, value: operation }, false)
                  }
                  prevStatements={prevStatements}
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
          {prevStatements.map((parameter) => {
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
          <div style={{ borderBottom: `1px solid ${theme.color.border}` }} />
          {operations.map((operation, i) => {
            if (i >= 0) return;
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
