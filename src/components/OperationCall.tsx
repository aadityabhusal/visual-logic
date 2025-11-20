import { IData, IStatement, OperationType } from "../lib/types";
import { Statement } from "./Statement";
import { Dropdown } from "./Dropdown";
import {
  createOperationCall as createOperationCall,
  getFilteredOperations,
  executeOperation,
} from "../lib/methods";
import { getStatementResult } from "../lib/utils";
import { BaseInput } from "./Input/BaseInput";

export function OperationCall({
  data,
  operation,
  handleOperationCall,
  addOperationCall,
  prevStatements,
}: {
  data: IData;
  operation: IData<OperationType>;
  handleOperationCall: (
    operation: IData<OperationType>,
    remove?: boolean
  ) => void;
  addOperationCall?: () => void;
  prevStatements: IStatement[];
}) {
  function handleDropdown(name: string) {
    if (operation.value.name === name) return;
    handleOperationCall(
      createOperationCall({
        data,
        name,
        prevParams: operation.value.parameters,
        prevStatements,
      })
    );
  }

  function handleParameter(item: IStatement, index: number) {
    const parameters = [
      ...operation.value.parameters.slice(0, index),
      item,
      ...operation.value.parameters.slice(index + 1),
    ];

    const foundOperation = getFilteredOperations(data, prevStatements).find(
      (op) => op.name === operation.value.name
    );

    const parametersResult = parameters.map((item) => getStatementResult(item));
    const result = foundOperation
      ? executeOperation(foundOperation, data, parametersResult)
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
          isGeneric: data.isGeneric,
        },
      },
    });
  }

  return (
    <Dropdown
      id={operation.id}
      result={operation.value.result}
      items={getFilteredOperations(data, prevStatements).map((item) => ({
        label: item.name,
        value: item.name,
        color: "method",
        entityType: "method",
        onClick: () => handleDropdown(item.name),
      }))}
      value={operation.value.name}
      addOperationCall={addOperationCall}
      handleDelete={() => handleOperationCall(operation, true)}
      isInputTarget
      target={(props) => <BaseInput {...props} className="text-method" />}
    >
      <span>{"("}</span>
      {operation.value.parameters.map((item, i, arr) => (
        <span key={i} className="flex">
          <Statement
            statement={item}
            handleStatement={(val) => val && handleParameter(val, i)}
            options={{ disableDelete: true }}
            prevStatements={prevStatements}
          />
          {i < arr.length - 1 ? <span>{", "}</span> : null}
        </span>
      ))}
      <span className="self-end">{")"}</span>
    </Dropdown>
  );
}
