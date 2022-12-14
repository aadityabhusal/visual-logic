import { useState } from "react";
import styled from "styled-components";
import { IData, IContextProps } from "../lib/types";
import { createDataResult } from "../lib/utils";
import { Play } from "@styled-icons/fa-solid";
import { Data, DropdownOption, DropdownOptions } from "./Data";
import { Dropdown } from "./Dropdown";
import { operationMethods } from "../lib/methods";

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
    if (data.selectedMethod?.name !== name) {
      let method = operationMethods[data.type][index];
      let result = createDataResult(data, method);
      handleData({
        ...data,
        selectedMethod: method && {
          ...method,
          result,
        },
      });
    }
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
    let result = value || createDataResult(data);
    if (data.selectedMethod) {
      handleData({
        ...data,
        selectedMethod: { ...data.selectedMethod, result },
      });
    }
  }

  function addResultMethod() {
    setDropdown(false);
    if (!data.selectedMethod?.result) return;
    const resultSelectedMethod =
      operationMethods[data.selectedMethod?.result.type][0];
    handleData({
      ...data,
      selectedMethod: {
        ...data.selectedMethod,
        result: {
          ...data.selectedMethod.result,
          selectedMethod: resultSelectedMethod,
        },
      },
    });
  }

  return (
    <OperationWrapper>
      <Dropdown
        hoverContent={
          !data.selectedMethod?.result?.selectedMethod ? (
            <Play size={10} onClick={addResultMethod} />
          ) : null
        }
        head={
          <>
            {"."}
            {data.selectedMethod?.name || ".."}
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
        display={dropdown}
        setDisplay={setDropdown}
        handleDelete={() => handleData({ ...data, selectedMethod: undefined })}
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
