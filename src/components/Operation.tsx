import { Fragment, forwardRef, HTMLAttributes } from "react";
import { Context, IData, IStatement, OperationType } from "../lib/types";
import { updateStatements } from "../lib/update";
import { createVariableName, getOperationType } from "../lib/utils";
import { Statement } from "./Statement";
import { AddStatement } from "./AddStatement";

export interface OperationInputProps extends HTMLAttributes<HTMLDivElement> {
  operation: IData<OperationType>;
  handleChange: (data: IData<OperationType>, remove?: boolean) => void;
  context: Context;
  options?: {
    disableDelete?: boolean;
    disablaAddParameter?: boolean;
    disableDropdown?: boolean;
    isTopLevel?: boolean;
  };
}

export const Operation = forwardRef<HTMLDivElement, OperationInputProps>(
  ({ operation, handleChange, context, options, ...props }, ref) => {
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
        context,
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

    function addStatement(
      statement: IStatement,
      position: "before" | "after",
      index: number
    ) {
      const _index = position === "before" ? index : index + 1;
      handleChange({
        ...operation,
        value: {
          ...operation.value,
          statements: [
            ...operation.value.statements.slice(0, _index),
            statement,
            ...operation.value.statements.slice(_index),
          ],
        },
      });
    }

    function addParameter(statement: IStatement) {
      const parameters = [...operation.value.parameters];
      const statements = [...operation.value.statements];
      const newParameter = {
        ...statement,
        name: createVariableName({
          prefix: "param",
          prev: [...parameters, ...Object.keys(context.variables)],
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
                  disableOperationCall: true,
                  disableNameToggle: true,
                }}
                context={{ variables: {}, narrowing: context.narrowing }}
                addStatement={addParameter}
              />
              {i + 1 < paramList.length && <span>,</span>}
            </Fragment>
          ))}
          {options?.disablaAddParameter ? null : (
            <AddStatement
              id={`${operation.id}_parameter`}
              onSelect={addParameter}
              iconProps={{ title: "Add parameter" }}
              context={{ variables: {} }}
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
              addStatement={(statement, position) =>
                addStatement(statement, position, i)
              }
              context={{
                variables: operation.value.parameters
                  .concat(operation.value.statements.slice(0, i))
                  .reduce((acc, param) => {
                    if (param.name) acc[param.name] = param;
                    return acc;
                  }, context.variables),
                narrowing: context.narrowing,
              }}
            />
          ))}
          <AddStatement
            id={`${operation.id}_statement`}
            onSelect={(statement) => {
              const lastStatement = operation.value.statements.length - 1;
              addStatement(statement, "after", lastStatement);
            }}
            iconProps={{ title: "Add statement" }}
            context={{ variables: {} }}
          />
        </div>
      </div>
    );
  }
);

Operation.displayName = "Operation";
