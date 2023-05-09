import styled from "styled-components";
import { IData } from "../lib/types";
import { Dropdown } from "../ui/Dropdown";
import { ArrayInput } from "./Input/ArrayInput";
import { Input } from "./Input/Input";
import { ObjectInput } from "./Input/ObjectInput";
import { BooleanInput } from "./Input/BooleanInput";
import { theme } from "../lib/theme";
import { ReactNode } from "react";

interface IProps {
  data: IData;
  handleData: (data: IData, remove?: boolean) => void;
  disableDelete?: boolean;
  addMethod?: () => void;
  children?: ReactNode;
}

export function Data({
  data,
  handleData,
  disableDelete,
  addMethod,
  children,
}: IProps) {
  return (
    <DataWrapper>
      <Dropdown
        result={{ data }}
        handleDelete={!disableDelete ? () => handleData(data, true) : undefined}
        addMethod={addMethod}
        head={
          data.reference?.name ? (
            <Input
              data={{
                id: "",
                type: "string",
                value: data.reference?.name,
                entityType: "data",
              }}
              handleData={() => {}}
              disabled={true}
              color={theme.color.variable}
              noQuotes
            />
          ) : data.type === "array" ? (
            <ArrayInput data={data} handleData={handleData} />
          ) : data.value instanceof Map ? (
            <ObjectInput data={data} handleData={handleData} />
          ) : typeof data.value === "boolean" ? (
            <BooleanInput data={data} handleData={handleData} />
          ) : (
            <Input
              data={data}
              handleData={handleData}
              color={theme.color[data.type === "number" ? "number" : "string"]}
            />
          )
        }
      >
        {children}
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
