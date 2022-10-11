import { useState } from "react";
import styled from "styled-components";
import { typeToObject } from "../lib/data";
import { IData, IValue } from "../lib/types";
import { Dropdown } from "./Dropdown";

interface IProps {
  data: IData;
  handleData: (data: IData) => void;
  readOnly?: boolean;
}

export function Data({ data, handleData, readOnly }: IProps) {
  const ValueConstructor = typeToObject[typeof data.value];
  const [dropdown, setDropdown] = useState(false);

  function handleDropdown(value: IValue) {
    setDropdown(false);
    value !== typeof data.value &&
      handleData({
        ...data,
        value: typeToObject[value](Number(data.value) || ""),
      });
  }

  return (
    <DataWrapper>
      <input
        type={typeof data.value === "number" ? "number" : "text"}
        placeholder={`Enter ${typeof data.value} here`}
        value={data.value}
        onChange={(e) =>
          handleData({ ...data, value: ValueConstructor(e.target.value) })
        }
        readOnly={readOnly}
        style={{ opacity: readOnly ? 0.9 : 1 }}
      />
      {!readOnly ? (
        <Dropdown display={dropdown} setDisplay={setDropdown}>
          <DropdownOptions>
            {Object.keys(typeToObject).map((item) => (
              <DropdownOption
                key={item}
                onClick={() => handleDropdown(item)}
                selected={typeof data.value === item}
              >
                {item}
              </DropdownOption>
            ))}
          </DropdownOptions>
        </Dropdown>
      ) : null}
    </DataWrapper>
  );
}

const DataWrapper = styled.div`
  position: relative;
  display: flex;
`;

const DropdownOptions = styled.div`
  cursor: pointer;
  background-color: #fff;
  color: #000;
`;

const DropdownOption = styled.div<{ selected?: boolean }>`
  background-color: ${({ selected }) => (selected ? "#888" : "inherit")};
`;
