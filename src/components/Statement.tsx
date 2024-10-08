import { FaEquals, FaArrowRightLong, FaArrowTurnUp } from "react-icons/fa6";
import { theme } from "../lib/theme";
import { IData, IMethod, IOperation, IStatement } from "../lib/types";
import { updateStatementMethods } from "../lib/update";
import {
  isSameType,
  getStatementResult,
  getPreviousStatements,
} from "../lib/utils";
import { createMethod } from "../lib/methods";
import { Data } from "./Data";
import { Input } from "./Input/Input";
import { Method } from "./Method";
import { Operation } from "./Operation";
import { DropdownList } from "./DropdownList";

export function Statement({
  statement,
  handleStatement,
  disableName,
  disableNameToggle,
  disableDelete,
  disableMethods,
  prevStatements,
  prevOperations,
}: {
  statement: IStatement;
  handleStatement: (statement: IStatement, remove?: boolean) => void;
  disableName?: boolean;
  disableNameToggle?: boolean;
  disableDelete?: boolean;
  disableMethods?: boolean;
  prevStatements: IStatement[];
  prevOperations: IOperation[];
}) {
  const hasName = statement.name !== undefined;
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

  const dropdownList = (
    <DropdownList
      data={statement.data}
      handleData={handleData}
      prevStatements={prevStatements}
      prevOperations={prevOperations}
      handelOperation={handelOperation}
    />
  );

  return (
    <div className="flex items-start gap-1">
      {!disableName ? (
        <div className="flex items-center gap-1 mr-1 [&>svg]:cursor-pointer [&>svg]:shrink-0">
          {hasName ? (
            <Input
              data={{
                id: "",
                type: "string",
                value: statement.name || "",
                entityType: "data",
              }}
              handleData={(data) => {
                let name = (data.value as string) || statement.name;
                const exists = prevStatements.find(
                  (item) => item.name === name
                );
                if (!exists) handleStatement({ ...statement, name });
              }}
              color={theme.color.variable}
              noQuotes
            />
          ) : null}
          <FaEquals
            size={14}
            className="pt-1"
            onClick={() =>
              !disableNameToggle &&
              handleStatement({
                ...statement,
                name: hasName ? undefined : `v_${statement.id.slice(-3)}`,
              })
            }
          />
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
            handleData={(data, remove) => handleData(data, remove)}
            disableDelete={disableDelete}
            addMethod={
              !disableMethods && statement.methods.length === 0
                ? addMethod
                : undefined
            }
            children={dropdownList}
            prevStatements={prevStatements}
            prevOperations={prevOperations}
          />
        ) : (
          <Operation
            operation={statement.data}
            handleOperation={handelOperation}
            prevStatements={prevStatements}
            prevOperations={prevOperations}
            disableDelete={disableDelete}
            children={dropdownList}
            addMethod={
              !disableMethods &&
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
                  !disableMethods && i + 1 === methods.length
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
