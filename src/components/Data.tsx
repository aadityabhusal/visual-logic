import styled from "styled-components";
import { TypeMapper } from "../lib/data";
import { IData, IStatement, IType } from "../lib/types";
import { Dropdown, DropdownOption, DropdownOptions } from "./Dropdown";
import { ArrayInput } from "./Input/ArrayInput";
import { Input } from "./Input/Input";
import { ObjectInput } from "./Input/ObjectInput";
import { BooleanInput } from "./Input/BooleanInput";
import { theme } from "../lib/theme";
import { useStore } from "../lib/store";

interface IProps {
  data: IData;
  handleData: (data: IData, remove?: boolean) => void;
  disableDelete?: boolean;
  path: string[];
}

export function Data({ data, handleData, disableDelete, path }: IProps) {
  const context = useStore((state) => state.operations);
  const statements =
    context.find((operation) => operation.id === path[0])?.statements || [];
  const statementIndex = statements.findIndex((item) => item.id === path[1]);

  function handleDropdown(type: keyof IType) {
    (data.referenceId || type !== data.type) &&
      handleData({
        ...data,
        type,
        value: TypeMapper[type].defaultValue,
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
      name: statement.variable,
      type: statement.result.type,
      value: statement.result.value,
      isGeneric: data.isGeneric,
    });
  }

  return (
    <DataWrapper>
      <Dropdown
        data={{ result: data }}
        index={statements.length - statementIndex}
        handleDelete={!disableDelete ? () => handleData(data, true) : undefined}
        head={
          data.entityType === "variable" ? (
            <span style={{ color: theme.color.variable }}>{data.name}</span>
          ) : (
            <>
              {data.type === "array" ? (
                <ArrayInput data={data} handleData={handleData} path={path} />
              ) : data.value instanceof Map ? (
                <ObjectInput data={data} handleData={handleData} path={path} />
              ) : typeof data.value === "boolean" ? (
                <BooleanInput data={data} handleData={handleData} />
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
          {Object.keys(TypeMapper).map((item) => {
            if (!data.isGeneric && item !== data.type) return;
            return (
              <DropdownOption
                key={item}
                onClick={() => handleDropdown(item as keyof IType)}
                selected={!data.referenceId && data.type === item}
              >
                {item}
              </DropdownOption>
            );
          })}
          <div style={{ borderBottom: `1px solid ${theme.color.border}` }} />
          {statements.map((statement, i) => {
            if (i >= statementIndex || !statement.variable) return;
            let statementData = statement.result;
            if (!data.isGeneric && statementData.type !== data.type) return;
            return (
              <DropdownOption
                key={statement.id}
                onClick={() => selectVariable(statement)}
                selected={statement.id === data.referenceId}
              >
                {statement.variable}
              </DropdownOption>
            );
          })}
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
