import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { Fragment, useMemo } from "react";
import { IData, IOperation, IStatement } from "../lib/types";
import { updateStatements } from "../lib/update";
import { getOperationResult } from "../lib/utils";
import { Statement } from "./Statement";
import { BaseInput } from "./Input/BaseInput";
import { AddStatement } from "./AddStatement";
import { IconButton } from "../ui/IconButton";
import { Dropdown } from "./Dropdown";
import { getDataDropdownList } from "./DropdownList";

export function Operation({
  operation,
  handleChange,
  addMethod,
  prevStatements,
  prevOperations,
  disableDelete,
}: {
  operation: IOperation;
  handleChange(item: IData | IOperation, remove?: boolean): void;
  addMethod?: () => void;
  prevStatements: IStatement[];
  prevOperations: IOperation[];
  disableDelete?: boolean;
}) {
  const dropdownItems = useMemo(
    () =>
      getDataDropdownList({
        data: operation,
        onSelect: handleChange,
        prevOperations,
        prevStatements,
      }),
    [operation, prevOperations, prevStatements]
  );

  const hasName = operation.name !== undefined;
  function handleOperationProps(
    key: keyof IOperation,
    value: IOperation[typeof key]
  ) {
    if (key === "name" && prevOperations.find((item) => item.name === value))
      return;
    handleChange({ ...operation, [key]: value });
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

    handleChange({
      ...operation,
      parameters: updatedStatements.slice(0, parameterLength),
      statements: updatedStatements.slice(parameterLength),
    });
  }

  const result = getOperationResult(operation);
  const AngleIcon = operation.reference?.isCalled ? FaAngleLeft : FaAngleRight;

  return (
    <Dropdown
      id={operation.id}
      items={dropdownItems}
      handleDelete={
        !disableDelete ? () => handleChange(operation, true) : undefined
      }
      options={{
        withSearch: !operation.reference?.name,
        withDropdownIcon: !operation.reference?.name,
      }}
      value={operation.reference?.name || "operation"}
      addMethod={addMethod}
      target={(props) =>
        operation.reference?.name ? (
          <div className="flex items-start gap-1">
            <BaseInput {...props} className="text-variable" />
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
                      options={{ disableDelete: true }}
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
                  handleChange({
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
                  className={"text-variable"}
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
                    options={{
                      enableVariable: true,
                      disableDelete,
                      disableMethods: true,
                      disableNameToggle: true,
                    }}
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
                    handleChange({
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
                  options={{ enableVariable: true }}
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
                  handleChange({
                    ...operation,
                    statements: [...operation.statements, statement],
                  });
                }}
              />
            </div>
          </div>
        )
      }
    />
  );
}
