import { Plus } from "@styled-icons/fa-solid";
import { Fragment, ReactNode } from "react";
import styled from "styled-components";
import { useStore } from "../lib/store";
import { theme } from "../lib/theme";
import { IOperation, IStatement } from "../lib/types";
import { getOperationResult, updateStatements } from "../lib/update";
import { createStatement } from "../lib/utils";
import { Input } from "./Input/Input";
import { Statement } from "./Statement";
import { Dropdown } from "../ui/Dropdown";

export function Operation({
  operation,
  handleOperation,
  prevStatements,
  disableDelete,
  children,
}: {
  operation: IOperation;
  handleOperation(operation: IOperation, remove?: boolean): void;
  prevStatements: IStatement[];
  disableDelete?: boolean;
  children?: ReactNode;
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
        statements: updatedStatements.slice(parameterLength),
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
    <Dropdown
      result={{ data: operation.result }}
      handleDelete={
        !disableDelete ? () => handleOperation(operation, true) : undefined
      }
      head={
        operation.reference?.name ? (
          <div style={{ display: "flex", gap: 4 }}>
            {operation.reference?.name + "("}
            {operation.parameters.map((parameter, i, paramList) => (
              <Fragment key={i}>
                <Statement
                  key={i}
                  statement={parameter}
                  handleStatement={(statement) =>
                    handleStatement({ statement })
                  }
                  prevStatements={prevStatements}
                  disableMethods={true}
                  disableName={true}
                  disableDelete={true}
                />
                {i + 1 < paramList.length && <span>,</span>}
              </Fragment>
            ))}
            {")"}
          </div>
        ) : (
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
                    disableMethods={true}
                    prevStatements={[]}
                  />
                  {i + 1 < paramList.length && <span>,</span>}
                </Fragment>
              ))}
              <Plus
                size={10}
                style={{ cursor: "pointer" }}
                onClick={addParameter}
              />
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
                  prevStatements={[
                    ...prevStatements,
                    ...operation.parameters,
                    ...operation.statements.slice(0, i),
                  ]}
                />
              ))}
              <Plus
                size={10}
                style={{ cursor: "pointer" }}
                onClick={addStatement}
              />
            </OperationBody>
            <div>{"}"}</div>
          </OperationWrapper>
        )
      }
    >
      {children}
    </Dropdown>
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
