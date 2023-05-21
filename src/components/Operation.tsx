import { AngleLeft, AngleRight, Plus } from "@styled-icons/fa-solid";
import { Fragment, ReactNode } from "react";
import styled from "styled-components";
import { theme } from "../lib/theme";
import { IOperation, IStatement } from "../lib/types";
import { updateStatements } from "../lib/update";
import { getOperationResult, createStatement } from "../lib/utils";
import { Input } from "./Input/Input";
import { Statement } from "./Statement";
import { Dropdown } from "../ui/Dropdown";

export function Operation({
  operation,
  handleOperation,
  prevStatements,
  prevOperations,
  disableDelete,
  children,
}: {
  operation: IOperation;
  handleOperation(operation: IOperation, remove?: boolean): void;
  prevStatements: IStatement[];
  prevOperations: IOperation[];
  disableDelete?: boolean;
  children?: ReactNode;
}) {
  function handleOperationProps(
    key: keyof IOperation,
    value: IOperation[typeof key]
  ) {
    if (key === "name" && prevOperations.find((item) => item.name === value))
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
      statements: [
        ...prevStatements,
        ...operation.closure,
        ...operation.parameters,
        ...operation.statements,
      ],
      changedStatement: statement,
      removeStatement: remove,
      previousOperations: prevOperations,
    });

    let prevLength =
      prevStatements.length + operation.closure.length + parameterLength;
    handleOperation({
      ...operation,
      parameters: updatedStatements.slice(
        prevStatements.length + operation.closure.length,
        prevLength
      ),
      statements: updatedStatements.slice(prevLength),
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

  const result = getOperationResult(operation);
  const AngleIcon = operation.reference?.isCalled ? AngleLeft : AngleRight;

  return (
    <Dropdown
      result={{
        ...(operation?.reference?.isCalled && result.entityType === "data"
          ? { data: result }
          : { type: "operation" }),
      }}
      handleDelete={
        !disableDelete ? () => handleOperation(operation, true) : undefined
      }
      head={
        operation.reference?.name ? (
          <OperationHead>
            <Input
              data={{
                id: "",
                type: "string",
                value: operation.reference?.name,
                entityType: "data",
              }}
              handleData={() => {}}
              disabled={true}
              color={theme.color.variable}
              noQuotes
            />
            {operation.reference.isCalled && (
              <OperationHead>
                {"("}
                {operation.parameters.map((parameter, i, paramList) => (
                  <Fragment key={i}>
                    <Statement
                      key={i}
                      statement={parameter}
                      handleStatement={(statement) =>
                        handleStatement({ statement })
                      }
                      prevStatements={prevStatements}
                      prevOperations={prevOperations}
                      disableName={true}
                      disableDelete={true}
                    />
                    {i + 1 < paramList.length && <span>,</span>}
                  </Fragment>
                ))}
                {")"}
              </OperationHead>
            )}
            <AngleIcon
              size={12}
              style={{ marginTop: 2.5 }}
              onClick={() =>
                operation.reference &&
                handleOperation({
                  ...operation,
                  reference: {
                    ...operation.reference,
                    isCalled: !operation.reference.isCalled,
                  },
                })
              }
            />
          </OperationHead>
        ) : (
          <OperationWrapper>
            <OperationHead>
              {operation.name && (
                <Input
                  data={{
                    id: "",
                    type: "string",
                    value: operation.name,
                    entityType: "data",
                  }}
                  handleData={(data) => {
                    let name = (data.value as string) || operation.name;
                    const exists = prevOperations.find(
                      (item) => item.name === name
                    );
                    if (!exists)
                      handleOperationProps("name", data.value as string);
                  }}
                  color={theme.color.variable}
                  noQuotes
                />
              )}
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
                    prevOperations={[]}
                  />
                  {i + 1 < paramList.length && <span>,</span>}
                </Fragment>
              ))}
              <Plus
                size={10}
                style={{ cursor: "pointer", marginTop: 3 }}
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
                  prevOperations={prevOperations}
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
  align-items: flex-start;
  gap: 0.25rem;
`;

const OperationBody = styled.div`
  padding-left: 1rem;
`;
