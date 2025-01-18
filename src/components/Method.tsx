import { IData, IMethod, IOperation, IStatement } from "../lib/types";
import { Statement } from "./Statement";
import { Dropdown } from "./Dropdown";
import { createMethod, getFilteredMethods, methodsList } from "../lib/methods";
import { getStatementResult } from "../lib/utils";
import { BaseInput } from "./Input/BaseInput";

interface IProps {
  data: IData;
  method: IMethod;
  handleMethod: (method: IMethod, remove?: boolean) => void;
  addMethod?: () => void;
  prevStatements: IStatement[];
  prevOperations: IOperation[];
}

export function Method({
  data,
  method,
  handleMethod,
  addMethod,
  prevStatements,
  prevOperations,
}: IProps) {
  function handleDropdown(name: string) {
    if (method.name === name) return;
    handleMethod(createMethod({ data, name }));
  }

  function handleParameter(item: IStatement, index: number) {
    let parameters = [...method.parameters];
    parameters[index] = item;
    let methodHandler = methodsList[data.type].find(
      (item) => item.name === method.name
    )?.handler;
    let parametersResult = parameters.map((item) => getStatementResult(item));
    let result = methodHandler?.(data, ...parametersResult) || method.result;
    handleMethod({
      ...method,
      parameters,
      result: { ...result, id: method.result.id, isGeneric: data.isGeneric },
    });
  }

  return (
    <Dropdown
      id={method.id}
      result={method.result}
      items={getFilteredMethods(data).map((item) => ({
        label: item.name,
        value: item.name,
        color: "method",
        entityType: "method",
        onClick: () => handleDropdown(item.name),
      }))}
      value={method.name}
      addMethod={addMethod}
      handleDelete={() => handleMethod(method, true)}
      isInputTarget
      target={(props) => <BaseInput {...props} className="text-method" />}
    >
      <span>{"("}</span>
      {method.parameters.map((item, i, arr) => (
        <span key={i} className="flex">
          <Statement
            statement={item}
            handleStatement={(val) => val && handleParameter(val, i)}
            options={{ disableDelete: true }}
            prevStatements={prevStatements}
            prevOperations={prevOperations}
          />
          {i < arr.length - 1 ? <span>{", "}</span> : null}
        </span>
      ))}
      <span className="self-end">{")"}</span>
    </Dropdown>
  );
}
