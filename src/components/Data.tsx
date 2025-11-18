import {
  IData,
  IStatement,
  NumberType,
  StringType,
  UndefinedType,
  DataType,
} from "../lib/types";
import { ArrayInput } from "./Input/ArrayInput";
import { ObjectInput } from "./Input/ObjectInput";
import { BooleanInput } from "./Input/BooleanInput";
import { Dropdown } from "./Dropdown";
import { getDataDropdownList, isDataOfType } from "../lib/utils";
import { useMemo } from "react";
import { BaseInput } from "./Input/BaseInput";
import { isNumberLike } from "@mantine/core";
import { TypeMapper } from "../lib/data";
import { Condition } from "./Input/Condition";

interface IProps {
  data: IData;
  disableDelete?: boolean;
  addOperationCall?: () => void;
  handleChange(item: IStatement["data"], remove?: boolean): void;
  prevStatements: IStatement[];
}

export function Data({
  data,
  disableDelete,
  addOperationCall,
  handleChange,
  prevStatements,
}: IProps) {
  const dropdownItems = useMemo(
    () =>
      getDataDropdownList({
        data,
        onSelect: handleChange,
        prevStatements,
      }),
    [data, prevStatements]
  );

  const showDropdownIcon =
    !data.reference?.name &&
    (isDataOfType(data, "array") ||
      isDataOfType(data, "object") ||
      isDataOfType(data, "boolean") ||
      isDataOfType(data, "condition"));

  function handleUndefinedKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && e.currentTarget.value.length === 0) {
      handleChange({
        ...data,
        type: { kind: "undefined" },
        value: undefined,
      } as IData<UndefinedType>);
    }
  }

  return (
    <Dropdown
      id={data.id}
      result={data}
      items={dropdownItems}
      handleDelete={!disableDelete ? () => handleChange(data, true) : undefined}
      addOperationCall={addOperationCall}
      options={{
        withDropdownIcon: showDropdownIcon,
        withSearch: showDropdownIcon,
        focusOnClick: showDropdownIcon,
      }}
      value={data.reference?.name || data.type.kind}
      isInputTarget={
        !!data.reference ||
        ["string", "number", "undefined"].includes(data.type.kind)
      }
      target={({ onChange, ...props }) =>
        data.reference?.name ? (
          <BaseInput {...props} onChange={onChange} className="text-variable" />
        ) : isDataOfType(data, "operation") ? (
          <></>
        ) : isDataOfType(data, "array") ? (
          <ArrayInput
            data={data}
            handleData={handleChange}
            prevStatements={prevStatements}
            onClick={props.onClick}
          />
        ) : isDataOfType(data, "object") ? (
          <ObjectInput
            data={data}
            handleData={handleChange}
            prevStatements={prevStatements}
            onClick={props.onClick}
          />
        ) : isDataOfType(data, "boolean") ? (
          <BooleanInput data={data} handleData={handleChange} />
        ) : isDataOfType(data, "number") ? (
          <BaseInput
            {...props}
            type="number"
            className="text-number"
            value={data.value.toString()}
            onChange={(_val) => {
              onChange?.(_val);
              handleChange({
                ...data,
                value: _val ? Number(_val.slice(0, 16)) : "",
              } as IData<NumberType>);
            }}
            onKeyDown={handleUndefinedKeyDown}
          />
        ) : isDataOfType(data, "string") ? (
          <BaseInput
            {...props}
            type="text"
            className="text-string"
            value={data.value.toString()}
            onChange={(_val) => {
              onChange?.(_val);
              handleChange({ ...data, value: _val } as IData<StringType>);
            }}
            onKeyDown={handleUndefinedKeyDown}
            options={{ withQuotes: true }}
          />
        ) : isDataOfType(data, "condition") ? (
          <Condition
            data={data}
            handleData={handleChange}
            prevStatements={prevStatements}
          />
        ) : (
          // Undefined type
          <BaseInput
            {...props}
            type="text"
            className="text-border"
            value={data.value?.toString() || ""}
            disabled={!data.isGeneric}
            onChange={(_val) => {
              const transform = isNumberLike(_val)
                ? { type: "number", value: Number(_val.slice(0, 16)) }
                : _val.startsWith("[")
                ? { type: "array", value: TypeMapper["array"].defaultValue }
                : _val.startsWith("{")
                ? { type: "object", value: TypeMapper["object"].defaultValue }
                : _val
                ? { type: "string", value: _val }
                : { type: "undefined", value: undefined };
              onChange?.(_val);
              handleChange({
                ...data,
                type: TypeMapper[transform.type as DataType["kind"]].type,
                value: transform.value,
              } as IData<StringType>);
            }}
          />
        )
      }
    />
  );
}
