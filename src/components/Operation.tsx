import { Fragment, useMemo } from "react";
import { IData, IStatement, OperationType } from "../lib/types";
import { updateStatements } from "../lib/update";
import { createVariableName, getDataDropdownList } from "../lib/utils";
import { Statement } from "./Statement";
import { BaseInput } from "./Input/BaseInput";
import { AddStatement } from "./AddStatement";
import { Dropdown } from "./Dropdown";

export function Operation({
  operation,
  handleChange,
  addMethod,
  prevStatements,
  options,
}: {
  operation: IData<OperationType>;
  handleChange(item: IStatement["data"], remove?: boolean): void;
  addMethod?: () => void;
  prevStatements: IStatement[];
  options?: {
    disableDelete?: boolean;
    disableDropdown?: boolean;
    isTopLevel?: boolean;
  };
}) {
  const dropdownItems = useMemo(
    () =>
      getDataDropdownList({
        data: operation,
        onSelect: handleChange,
        prevStatements,
      }),
    [operation, prevStatements, options?.disableDropdown]
  );

  function handleStatement({
    statement,
    remove,
    parameterLength = operation.value.parameters.length,
  }: {
    statement: IStatement;
    remove?: boolean;
    parameterLength?: number;
  }) {
    let updatedStatements = updateStatements({
      statements: [
        ...operation.value.parameters,
        ...operation.value.statements,
      ],
      previous: prevStatements,
      changedStatement: statement,
      removeStatement: remove,
    });

    handleChange({
      ...operation,
      value: {
        ...operation.value,
        parameters: updatedStatements.slice(0, parameterLength),
        statements: updatedStatements.slice(parameterLength),
      },
    });
  }

  return (
    <Dropdown
      id={operation.id}
      data={operation}
      result={operation}
      items={dropdownItems}
      handleDelete={
        options?.disableDelete || options?.isTopLevel
          ? undefined
          : () => handleChange(operation, true)
      }
      options={
        options?.disableDropdown || operation.reference
          ? undefined
          : { withSearch: true, withDropdownIcon: true, focusOnClick: true }
      }
      value={operation.reference?.name || "operation"}
      addMethod={addMethod}
      isInputTarget={!!operation.reference}
      reference={operation.reference}
      target={(props) =>
        operation.reference ? (
          <div className="flex items-start gap-1" onClick={props.onClick}>
            <BaseInput {...props} className="text-variable" />
          </div>
        ) : (
          <div className="max-w-max" onClick={props.onClick}>
            <div className="flex items-start gap-1">
              <span>{"("}</span>
              {operation.value.parameters.map((parameter, i, paramList) => (
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
                      disableDelete: options?.disableDelete,
                      disableMethods: true,
                      disableNameToggle: true,
                    }}
                    prevStatements={[]}
                  />
                  {i + 1 < paramList.length && <span>,</span>}
                </Fragment>
              ))}
              {options?.disableDelete ? null : (
                <AddStatement
                  id={`${operation.id}_paramAddStatement`}
                  prevStatements={prevStatements}
                  onSelect={(statement) => {
                    handleChange({
                      ...operation,
                      value: {
                        ...operation.value,
                        parameters: [
                          ...operation.value.parameters,
                          {
                            ...statement,
                            name: createVariableName({
                              prefix: "param",
                              prev: [
                                ...operation.value.parameters,
                                ...prevStatements,
                              ],
                            }),
                          },
                        ],
                      },
                    });
                  }}
                  iconProps={{ title: "Add parameter" }}
                />
              )}
              <span>{")"}</span>
            </div>
            <div className="pl-4 [&>div]:mb-1 w-fit">
              {operation.value.statements.map((statement, i) => (
                <Statement
                  key={statement.id}
                  statement={statement}
                  options={{ enableVariable: true }}
                  handleStatement={(statement, remove) =>
                    handleStatement({ statement, remove })
                  }
                  prevStatements={[
                    ...prevStatements,
                    ...operation.value.parameters,
                    ...operation.value.statements.slice(0, i),
                  ]}
                  addStatement={(statement, position) => {
                    const index = position === "before" ? i : i + 1;
                    handleChange({
                      ...operation,
                      value: {
                        ...operation.value,
                        statements: [
                          ...operation.value.statements.slice(0, index),
                          statement,
                          ...operation.value.statements.slice(index),
                        ],
                      },
                    });
                  }}
                />
              ))}
              {operation.value.statements.length ? null : (
                <AddStatement
                  id={`${operation.id}_addStatement`}
                  prevStatements={[
                    ...prevStatements,
                    ...operation.value.parameters,
                    ...operation.value.statements,
                  ]}
                  onSelect={(statement) => {
                    handleChange({
                      ...operation,
                      value: {
                        ...operation.value,
                        statements: [...operation.value.statements, statement],
                      },
                    });
                  }}
                  iconProps={{ title: "Add statement" }}
                />
              )}
            </div>
          </div>
        )
      }
    />
  );
}
