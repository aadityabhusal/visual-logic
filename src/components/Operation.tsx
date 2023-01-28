import styled from "styled-components";
import { IData, IMethod, IStatement } from "../lib/types";
import { Statement } from "./Statement";
import { DropdownOption, DropdownOptions } from "./Dropdown";
import { Dropdown } from "./Dropdown";
import { operationMethods } from "../lib/methods";
import { theme } from "../lib/theme";
import { createMethod } from "../lib/utils";

interface IProps {
  data: IData;
  operation: IMethod;
  handleOperation: (operation: IMethod, remove?: boolean) => void;
  parentStatement?: IStatement;
}

export function Operation({
  data,
  operation,
  handleOperation,
  parentStatement,
}: IProps) {
  function handleDropdown(name: string, index: number) {
    if (operation.name === name) return;
    handleOperation({ ...createMethod({ data, index }) });
  }

  function handleParameter(item: IStatement, index: number) {
    let parameters = [...operation.parameters];
    parameters[index] = item;
    let result = operation.handler(
      data,
      ...parameters.map((item) => item.result)
    );
    handleOperation({
      ...operation,
      parameters,
      result: { ...result, isGeneric: data.isGeneric },
    });
  }

  function getMethods() {
    return operationMethods[data.type].filter((item) => {
      let parameters = item.parameters.map((p) => p.result);
      let resultType = item.handler(data, ...parameters).type; // Optimize here
      return data.isGeneric || data.type === resultType;
    });
  }

  return (
    <OperationWrapper>
      <Dropdown
        data={{ result: operation.result }}
        handleDelete={() => handleOperation(operation, true)}
        head={
          <>
            {"."}
            <span style={{ color: theme.color.method }}>
              {operation.name || ".."}
            </span>
            <span>{"("}</span>
            {operation.parameters.map((item, i, arr) => (
              <span key={i} style={{ display: "flex" }}>
                <Statement
                  statement={item}
                  handleStatement={(val) => val && handleParameter(val, i)}
                  disableDelete={true}
                  disableVariable={true}
                  parentStatement={parentStatement}
                />
                {i < arr.length - 1 ? <span>{", "}</span> : null}
              </span>
            ))}
            <span>{")"}</span>
          </>
        }
      >
        <DropdownOptions>
          {getMethods().map((method, i) => (
            <DropdownOption
              key={method.name}
              onClick={() => handleDropdown(method.name, i)}
              selected={operation.name === method.name}
            >
              {method.name}
            </DropdownOption>
          ))}
        </DropdownOptions>
      </Dropdown>
    </OperationWrapper>
  );
}

const OperationWrapper = styled.div`
  position: relative;
  display: flex;
  flex-wrap: wrap;
`;
