import { IData, IOperation, IStatement } from "../lib/types";
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
  prevStatements: IStatement[];
  prevOperations: IOperation[];
}

export function Data({
  data,
  handleData,
  disableDelete,
  addMethod,
  children,
  prevStatements,
  prevOperations,
}: IProps) {
  return (
    <Dropdown
      result={data.reference ? { data } : { type: data.type }}
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
        ) : Array.isArray(data.value) ? (
          <ArrayInput
            data={data as IData<"array">}
            handleData={handleData}
            prevStatements={prevStatements}
            prevOperations={prevOperations}
          />
        ) : data.value instanceof Map ? (
          <ObjectInput
            data={data as IData<"object">}
            handleData={handleData}
            prevStatements={prevStatements}
            prevOperations={prevOperations}
          />
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
  );
}
