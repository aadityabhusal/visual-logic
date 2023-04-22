import styled from "styled-components";
import { IData } from "../lib/types";
import { ArrayInput } from "./Input/ArrayInput";
import { Input } from "./Input/Input";
import { ObjectInput } from "./Input/ObjectInput";
import { BooleanInput } from "./Input/BooleanInput";
import { theme } from "../lib/theme";

interface IProps {
  data: IData;
  handleData: (data: IData, remove?: boolean) => void;
}

export function Data({ data, handleData }: IProps) {
  return data.type === "array" ? (
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
  );
}

export const DataWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
`;
