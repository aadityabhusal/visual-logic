import styled from "styled-components";
import { IData, IMethod, IStatement } from "../lib/types";
import { Statement } from "./Statement";
import { DropdownOption, DropdownOptions } from "./Dropdown";
import { Dropdown } from "./Dropdown";
import { createMethod, getFilteredMethods } from "../lib/utils";
import { theme } from "../lib/theme";
import { useStore } from "../lib/store";

interface IProps {
  data: IData;
  method: IMethod;
  handleMethod: (method: IMethod, remove?: boolean) => void;
  path: string[];
}

export function Method({ data, method, handleMethod, path }: IProps) {
  const context = useStore((state) => state.operations);
  const statements =
    context.find((operation) => operation.id === path[0])?.statements || [];
  const statementIndex = statements.findIndex((item) => item.id === path[1]);

  function handleDropdown(name: string) {
    if (method.name === name) return;
    handleMethod({ ...createMethod({ data, name }) });
  }

  function handleParameter(item: IStatement, index: number) {
    let parameters = [...method.parameters];
    parameters[index] = item;
    let result = method.handler(data, ...parameters.map((item) => item.result));
    handleMethod({
      ...method,
      parameters,
      result: { ...result, id: method.result.id, isGeneric: data.isGeneric },
    });
  }

  return (
    <MethodWrapper>
      <Dropdown
        result={{ data: method.result }}
        index={statements.length - statementIndex}
        handleDelete={() => handleMethod(method, true)}
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
                  disableVariable={true}
                  path={path}
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
    </MethodWrapper>
  );
}

const MethodWrapper = styled.div`
  position: relative;
  display: flex;
  flex-wrap: wrap;
`;
