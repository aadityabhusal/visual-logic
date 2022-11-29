import { useState } from "react";
import styled from "styled-components";
import { IData } from "../lib/types";
import { createData, createDataResult } from "../lib/utils";
import { Data, DropdownOption, DropdownOptions } from "./Data";
import { Dropdown } from "./Dropdown";

export function Operation({
  data,
  handleData,
}: {
  data: IData;
  handleData: (data: IData) => void;
}) {
  const [dropdown, setDropdown] = useState(false);

  function handleDropdown(name: string) {
    setDropdown(false);
    if (data.selectedMethod?.name !== name) {
      handleData({
        ...data,
        selectedMethod: data.methods.find((method) => method.name === name),
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

  function methodParams() {
    return (
      <>
        <span>{"("}</span>
        {data.selectedMethod?.parameters.map((item, i, arr) => (
          <span key={i} style={{ display: "flex" }}>
            <Data
              data={createData("string", item.value.value as string)}
              handleData={(val) => handleParameter(val, i)}
            />
            {i < arr.length - 1 ? <span>{", "}</span> : null}
          </span>
        ))}
        <span>{")"}</span>
      </>
    );
  }

  // @todo: Need run this function to re-create data result when previous values are updated
  function handleSelectedMethod(value?: IData) {
    let result = value || createDataResult(data);
    if (result && data.selectedMethod)
      handleData({
        ...data,
        selectedMethod: { ...data.selectedMethod, result },
      });
  }

  return (
    <OperationWrapper>
      <span>{"."}</span>
      <Dropdown
        head={
          <>
            {data.selectedMethod?.name || "..."}
            {methodParams()}
          </>
        }
        display={dropdown}
        setDisplay={setDropdown}
      >
        <DropdownOptions>
          {data.methods.map((method) => (
            <DropdownOption
              key={method.name}
              onClick={(e) => handleDropdown(method.name)}
              selected={data.selectedMethod?.name === method.name}
            >
              {method.name}
            </DropdownOption>
          ))}
        </DropdownOptions>
      </Dropdown>
      {data.selectedMethod?.result ? (
        <Operation
          data={data.selectedMethod.result}
          handleData={(data) => handleSelectedMethod(data)}
        />
      ) : data.selectedMethod ? (
        <button onClick={(e) => handleSelectedMethod()}>{">"}</button>
      ) : null}
    </OperationWrapper>
  );
}

const OperationWrapper = styled.div`
  position: relative;
  display: flex;
`;
