import { IData, IMethod, IOperation, IStatement } from "../lib/types";
import { Statement } from "./Statement";
import { Dropdown } from "../ui/Dropdown";
import { createMethod, getFilteredMethods, methodsList } from "../lib/methods";
import { getStatementResult } from "../lib/utils";

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
    handleMethod({ ...createMethod({ data, name }) });
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
      result={{ data: method.result }}
      handleDelete={() => handleMethod(method, true)}
      addMethod={addMethod}
      head={
        <>
          <span className="text-method">{method.name || ".."}</span>
          <span>{"("}</span>
          {method.parameters.map((item, i, arr) => (
            <span key={i} className="flex">
              <Statement
                statement={item}
                handleStatement={(val) => val && handleParameter(val, i)}
                disableDelete={true}
                disableName={true}
                prevStatements={prevStatements}
                prevOperations={prevOperations}
              />
              {i < arr.length - 1 ? <span>{", "}</span> : null}
            </span>
          ))}
          <span className="self-end">{")"}</span>
        </>
      }
    >
      <div className="dropdown-options">
        {getFilteredMethods(data).map((item) => (
          <div
            className={
              item.name === method.name
                ? "dropdown-option-selected"
                : "dropdown-option"
            }
            key={item.name}
            onClick={() => handleDropdown(item.name)}
          >
            {item.name}
          </div>
        ))}
      </div>
    </Dropdown>
  );
}
