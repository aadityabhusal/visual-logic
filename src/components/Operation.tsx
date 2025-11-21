import { Fragment, forwardRef, HTMLAttributes } from "react";
import { IData, IStatement, OperationType } from "../lib/types";
import { updateStatements } from "../lib/update";
import { createVariableName, getOperationType } from "../lib/utils";
import { Statement } from "./Statement";
import { AddStatement } from "./AddStatement";

export interface OperationInputProps extends HTMLAttributes<HTMLDivElement> {
  operation: IData<OperationType>;
  handleChange: (data: IData<OperationType>, remove?: boolean) => void;
  prevStatements: IStatement[];
  options?: {
    disableDelete?: boolean;
    disableDropdown?: boolean;
    isTopLevel?: boolean;
  };
}

export const Operation = forwardRef<HTMLDivElement, OperationInputProps>(
  ({ operation, handleChange, prevStatements, options, ...props }, ref) => {
    function handleStatement({
      statement,
      remove,
      parameterLength = operation.value.parameters.length,
    }: {
      statement: IStatement;
      remove?: boolean;
      parameterLength?: number;
    }) {
      const updatedStatements = updateStatements({
        statements: [
          ...operation.value.parameters,
          ...operation.value.statements,
        ],
        previous: prevStatements,
        changedStatement: statement,
        removeStatement: remove,
      });

      const updatedParameters = updatedStatements.slice(0, parameterLength);
      const updatedStatementsList = updatedStatements.slice(parameterLength);

      handleChange({
        ...operation,
        type: getOperationType(updatedParameters, updatedStatementsList),
        value: {
          ...operation.value,
          parameters: updatedParameters,
          statements: updatedStatementsList,
        },
      });
    }

    return (
      <div
        {...props}
        ref={ref}
        className={["max-w-max", props?.className].join(" ")}
      >
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
                const parameters = [...operation.value.parameters];
                const statements = [...operation.value.statements];
                const newParameter = {
                  ...statement,
                  name: createVariableName({
                    prefix: "param",
                    prev: [...parameters, ...prevStatements],
                  }),
                };
                const updatedParameters = [...parameters, newParameter];
                handleChange({
                  ...operation,
                  type: getOperationType(updatedParameters, statements),
                  value: {
                    ...operation.value,
                    parameters: updatedParameters,
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
    );
  }
);

Operation.displayName = "Operation";
