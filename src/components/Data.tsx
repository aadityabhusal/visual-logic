import { IData, IOperation, IStatement } from "../lib/types";
import { ArrayInput } from "./Input/ArrayInput";
import { ObjectInput } from "./Input/ObjectInput";
import { BooleanInput } from "./Input/BooleanInput";
import { Dropdown } from "./Dropdown";
import { getDataDropdownList } from "./DropdownList";
import { useMemo } from "react";
import { Button } from "../ui/Button";
import { BaseInput } from "./Input/BaseInput";

interface IProps {
  data: IData;
  disableDelete?: boolean;
  addMethod?: () => void;
  handleChange(item: IData | IOperation, remove?: boolean): void;
  prevStatements: IStatement[];
  prevOperations: IOperation[];
}

export function Data({
  data,
  disableDelete,
  addMethod,
  handleChange,
  prevStatements,
  prevOperations,
}: IProps) {
  const dropdownItems = useMemo(
    () =>
      getDataDropdownList({
        data,
        onSelect: handleChange,
        prevOperations,
        prevStatements,
      }),
    [data, prevOperations, prevStatements]
  );

  return data.reference?.name ? (
    <Dropdown
      id={data.id}
      items={dropdownItems}
      handleDelete={!disableDelete ? () => handleChange(data, true) : undefined}
      addMethod={addMethod}
      options={{ withSearch: true }}
      target={(props) => (
        <Button {...props} className="!p-0 bg-inherit outline-none">
          {data.reference?.name}
        </Button>
      )}
    />
  ) : Array.isArray(data.value) ? (
    <ArrayInput
      data={data as IData<"array">}
      handleData={handleChange}
      prevStatements={prevStatements}
      prevOperations={prevOperations}
    />
  ) : data.value instanceof Map ? (
    <ObjectInput
      data={data as IData<"object">}
      handleData={handleChange}
      prevStatements={prevStatements}
      prevOperations={prevOperations}
    />
  ) : typeof data.value === "boolean" ? (
    <BooleanInput data={data} handleData={handleChange} />
  ) : (
    <Dropdown<"input">
      id={data.id}
      items={dropdownItems}
      value={data.value.toString()}
      handleDelete={!disableDelete ? () => handleChange(data, true) : undefined}
      addMethod={addMethod}
      target={({ defaultValue, ...props }) => (
        <BaseInput
          {...props}
          type={data.type === "number" ? "number" : "string"}
          value={data.value.toString()}
          onChange={(val) => {
            handleChange({
              ...data,
              value: data.type === "number" ? Number(val.slice(0, 16)) : val,
            });
          }}
          options={{ withQuotes: data.type === "string" }}
        />
      )}
    />
  );
}
