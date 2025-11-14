import { FaEquals } from "react-icons/fa6";
import { IData, IStatement, OperationType } from "../lib/types";
import { updateStatementMethods } from "../lib/update";
import {
  isTypeCompatible,
  getStatementResult,
  createVariableName,
  isDataOfType,
} from "../lib/utils";
import { createMethod } from "../lib/methods";
import { Data } from "./Data";
import { BaseInput } from "./Input/BaseInput";
import { Method } from "./Method";
import { Operation } from "./Operation";
import { IconButton } from "../ui/IconButton";
import { AddStatement } from "./AddStatement";
import { useDisclosure } from "@mantine/hooks";
import { Popover, useDelayedHover } from "@mantine/core";
import { TypeMapper } from "../lib/data";

export function Statement({
  statement,
  handleStatement,
  prevStatements,
  addStatement,
  options,
}: {
  statement: IStatement;
  handleStatement: (statement: IStatement, remove?: boolean) => void;
  prevStatements: IStatement[];
  addStatement?: (statement: IStatement, position: "before" | "after") => void;
  options?: {
    enableVariable?: boolean;
    disableNameToggle?: boolean;
    disableDelete?: boolean;
    disableMethods?: boolean;
  };
}) {
  const hasName = statement.name !== undefined;

  const [hoverOpened, { open, close }] = useDisclosure(false);
  const { openDropdown, closeDropdown } = useDelayedHover({
    open,
    close,
    openDelay: 0,
    closeDelay: 150,
  });

  function addMethod() {
    let data = getStatementResult(statement);
    if (data.entityType !== "data") return;
    let operation = createMethod({ data });
    let operations = [...statement.operations, operation];
    handleStatement(
      updateStatementMethods({ ...statement, operations }, prevStatements)
    );
  }

  function handleData(data: IData, remove?: boolean) {
    if (remove) handleStatement(statement, remove);
    else {
      let operations = [...statement.operations];
      if (statement.data.type !== data.type) operations = [];
      handleStatement(
        updateStatementMethods(
          { ...statement, data, operations },
          prevStatements
        )
      );
    }
  }

  function handelOperation(operation: IData<OperationType>, remove?: boolean) {
    if (remove) handleStatement(statement, remove);
    else
      handleStatement(
        updateStatementMethods(
          { ...statement, data: operation, operations: statement.operations },
          prevStatements
        )
      );
  }

  function handleMethod(method: IMethod, index: number, remove?: boolean) {
    let methods = [...statement.operations];
    if (remove) {
      let data = getStatementResult(statement, index);
      if (!isTypeCompatible(method.result, data)) methods.splice(index);
      else methods.splice(index, 1);
    } else {
      if (!isTypeCompatible(method.result, methods[index].result))
        methods.splice(index + 1);
      methods[index] = method;
    }
    handleStatement(
      updateStatementMethods({ ...statement, methods }, prevStatements)
    );
  }

  const hoverEvents = {
    onMouseEnter: openDropdown,
    onFocus: openDropdown,
    onMouseLeave: closeDropdown,
    onBlur: closeDropdown,
  };

  return (
    <div className="flex items-start gap-1">
      {options?.enableVariable ? (
        <div className="flex items-center gap-1 mr-1 [&>svg]:cursor-pointer [&>svg]:shrink-0">
          {hasName ? (
            <BaseInput
              value={statement.name || ""}
              className="text-variable"
              onChange={(value) => {
                let name = value || statement.name || "";
                if (
                  [
                    ...Object.keys(TypeMapper),
                    ...prevStatements.map((s) => s.name),
                    "operation",
                  ].includes(name)
                ) {
                  return;
                }
                handleStatement({ ...statement, name });
              }}
            />
          ) : null}
          <Popover opened={hoverOpened} offset={-2} withinPortal={false}>
            <Popover.Target>
              <IconButton
                icon={FaEquals}
                className="mt-[5px]"
                title="Create variable"
                onClick={() =>
                  !options?.disableNameToggle &&
                  handleStatement({
                    ...statement,
                    name: hasName
                      ? undefined
                      : createVariableName({
                          prefix: "var",
                          prev: prevStatements,
                        }),
                  })
                }
                {...hoverEvents}
              />
            </Popover.Target>
            <Popover.Dropdown
              classNames={{ dropdown: "absolute bg-inherit" }}
              {...hoverEvents}
            >
              <AddStatement
                id={`${statement.id}_addStatement`}
                prevStatements={[...prevStatements, statement]}
                onSelect={(statement) => {
                  addStatement?.(statement, "after");
                  closeDropdown();
                }}
                iconProps={{ title: "Add statement below" }}
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
        {isDataOfType(statement.data, "operation") ? (
          <Operation
            operation={statement.data}
            handleChange={
              isDataOfType(statement.data, "operation")
                ? handelOperation
                : handleData
            }
            prevStatements={prevStatements}
            options={{ disableDelete: options?.disableDelete }}
          />
        ) : (
          <Data
            data={statement.data}
            disableDelete={options?.disableDelete}
            addMethod={
              !options?.disableMethods && statement.operations.length === 0
                ? addMethod
                : undefined
            }
            prevStatements={prevStatements}
            handleChange={
              isDataOfType(statement.data, "operation")
                ? handelOperation
                : handleData
            }
          />
        )}
        {statement.operations.map((method, i, methods) => {
          let data = getStatementResult(statement, i, true);
          if (data.entityType !== "data") return;
          return (
            <div key={method.id} className="flex items-start gap-1 ml-1">
              <Method
                data={data}
                method={method}
                handleMethod={(meth, remove) => handleMethod(meth, i, remove)}
                prevStatements={prevStatements}
                addMethod={
                  !options?.disableMethods && i + 1 === methods.length
                    ? addMethod
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
