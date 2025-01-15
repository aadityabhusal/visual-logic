import { FaEquals, FaArrowRightLong, FaArrowTurnUp } from "react-icons/fa6";
import { IData, IMethod, IOperation, IStatement } from "../lib/types";
import { updateStatementMethods } from "../lib/update";
import {
  isSameType,
  getStatementResult,
  getPreviousStatements,
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

export function Statement({
  statement,
  handleStatement,
  prevStatements,
  prevOperations,
  addStatement,
  options,
}: {
  statement: IStatement;
  handleStatement: (statement: IStatement, remove?: boolean) => void;
  prevStatements: IStatement[];
  prevOperations: IOperation[];
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

  const PipeArrow =
    statement.methods.length > 1 ? FaArrowTurnUp : FaArrowRightLong;

  function addMethod() {
    let data = getStatementResult(statement);
    if (data.entityType !== "data") return;
    let method = createMethod({ data });
    let methods = [...statement.methods, method];
    handleStatement(
      updateStatementMethods(
        { ...statement, methods },
        getPreviousStatements([...prevStatements, ...prevOperations])
      )
    );
  }

  function handleData(data: IData, remove?: boolean) {
    if (remove) handleStatement(statement, remove);
    else {
      let methods = [...statement.methods];
      let statementData = statement.data as IData;
      if (statementData.type !== data.type) methods = [];
      handleStatement(
        updateStatementMethods(
          { ...statement, data, methods },
          getPreviousStatements([...prevStatements, ...prevOperations])
        )
      );
    }
  }

  function handelOperation(operation: IOperation, remove?: boolean) {
    let methods = operation.reference?.isCalled ? [...statement.methods] : [];
    if (remove) handleStatement(statement, remove);
    else
      handleStatement(
        updateStatementMethods(
          { ...statement, data: operation, methods },
          getPreviousStatements([...prevStatements, ...prevOperations])
        )
      );
  }

  function handleMethod(method: IMethod, index: number, remove?: boolean) {
    let methods = [...statement.methods];
    if (remove) {
      let data = getStatementResult(statement, index);
      if (!isSameType(method.result, data)) methods.splice(index);
      else methods.splice(index, 1);
    } else {
      if (!isSameType(method.result, methods[index].result))
        methods.splice(index + 1);
      methods[index] = method;
    }
    handleStatement(
      updateStatementMethods(
        { ...statement, methods },
        getPreviousStatements([...prevStatements, ...prevOperations])
      )
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
                let name = value || statement.name;
                const exists = prevStatements.find(
                  (item) => item.name === name
                );
                if (!exists) handleStatement({ ...statement, name });
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
                    name: hasName ? undefined : `v_${statement.id.slice(-3)}`,
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
                prevOperations={prevOperations}
                onSelect={(statement) => {
                  addStatement?.(statement, "after");
                  closeDropdown();
                }}
              />
            </Popover.Dropdown>
          </Popover>
        </div>
      ) : null}
      <div
        className={
          "flex items-start gap-0 " +
          (statement.methods.length > 1 ? "flex-col" : "flex-row")
        }
      >
        {statement.data.entityType === "data" ? (
          <Data
            data={statement.data}
            disableDelete={options?.disableDelete}
            addMethod={
              !options?.disableMethods && statement.methods.length === 0
                ? addMethod
                : undefined
            }
            prevStatements={prevStatements}
            prevOperations={prevOperations}
            handleChange={
              statement.data.entityType === "data"
                ? handleData
                : handelOperation
            }
          />
        ) : (
          <Operation
            operation={statement.data}
            handleChange={
              statement.data.entityType === "operation"
                ? handelOperation
                : handleData
            }
            prevStatements={prevStatements}
            prevOperations={prevOperations}
            options={{ disableDelete: options?.disableDelete }}
            addMethod={
              !options?.disableMethods &&
              statement.methods.length === 0 &&
              statement.data.reference?.isCalled
                ? addMethod
                : undefined
            }
          />
        )}
        {statement.methods.map((method, i, methods) => {
          let data = getStatementResult(statement, i, true);
          if (data.entityType !== "data") return;
          return (
            <div key={method.id} className="flex items-start gap-1 ml-1">
              <PipeArrow
                size={10}
                className="text-disabled mt-1.5"
                style={{
                  transform: methods.length > 1 ? "rotate(90deg)" : "",
                }}
              />
              <Method
                data={data}
                method={method}
                handleMethod={(meth, remove) => handleMethod(meth, i, remove)}
                prevStatements={prevStatements}
                prevOperations={prevOperations}
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
