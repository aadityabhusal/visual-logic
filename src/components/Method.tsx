import { IData, IMethod, IOperation, IStatement } from "../lib/types";
import { Statement } from "./Statement";
import { DropdownOption, DropdownOptions } from "../ui/Dropdown";
import { Dropdown } from "../ui/Dropdown";
import { createMethod, getFilteredMethods } from "../lib/methods";
import { getStatementResult } from "../lib/utils";
import { theme } from "../lib/theme";
import { ErrorBoundary } from "./ErrorBoundary";

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
    let result = method.handler(
      data,
      ...parameters.map((item) => getStatementResult(item))
    );
    handleMethod({
      ...method,
      parameters,
      result: { ...result, id: method.result.id, isGeneric: data.isGeneric },
    });
  }

  return (
    <Dropdown
      result={{
        ...(method.result.entityType === "data"
          ? { data: method.result }
          : { type: "operation" }),
      }}
      handleDelete={() => handleMethod(method, true)}
      addMethod={addMethod}
      head={
        <>
          {"."}
          <span style={{ color: theme.color.method }}>
            {method.name || ".."}
          </span>
          <span>{"("}</span>
          {method.parameters.map((item, i, arr) => (
            <span key={i} style={{ display: "flex" }}>
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
          <span>{")"}</span>
        </>
      }
    >
      <DropdownOptions>
        {getFilteredMethods(data).map((item) => (
          <DropdownOption
            key={item.name}
            onClick={() => handleDropdown(item.name)}
            selected={item.name === method.name}
          >
            {item.name}
          </DropdownOption>
        ))}
      </DropdownOptions>
    </Dropdown>
  );
}
