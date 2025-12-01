import { FaArrowRightLong, FaArrowTurnUp, FaEquals } from "react-icons/fa6";
import { Context, IData, IStatement, OperationType } from "../lib/types";
import { updateStatementMethods } from "../lib/update";
import {
  isTypeCompatible,
  getStatementResult,
  createVariableName,
  isDataOfType,
} from "../lib/utils";
import { createOperationCall } from "../lib/methods";
import { Data } from "./Data";
import { BaseInput } from "./Input/BaseInput";
import { OperationCall } from "./OperationCall";
import { IconButton } from "../ui/IconButton";
import { AddStatement } from "./AddStatement";
import { getHotkeyHandler, useDisclosure } from "@mantine/hooks";
import { Popover, useDelayedHover } from "@mantine/core";
import { DataTypes } from "../lib/data";
import { useMemo } from "react";
import { uiConfigStore } from "@/lib/store";
import { useCustomHotkeys } from "@/hooks/useNavigation";

export function Statement({
  statement,
  handleStatement,
  context,
  addStatement,
  options,
}: {
  statement: IStatement;
  handleStatement: (statement: IStatement, remove?: boolean) => void;
  addStatement?: (statement: IStatement, position: "before" | "after") => void;
  context: Context;
  options?: {
    enableVariable?: boolean;
    disableNameToggle?: boolean;
    disableDelete?: boolean;
    disableMethods?: boolean;
  };
}) {
  const hasName = statement.name !== undefined;
  const { navigation, setUiConfig } = uiConfigStore();
  const customHotKeys = useCustomHotkeys();
  const [hoverOpened, { open, close }] = useDisclosure(false);
  const { openDropdown, closeDropdown } = useDelayedHover({
    open,
    close,
    openDelay: 0,
    closeDelay: 150,
  });
  const PipeArrow =
    statement.operations.length > 1 ? FaArrowTurnUp : FaArrowRightLong;

  const isEqualsFocused = navigation?.id === `${statement.id}_equals`;
  const isNameFocused = navigation?.id === `${statement.id}_name`;

  const hoverEvents = useMemo(
    () => ({
      onMouseEnter: openDropdown,
      onFocus: openDropdown,
      onMouseLeave: closeDropdown,
      onBlur: closeDropdown,
    }),
    [openDropdown, closeDropdown]
  );

  function addOperationCall() {
    const data = getStatementResult(statement);
    if (data.entityType !== "data") return;
    const operation = createOperationCall({ data, context });
    const operations = [...statement.operations, operation];
    handleStatement(
      updateStatementMethods({ ...statement, operations }, context)
    );
    setUiConfig({ navigation: { id: operation.id, direction: "right" } });
  }

  function handleData(data: IData, remove?: boolean) {
    if (remove) handleStatement(statement, remove);
    else {
      let operations = [...statement.operations];
      if (!isTypeCompatible(statement.data.type, data.type)) operations = [];
      handleStatement(
        updateStatementMethods({ ...statement, data, operations }, context)
      );
    }
  }

  function handelOperation(operation: IData<OperationType>, remove?: boolean) {
    if (remove) handleStatement(statement, remove);
    else
      handleStatement(
        updateStatementMethods(
          { ...statement, data: operation, operations: statement.operations },
          context
        )
      );
  }

  function handleOperationCall(
    operation: IData<OperationType>,
    index: number,
    remove?: boolean
  ) {
    // eslint-disable-next-line prefer-const
    let operations = [...statement.operations];
    if (remove) {
      const data = getStatementResult(statement, index);
      if (
        !operation.value.result ||
        !isTypeCompatible(operation.value.result.type, data.type)
      ) {
        operations.splice(index);
      } else {
        operations.splice(index, 1);
      }
    } else {
      if (
        !operation.value.result ||
        !operations[index].value.result ||
        !isTypeCompatible(
          operation.value.result.type,
          operations[index].value.result.type
        )
      ) {
        operations.splice(index + 1);
      }
      operations[index] = operation;
    }
    handleStatement(
      updateStatementMethods({ ...statement, operations }, context)
    );
  }

  return (
    <div className="flex items-start gap-1">
      {options?.enableVariable ? (
        <div className="flex items-center gap-1 mr-1 [&>svg]:cursor-pointer [&>svg]:shrink-0">
          {hasName ? (
            <BaseInput
              ref={(elem) => isNameFocused && elem?.focus()}
              value={statement.name || ""}
              className={[
                "text-variable",
                isNameFocused ? "outline outline-border" : "",
              ].join(" ")}
              onChange={(value) => {
                const name = value || statement.name || "";
                if (
                  [
                    ...Object.keys(DataTypes),
                    ...Object.keys(context.variables),
                    "operation",
                  ].includes(name)
                ) {
                  return;
                }
                handleStatement({ ...statement, name });
              }}
              onFocus={() =>
                setUiConfig(() => ({
                  navigation: { id: `${statement.id}_name` },
                }))
              }
              onKeyDown={getHotkeyHandler(customHotKeys)}
            />
          ) : null}
          <Popover
            opened={hoverOpened || navigation?.id === `${statement.id}_add`}
            offset={4}
            position="left"
            withinPortal={false}
          >
            <Popover.Target>
              <IconButton
                ref={(elem) => isEqualsFocused && elem?.focus()}
                icon={FaEquals}
                position="right"
                className={[
                  "mt-[5px] hover:outline hover:outline-border",
                  isEqualsFocused ? "outline outline-border" : "",
                ].join(" ")}
                disabled={options?.disableNameToggle}
                title="Create variable"
                onClick={() => {
                  handleStatement({
                    ...statement,
                    name: hasName
                      ? undefined
                      : createVariableName({
                          prefix: "var",
                          prev: Object.keys(context.variables),
                        }),
                  });
                  setUiConfig(() => ({
                    navigation: { id: `${statement.id}_name` },
                  }));
                }}
                {...hoverEvents}
              />
            </Popover.Target>
            <Popover.Dropdown
              classNames={{ dropdown: "absolute bg-inherit" }}
              {...hoverEvents}
            >
              <AddStatement
                id={statement.id}
                onSelect={(statement) => {
                  addStatement?.(statement, "before");
                  closeDropdown();
                }}
                iconProps={{ title: "Add before" }}
                className="bg-editor"
                context={context}
              />
            </Popover.Dropdown>
          </Popover>
        </div>
      ) : null}
      <div
        className={
          "flex items-start gap-0 " +
          (statement.operations.length > 1 ? "flex-col" : "flex-row")
        }
      >
        <Data
          data={statement.data}
          disableDelete={options?.disableDelete}
          addOperationCall={
            !options?.disableMethods &&
            statement.operations.length === 0 &&
            !isDataOfType(statement.data, "operation")
              ? addOperationCall
              : undefined
          }
          context={context}
          handleChange={
            isDataOfType(statement.data, "operation")
              ? handelOperation
              : handleData
          }
        />
        {statement.operations.map((operation, i, operationsList) => {
          const data = getStatementResult(statement, i, true);
          if (data.entityType !== "data") return;
          return (
            <div key={operation.id} className="flex items-start gap-1 ml-2">
              <PipeArrow
                size={10}
                className="text-disabled mt-1.5"
                style={{
                  transform: operationsList.length > 1 ? "rotate(90deg)" : "",
                }}
              />
              <OperationCall
                data={data}
                operation={operation}
                handleOperationCall={(op, remove) =>
                  handleOperationCall(op, i, remove)
                }
                context={context}
                addOperationCall={
                  !options?.disableMethods && i + 1 === operationsList.length
                    ? addOperationCall
                    : undefined
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
