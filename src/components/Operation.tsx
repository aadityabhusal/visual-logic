import styled from "styled-components";
import { IData, IMethod, IStatement } from "../lib/types";
import { Statement } from "./Statement";
import { DropdownOption, DropdownOptions } from "./Dropdown";
import { Dropdown } from "./Dropdown";
import { createMethod, getFilteredMethods } from "../lib/utils";
import { theme } from "../lib/theme";

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
  function handleDropdown(name: string) {
    if (operation.name === name) return;
    handleOperation({ ...createMethod({ data, name }) });
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
          {getFilteredMethods(data).map((method) => (
            <DropdownOption
              key={method.name}
              onClick={() => handleDropdown(method.name)}
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
