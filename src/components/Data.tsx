import styled from "styled-components";
import { TypeMapper } from "../lib/data";
import { IContextProps, IData, IStatement, IType } from "../lib/types";
import { Dropdown, DropdownOption, DropdownOptions } from "./Dropdown";
import { ArrayInput } from "./Input/ArrayInput";
import { Input } from "./Input/Input";
import { ObjectInput } from "./Input/ObjectInput";
import { theme } from "../lib/theme";

interface IProps {
  data: IData;
  handleData: (data: IData, remove?: boolean) => void;
  context: IContextProps;
}

export function Data({ data, handleData, context }: IProps) {
  const dataIndex = context.statements.findIndex(
    (statement) => statement.entities[0].id === data.id
  );

  function handleDropdown(value: keyof IType) {
    const inputDefaultValue = TypeMapper[value].defaultValue;
    let returnVal = { type: value, value: inputDefaultValue };
    value !== data.type &&
      handleData({
        ...data,
        ...returnVal,
        entityType: "data",
        referenceId: undefined,
        name: undefined,
      });
  }

  function selectVariable(statement: IStatement) {
    handleData({
      id: data.id,
      entityType: "variable",
      referenceId: statement.id,
      type: statement.return.type,
      value: statement.return.value,
    });
  }

  return (
    <DataWrapper>
      <Dropdown
        data={{ result: data }}
        handleDelete={() => handleData(data, true)}
        head={
          data.entityType === "variable" ? (
            <span style={{ color: theme.color.variable }}>{data.name}</span>
          ) : (
            <>
              {data.type === "array" ? (
                <ArrayInput
                  data={data}
                  handleData={handleData}
                  context={context}
                />
              ) : data.value instanceof Map ? (
                <ObjectInput
                  data={data}
                  handleData={handleData}
                  context={context}
                />
              ) : (
                <Input
                  data={data}
                  handleData={handleData}
                  color={
                    theme.color[data.type === "number" ? "number" : "string"]
                  }
                />
              )}
            </>
          )
        }
      >
        <DropdownOptions>
          {Object.keys(TypeMapper).map((item) => (
            <DropdownOption
              key={item}
              onClick={() => handleDropdown(item as keyof IType)}
              selected={!data.referenceId && data.type === item}
            >
              {item}
            </DropdownOption>
          ))}
          <div style={{ borderBottom: `1px solid ${theme.color.border}` }} />
          {context.statements.map((statement, i) =>
            i < dataIndex && statement.variable ? (
              <DropdownOption
                key={statement.id}
                onClick={() => selectVariable(statement)}
                selected={statement.id === data.referenceId}
              >
                {statement.variable}
              </DropdownOption>
            ) : null
          )}
        </DropdownOptions>
      </Dropdown>
    </DataWrapper>
  );
}

const DataWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
`;
