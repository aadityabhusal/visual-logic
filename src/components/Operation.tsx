import { Plus } from "@styled-icons/fa-solid";
import { Fragment } from "react";
import styled from "styled-components";
import { useStore } from "../lib/store";
import { theme } from "../lib/theme";
import { IOperation, IStatement } from "../lib/types";
import { getOperationResult, updateStatements } from "../lib/update";
import { createStatement } from "../lib/utils";
import { Input } from "./Input/Input";
import { Statement } from "./Statement";

export function Operation({
  operation,
  handleOperation,
}: {
  operation: IOperation;
  handleOperation(operation: IOperation): void;
}) {
  const operations = useStore((state) => state.operations);

  function handleOperationProps(
    key: keyof IOperation,
    value: IOperation[typeof key]
  ) {
    if (key === "name" && operations.find((item) => item.name === value))
      return;
    handleOperation({ ...operation, [key]: value });
  }

  function addStatement() {
    let statements = [...operation.statements, createStatement()];
    handleOperation({ ...operation, statements });
  }

  function handleStatement(
    index: number,
    statement: IOperation["statements"][number],
    remove?: boolean
  ) {
    let statements = [...operation.statements];
    if (remove) statements.splice(index, 1);
    else statements[index] = statement;

    let updatedStatements = updateStatements({
      statements,
      changedStatement: statement,
      changedStatementIndex: index,
      removeStatement: remove,
    });

    handleOperation({
      ...operation,
      statements: updatedStatements,
      result: getOperationResult({
        ...operation,
        statements: updatedStatements,
      }),
    });
  }

  function addParameter() {
    let newStatement = createStatement();
    let parameter = {
      ...newStatement,
      name: `p_${newStatement.id.slice(-3)}`,
    };
    handleOperation({
      ...operation,
      parameters: [...operation.parameters, parameter],
    });
  }

  function handleParameter(parameter: IStatement, remove?: boolean) {
    let nameExists = !operation.parameters.find(
      (item) => item.name === parameter.name
    );
    let parameterName = nameExists && parameter.name;

    handleOperation({
      ...operation,
      parameters: operation.parameters
        .filter((item) => (remove ? item.id !== parameter.id : true))
        .map((item) => ({
          ...item,
          ...(item.id === parameter.id && {
            name: parameterName || item.name,
            data: {
              ...item.data,
              type: parameter.data.type,
              value: parameter.data.value,
            },
          }),
        })),
    });
  }

  return (
    <OperationWrapper>
      <OperationHead>
        <Input
          data={{
            id: "",
            type: "string",
            value: operation.name,
            entityType: "data",
          }}
          handleData={(data) =>
            handleOperationProps("name", data.value as string)
          }
          color={theme.color.variable}
          noQuotes
        />
        <span>{"("}</span>
        {operation.parameters.map((parameter, i, paramList) => (
          <Fragment key={i}>
            <Statement
              key={i}
              statement={parameter}
              handleStatement={handleParameter}
              path={[operation.id]}
              disableMethods={true}
            />
            {i + 1 < paramList.length && <span>,</span>}
          </Fragment>
        ))}
        <Plus size={10} style={{ cursor: "pointer" }} onClick={addParameter} />
        <span>{") {"}</span>
      </OperationHead>
      <OperationBody>
        {operation.statements.map((statement, i) => (
          <Statement
            key={statement.id}
            statement={statement}
            handleStatement={(statement, remove) =>
              handleStatement(i, statement, remove)
            }
            path={[operation.id]}
          />
        ))}
        <Plus size={10} style={{ cursor: "pointer" }} onClick={addStatement} />
      </OperationBody>
      <div>{"}"}</div>
    </OperationWrapper>
  );
}

const OperationWrapper = styled.div`
  max-width: max-content;
`;

const OperationHead = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const OperationBody = styled.div`
  padding-left: 1rem;
`;
