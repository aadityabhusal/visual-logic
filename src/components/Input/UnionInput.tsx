import { forwardRef, HTMLAttributes, useMemo } from "react";
import { UnionType, IData, IStatement, DataType } from "../../lib/types";
import { Data } from "../Data";
import {
  createData,
  createDefaultValue,
  getTypeSignature,
  inferTypeFromValue,
  isTypeCompatible,
} from "../../lib/utils";
import { FaChevronDown, FaX } from "react-icons/fa6";
import { DataTypes } from "@/lib/data";
import { Menu, Tooltip } from "@mantine/core";
import { IconButton } from "@/ui/IconButton";

export interface UnionInputProps extends HTMLAttributes<HTMLDivElement> {
  data: IData<UnionType>;
  handleData: (data: IData<UnionType>) => void;
  prevStatements: IStatement[];
}

export const UnionInput = forwardRef<HTMLDivElement, UnionInputProps>(
  ({ data, handleData, prevStatements, ...props }, ref) => {
    const activeTypeIndex = useMemo(() => {
      const valueType = inferTypeFromValue(data.value);
      const index = data.type.types.findIndex((t) =>
        isTypeCompatible(valueType, t)
      );
      return index >= 0 ? index : 0;
    }, [data.type.types, data.value]);

    const activeData = useMemo(
      () =>
        createData({
          id: data.id,
          type: data.type.types[activeTypeIndex],
          value: data.value,
          isGeneric: data.isGeneric,
        }),
      [data.id, data.type.types, data.value, data.isGeneric, activeTypeIndex]
    );

    function handleTypeAdd(newType: DataType) {
      handleData({
        ...data,
        type: { kind: "union", types: [...data.type.types, newType] },
        value: createDefaultValue(newType),
      });
    }

    function handleActiveTypeChange(newData: IData) {
      // eslint-disable-next-line prefer-const
      let updatedTypes = [...data.type.types];
      updatedTypes[activeTypeIndex] = newData.type;

      const uniqueTypes = updatedTypes.filter(
        (type, index, self) =>
          index === self.findIndex((t) => isTypeCompatible(t, type))
      );

      handleData({
        ...data,
        type: { kind: "union", types: uniqueTypes },
        value: newData.value,
      });
    }

    function handleTypeSwitch(index: number) {
      const defaultValue = createDefaultValue(data.type.types[index]);
      handleData({ ...data, value: defaultValue });
    }

    // Remove a type from the union
    function handleTypeRemove(index: number) {
      const newTypes = data.type.types.filter((_, i) => i !== index);

      // If removing the active type, switch to first type
      const wasActive = index === activeTypeIndex;
      const newValue = wasActive ? createDefaultValue(newTypes[0]) : data.value;

      handleData({
        ...data,
        type: { kind: "union", types: newTypes },
        value: newValue,
      });
    }

    const menuItemClassNames =
      "hover:bg-dropdown-hover focus:bg-dropdown-hover focus:outline-none";

    return (
      <div
        {...props}
        ref={ref}
        className={["flex items-start gap-1", props?.className].join(" ")}
      >
        <Data
          data={activeData}
          handleChange={handleActiveTypeChange}
          prevStatements={prevStatements}
          // TODO: this is hiding parameters for operation in union type
          disableDelete={true}
        />
        <Menu
          width={200}
          position="bottom-start"
          withinPortal={false}
          classNames={{ dropdown: "absolute bg-editor border" }}
        >
          <Menu.Target>
            <IconButton
              icon={FaChevronDown}
              size={14}
              className="mt-1 hover:outline hover:outline-border"
              title="Show union types"
            />
          </Menu.Target>
          <Menu.Dropdown classNames={{ dropdown: "flex flex-col" }}>
            {data.type.types.map((type, i) => (
              <Menu.Item
                key={i}
                onClick={() => handleTypeSwitch(i)}
                classNames={{
                  item: [
                    menuItemClassNames,
                    i === activeTypeIndex ? "bg-dropdown-selected" : "",
                  ].join(" "),
                }}
              >
                <Tooltip label={getTypeSignature(type)} position="right">
                  <div className={"flex items-center gap-1 justify-between"}>
                    {type.kind}
                    {data.type.types.length > 1 ? (
                      <FaX
                        size={16}
                        className="p-1 hover:outline hover:outline-border"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTypeRemove(i);
                        }}
                      />
                    ) : null}
                  </div>
                </Tooltip>
              </Menu.Item>
            ))}
            <Menu.Sub>
              <Menu.Sub.Target>
                <Menu.Sub.Item
                  classNames={{
                    item: [
                      "flex items-center justify-between",
                      menuItemClassNames,
                    ].join(" "),
                    itemSection: "size-4 -rotate-90",
                  }}
                >
                  Add
                </Menu.Sub.Item>
              </Menu.Sub.Target>
              <Menu.Sub.Dropdown classNames={{ dropdown: "flex flex-col" }}>
                {Object.entries(DataTypes)
                  .filter(
                    ([type, value]) =>
                      !value.hideFromDropdown &&
                      !["union"].includes(type) &&
                      // This is only for default types, if user updates a complex type, the default type options will be shown
                      !data.type.types.some((t) =>
                        isTypeCompatible(t, value.type)
                      )
                  )
                  .map(([name, { type }]) => (
                    <Menu.Item
                      classNames={{
                        item: ["text-left", menuItemClassNames].join(" "),
                      }}
                      key={name}
                      onClick={() => handleTypeAdd(type)}
                    >
                      {name}
                    </Menu.Item>
                  ))}
              </Menu.Sub.Dropdown>
            </Menu.Sub>
          </Menu.Dropdown>
        </Menu>
      </div>
    );
  }
);

UnionInput.displayName = "UnionInput";
