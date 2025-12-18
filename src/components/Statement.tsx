import { FaArrowRightLong, FaArrowTurnUp, FaEquals } from "react-icons/fa6";
import { Context, IData, IStatement, OperationType } from "../lib/types";
import { updateOperationCalls } from "../lib/update";
import {
  isTypeCompatible,
  getStatementResult,
  createVariableName,
  isDataOfType,
  applyTypeNarrowing,
} from "../lib/utils";
import { createOperationCall, getFilteredOperations } from "../lib/operation";
import { Data } from "./Data";
import { BaseInput } from "./Input/BaseInput";
import { OperationCall } from "./OperationCall";
import { IconButton } from "../ui/IconButton";
import { AddStatement } from "./AddStatement";
import { getHotkeyHandler, useDisclosure } from "@mantine/hooks";
import { Popover, useDelayedHover } from "@mantine/core";
import { DataTypes } from "../lib/data";
import { useMemo, type ReactNode } from "react";
import { uiConfigStore } from "@/lib/store";
import { useCustomHotkeys } from "@/hooks/useNavigation";
import { ErrorBoundary } from "./ErrorBoundary";

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
    disableOperationCall?: boolean;
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
    const operation = createOperationCall({ data, context });
    const operations = [...statement.operations, operation];
    handleStatement(
      updateOperationCalls({ ...statement, operations }, context)
    );
    setUiConfig({ navigation: { id: operation.id, direction: "right" } });
  }

  function handleData(data: IData, remove?: boolean) {
    if (remove) handleStatement(statement, remove);
    else {
      let operations = [...statement.operations];
      if (!isTypeCompatible(statement.data.type, data.type)) operations = [];
      handleStatement(
        updateOperationCalls({ ...statement, data, operations }, context)
      );
    }
  }

  function handelOperation(operation: IData<OperationType>, remove?: boolean) {
    if (remove) handleStatement(statement, remove);
    else
      handleStatement(
        updateOperationCalls(
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
      updateOperationCalls({ ...statement, operations }, context)
    );
  }

  return (
    <div className="flex items-start gap-1">
      {options?.enableVariable ? (
        <div className="flex items-center gap-1 mr-1">
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
                    ...context.variables.keys(),
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
                          prev: [...context.variables.keys()],
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
        <ErrorBoundary
          displayError={true}
          onRemove={() => handleStatement(statement, true)}
        >
          <Data
            data={statement.data}
            disableDelete={options?.disableDelete}
            addOperationCall={
              !options?.disableOperationCall &&
              statement.operations.length === 0 &&
              getFilteredOperations(statement.data, context.variables).length
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
        </ErrorBoundary>
        {
          statement.operations.reduce(
            (acc, operation, i, operationsList) => {
              const result = getStatementResult(statement, i, true);
              acc.narrowedTypes = applyTypeNarrowing(
                context,
                acc.narrowedTypes,
                result,
                operation
              );

              acc.elements.push(
                <div key={operation.id} className="flex items-start gap-1 ml-2">
                  <PipeArrow
                    size={10}
                    className="text-disabled mt-1.5"
                    style={{
                      transform:
                        operationsList.length > 1 ? "rotate(90deg)" : "",
                    }}
                  />
                  <ErrorBoundary
                    displayError={true}
                    onRemove={() => handleOperationCall(operation, i, true)}
                  >
                    <OperationCall
                      data={result}
                      operation={operation}
                      handleOperationCall={(op, remove) =>
                        handleOperationCall(op, i, remove)
                      }
                      // passing context and narrowedTypes separately to handle inverse type narrowing
                      context={context}
                      narrowedTypes={acc.narrowedTypes}
                      addOperationCall={
                        !options?.disableOperationCall &&
                        i + 1 === operationsList.length
                          ? addOperationCall
                          : undefined
                      }
                    />
                  </ErrorBoundary>
                </div>
              );
              return acc;
            },
            { elements: [] as ReactNode[], narrowedTypes: new Map() }
          ).elements
        }
      </div>
    </div>
  );
}
