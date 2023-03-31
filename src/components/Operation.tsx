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

  function handleStatement({
    statement,
    remove,
    parameterLength = operation.parameters.length,
  }: {
    statement: IStatement;
    remove?: boolean;
    parameterLength?: number;
  }) {
    let updatedStatements = updateStatements({
      statements: [...operation.parameters, ...operation.statements],
      changedStatement: statement,
      removeStatement: remove,
      previousOperations: operations,
    });

    handleOperation({
      ...operation,
      parameters: updatedStatements.slice(0, parameterLength),
      statements: updatedStatements.slice(parameterLength),
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
              handleStatement={(statement, remove) =>
                handleStatement({
                  statement,
                  remove,
                  parameterLength: paramList.length + (remove ? -1 : 0),
                })
              }
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
              handleStatement({ statement, remove })
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
