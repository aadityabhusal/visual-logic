import { useState } from "react";
import styled from "styled-components";
import { IData, IContextProps } from "../lib/types";
import { createDataResult } from "../lib/utils";
import { Data } from "./Data";
import { DropdownOption, DropdownOptions } from "./Dropdown";
import { Dropdown } from "./Dropdown";
import { operationMethods } from "../lib/methods";
import { theme } from "../lib/theme";

export function Operation({
  data,
  handleData,
  context,
}: {
  data: IData;
  handleData: (data: IData) => void;
  context: IContextProps;
}) {
  const [dropdown, setDropdown] = useState(false);

  function handleDropdown(name: string, index: number) {
    setDropdown(false);
    if (data.selectedMethod?.name === name) return;
    let method = operationMethods[data.type][index];
    let returnVal = createDataResult(data, method);
    if (!returnVal) return;
    handleData({
      ...data,
      return: returnVal.return,
      selectedMethod: method && {
        ...method,
        result: returnVal,
      },
    });
  }

  function handleParameter(item: IData, index: number) {
    if (!data.selectedMethod) return;
    let parameters = [...data.selectedMethod.parameters];
    parameters[index] = item;
    handleData({
      ...data,
      selectedMethod: {
        ...data.selectedMethod,
        parameters,
      },
    });
  }

  function handleSelectedMethod(value?: IData) {
    setDropdown(false);
    let returnVal = value || createDataResult(data);
    if (!returnVal) return;
    if (data.selectedMethod) {
      handleData({
        ...data,
        return: returnVal.return,
        selectedMethod: { ...data.selectedMethod, result: returnVal },
      });
    }
  }

  function addResultMethod() {
    setDropdown(false);
    if (!data.selectedMethod?.result) return;
    const resultSelectedMethod =
      operationMethods[data.selectedMethod?.result.type][0];
    const resultReturnVal = createDataResult(data, resultSelectedMethod);
    handleData({
      ...data,
      selectedMethod: {
        ...data.selectedMethod,
        result: {
          ...data.selectedMethod.result,
          ...resultReturnVal?.return,
          selectedMethod: {
            ...resultSelectedMethod,
            result: resultReturnVal,
          },
        },
      },
    });
  }

  return (
    <OperationWrapper>
      <Dropdown
        data={{}}
        handleMethod={
          !data.selectedMethod?.result?.selectedMethod
            ? addResultMethod
            : undefined
        }
        handleDelete={() => handleData({ ...data, selectedMethod: undefined })}
        head={
          <>
            {"."}
            <span style={{ color: theme.color.method }}>
              {data.selectedMethod?.name || ".."}
            </span>
            <span>{"("}</span>
            {data.selectedMethod?.parameters.map((item, i, arr) => (
              <span key={i} style={{ display: "flex" }}>
                <Data
                  data={item}
                  handleData={(val) => val && handleParameter(val, i)}
                  context={context}
                />
                {i < arr.length - 1 ? <span>{", "}</span> : null}
              </span>
            ))}
            <span>{")"}</span>
          </>
        }
      >
        <DropdownOptions>
          {operationMethods[data.type].map((method, i) => (
            <DropdownOption
              key={method.name}
              onClick={(e) => handleDropdown(method.name, i)}
              selected={data.selectedMethod?.name === method.name}
            >
              {method.name}
            </DropdownOption>
          ))}
        </DropdownOptions>
      </Dropdown>
      {data.selectedMethod?.result?.selectedMethod ? (
        <Operation
          data={data.selectedMethod.result}
          handleData={(value) => handleSelectedMethod(value)}
          context={context}
        />
      ) : null}
    </OperationWrapper>
  );
}

const OperationWrapper = styled.div`
  position: relative;
  display: flex;
  flex-wrap: wrap;
`;
