import { IData, IOperation, IStatement } from "../lib/types";
import { ArrayInput } from "./Input/ArrayInput";
import { ObjectInput } from "./Input/ObjectInput";
import { BooleanInput } from "./Input/BooleanInput";
import { Dropdown } from "./Dropdown";
import { getDataDropdownList } from "./DropdownList";
import { useMemo } from "react";
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

  const showDropdownIcon =
    !data.reference?.name &&
    (Array.isArray(data.value) ||
      data.value instanceof Map ||
      typeof data.value === "boolean");

  return (
    <Dropdown
      id={data.id}
      items={dropdownItems}
      handleDelete={!disableDelete ? () => handleChange(data, true) : undefined}
      addMethod={addMethod}
      options={{
        withDropdownIcon: showDropdownIcon,
        withSearch: showDropdownIcon,
      }}
      value={data.reference?.name || data.type}
      target={({ onChange, ...props }) =>
        data.reference?.name ? (
          <BaseInput {...props} onChange={onChange} className="text-variable" />
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
          <BaseInput
            {...props}
            type={data.type === "number" ? "number" : "text"}
            className={data.type === "number" ? "text-number" : "text-string"}
            value={data.value.toString()}
            onChange={(_val) => {
              onChange?.(_val);
              const value =
                data.type === "number" ? Number(_val.slice(0, 16)) : _val;
              handleChange({ ...data, value });
            }}
            options={{ withQuotes: data.type === "string" }}
          />
        )
      }
    />
  );
}
