import { nanoid } from "nanoid";
import { useState } from "react";
import styled from "styled-components";
import { IOperation, IData } from "../lib/types";
import { Data, DropdownOption, DropdownOptions } from "./Data";
import { Dropdown } from "./Dropdown";

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

  function handleParameter(item: IData, index: number) {
    let parameters = [...operation.selectedMethod.parameters];
    parameters[index] = item;
    handleOperation({
      ...operation,
      selectedMethod: {
        ...operation.selectedMethod,
        parameters,
      },
    });
  }

  function methodParams() {
    return (
      <>
        <span>{"("}</span>
        {operation.selectedMethod.parameters.map((item, i, arr) => (
          <span key={i} style={{ display: "flex" }}>
            <Data
              data={{
                id: nanoid(),
                entityType: "data",
                value: item.value,
              }}
              handleData={(val) => handleParameter(val, i)}
            />
            {i < arr.length - 1 ? <span>{", "}</span> : null}
          </span>
        ))}
        <span>{")"}</span>
      </>
    );
  }

  return (
    <OperationWrapper>
      <span>{"."}</span>
      <Dropdown
        head={
          <>
            {operation.selectedMethod.name}
            {methodParams()}
          </>
        }
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
    </OperationWrapper>
  );
}

const OperationWrapper = styled.div`
  position: relative;
  display: flex;
`;
