import { useState } from "react";
import styled from "styled-components";
import { typeToObject } from "../lib/data";
import { IOperation, IValue } from "../lib/types";
import { DropdownOption, DropdownOptions } from "./Data";
import { Dropdown } from "./Dropdown";
import { Input } from "./Input";

export function Operation({
  operation,
  handleOperation,
}: {
  operation: IOperation;
  handleOperation: (data: IOperation) => void;
}) {
  const [dropdown, setDropdown] = useState(false);

  function handleDropdown(name: string) {
    setDropdown(false);
    operation.selectedMethod.name !== name &&
      handleOperation({
        ...operation,
        selectedMethod:
          operation.methods.find((method) => method.name === name) ||
          operation.methods[0],
      });
  }

  function handleParameter(item: IValue, value: string, index: number) {
    const ValueConstructor = typeToObject[typeof item];
    let parameters = [...operation.selectedMethod.parameters];
    parameters[index] = ValueConstructor(value);
    handleOperation({
      ...operation,
      selectedMethod: {
        ...operation.selectedMethod,
        parameters,
      },
    });
  }

  return (
    <OperationWrapper>
      <span>{"."}</span>
      <Dropdown
        value={operation.selectedMethod.name}
        display={dropdown}
        setDisplay={setDropdown}
      >
        <DropdownOptions>
          {operation.methods.map((method) => (
            <DropdownOption
              key={method.name}
              onClick={(e) => handleDropdown(method.name)}
              selected={operation.selectedMethod.name === method.name}
            >
              {method.name}
            </DropdownOption>
          ))}
        </DropdownOptions>
      </Dropdown>
      <span>{"("}</span>
      {operation.selectedMethod.parameters.map((item, i, arr) => (
        <>
          <Input
            key={i}
            value={item}
            onChange={(e) => handleParameter(item, e.target.value, i)}
          />
          {i < arr.length - 1 ? <span>{", "}</span> : null}
        </>
      ))}
      <span>{")"}</span>
    </OperationWrapper>
  );
}

const OperationWrapper = styled.div`
  position: relative;
  display: flex;
`;
