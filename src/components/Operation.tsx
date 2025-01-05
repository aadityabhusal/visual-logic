import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { Fragment, ReactNode } from "react";
import { IOperation, IStatement } from "../lib/types";
import { updateStatements } from "../lib/update";
import { getOperationResult, createStatement } from "../lib/utils";
import { Statement } from "./Statement";
import { Dropdown } from "../ui/Dropdown";
import { BaseInput } from "./Input/BaseInput";
import { AddStatement } from "./AddStatement";
import { IconButton } from "../ui/IconButton";

export function Operation({
  operation,
  handleOperation,
  addMethod,
  prevStatements,
  prevOperations,
  disableDelete,
  children,
}: {
  operation: IOperation;
  handleOperation(operation: IOperation, remove?: boolean): void;
  addMethod?: () => void;
  prevStatements: IStatement[];
  prevOperations: IOperation[];
  disableDelete?: boolean;
  children?: ReactNode;
}) {
  const hasName = operation.name !== undefined;
  function handleOperationProps(
    key: keyof IOperation,
    value: IOperation[typeof key]
  ) {
    if (key === "name" && prevOperations.find((item) => item.name === value))
      return;
    handleOperation({ ...operation, [key]: value });
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
      previous: [...prevOperations, ...prevStatements, ...operation.closure],
      changedStatement: statement,
      removeStatement: remove,
    });

    handleOperation({
      ...operation,
      parameters: updatedStatements.slice(0, parameterLength),
      statements: updatedStatements.slice(parameterLength),
    });
  }

  const result = getOperationResult(operation);
  const AngleIcon = operation.reference?.isCalled ? FaAngleLeft : FaAngleRight;

  return (
    <Dropdown
      result={{
        ...(operation?.reference?.isCalled && result.entityType === "data"
          ? { data: result }
          : { data: operation }),
      }}
      handleDelete={
        !disableDelete ? () => handleOperation(operation, true) : undefined
      }
      addMethod={addMethod}
      head={
        operation.reference?.name ? (
          <div className="flex items-start gap-1">
            <BaseInput
              value={operation.reference?.name}
              disabled={true}
              type={"variable"}
            />
            {operation.reference.isCalled && (
              <div className="flex items-start gap-1">
                <span>{"("}</span>
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
                <span>{")"}</span>
              </div>
            )}
            {!disableDelete && (
              <IconButton
                icon={AngleIcon}
                className="mt-1"
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
            )}
          </div>
        ) : (
          <div className="max-w-max">
            <div className="flex items-start gap-1">
              {hasName && (
                <BaseInput
                  value={operation.name || ""}
                  onChange={(value) => {
                    let name = value || operation.name;
                    const exists = prevOperations.find(
                      (item) => item.name === name
                    );
                    if (!exists) handleOperationProps("name", name);
                  }}
                  type={"variable"}
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
                    disableDelete={disableDelete}
                    disableNameToggle={true}
                    prevStatements={[]}
                    prevOperations={[]}
                  />
                  {i + 1 < paramList.length && <span>,</span>}
                </Fragment>
              ))}
              {!disableDelete && (
                <AddStatement
                  prevStatements={prevStatements}
                  prevOperations={prevOperations}
                  onSelect={(statement) => {
                    handleOperation({
                      ...operation,
                      parameters: [
                        ...operation.parameters,
                        { ...statement, name: `p_${statement.id.slice(-3)}` },
                      ],
                    });
                  }}
                />
              )}
              <span>{")"}</span>
            </div>
            <div className="pl-4 [&>div]:mb-1">
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
              <AddStatement
                prevStatements={[
                  ...prevStatements,
                  ...operation.parameters,
                  ...operation.statements,
                ]}
                prevOperations={prevOperations}
                onSelect={(statement) => {
                  handleOperation({
                    ...operation,
                    statements: [...operation.statements, statement],
                  });
                }}
              />
            </div>
          </div>
        )
      }
    >
      {children}
    </Dropdown>
  );
}
