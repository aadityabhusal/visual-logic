import { Context, IData, IStatement, OperationType } from "../lib/types";
import { Statement } from "./Statement";
import { Dropdown } from "./Dropdown";
import {
  createOperationCall,
  executeOperation,
  getFilteredOperations,
  getSkipExecution,
} from "../lib/operation";
import { getInverseTypes } from "../lib/utils";
import { BaseInput } from "./Input/BaseInput";
import { useMemo } from "react";

export function OperationCall({
  data,
  operation,
  handleOperationCall,
  addOperationCall,
  context,
  narrowedTypes,
}: {
  data: IData;
  operation: IData<OperationType>;
  handleOperationCall: (
    operation: IData<OperationType>,
    remove?: boolean
  ) => void;
  addOperationCall?: () => void;
  context: Context;
  narrowedTypes: Context["variables"];
}) {
  const updatedVariables = useMemo(
    () =>
      operation.value.name === "or"
        ? context.variables // TODO: inverse narrowed types for 'or' operation
        : narrowedTypes.entries().reduce((acc, [key, value]) => {
            if (value.data.type.kind === "never") acc.delete(key);
            else acc.set(key, value);
            return acc;
          }, new Map(context.variables)),
    [context.variables, narrowedTypes, operation.value.name]
  );
  const filteredOperations = useMemo(
    () => getFilteredOperations(data, updatedVariables),
    [data, updatedVariables]
  );

  function handleDropdown(name: string) {
    if (operation.value.name === name) return;
    handleOperationCall(
      createOperationCall({
        data,
        name,
        parameters: operation.value.parameters,
        context,
      })
    );
  }

  function handleParameter(
    item: IStatement,
    index: number,
    variables: Context["variables"]
  ) {
    // eslint-disable-next-line prefer-const
    let parameters = [...operation.value.parameters];
    parameters[index] = item;

    const foundOperation = filteredOperations.find(
      (op) => op.name === operation.value.name
    );
    const result = foundOperation
      ? executeOperation(foundOperation, data, parameters, {
          ...context,
          variables,
        })
      : operation.value.result;

    // Update parameter types while preserving the result type from the operation definition
    const updatedType: OperationType = {
      ...operation.type,
      parameters: parameters.map((param) => ({
        name: param.name,
        type: param.data.type,
      })),
    };

    handleOperationCall({
      ...operation,
      type: updatedType,
      value: {
        ...operation.value,
        parameters,
        result: result && {
          ...result,
          id: (operation.value.result || result).id,
          isTypeEditable: data.isTypeEditable,
        },
      },
    });
  }

  return (
    <Dropdown
      id={operation.id}
      operationResult={operation.value.result}
      items={filteredOperations.map((item) => ({
        label: item.name,
        value: item.name,
        color: "method",
        entityType: "operationCall",
        onClick: () => handleDropdown(item.name),
      }))}
      context={context}
      value={operation.value.name}
      addOperationCall={
        filteredOperations.length ? addOperationCall : undefined
      }
      handleDelete={() => handleOperationCall(operation, true)}
      isInputTarget
      target={(props) => <BaseInput {...props} className="text-method" />}
    >
      <span>{"("}</span>
      {operation.value.parameters.map((item, i, arr) => {
        const variables =
          operation.value.name === "thenElse" && i === 1
            ? getInverseTypes(context.variables, narrowedTypes)
            : updatedVariables;
        return (
          <span key={i} className="flex">
            <Statement
              statement={item}
              handleStatement={(val) =>
                val && handleParameter(val, i, variables)
              }
              options={{ disableDelete: true }}
              context={{
                ...context,
                variables,
                skipExecution:
                  context.skipExecution ??
                  getSkipExecution({
                    context,
                    result: data,
                    operation,
                    parameterIndex: i,
                  }),
              }}
            />
            {i < arr.length - 1 ? <span>{", "}</span> : null}
          </span>
        );
      })}
      <span className="self-end">{")"}</span>
    </Dropdown>
  );
}
