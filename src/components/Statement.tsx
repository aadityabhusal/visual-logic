import { Equals, RightLong, TurnUp } from "@styled-icons/fa-solid";
import styled from "styled-components";
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
  const PipeArrow = statement.methods.length > 1 ? TurnUp : RightLong;

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
    <StatementWrapper>
      {!disableName ? (
        <StatementName>
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
          <Equals
            size={10}
            style={{ paddingTop: "0.25rem" }}
            onClick={() =>
              !disableNameToggle &&
              handleStatement({
                ...statement,
                name: hasName ? undefined : `v_${statement.id.slice(-3)}`,
              })
            }
          />
        </StatementName>
      ) : null}
      <RightHandWrapper newLine={statement.methods.length > 1}>
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
            <div key={method.id} style={{ display: "flex" }}>
              <PipeArrow
                size={12}
                color={theme.color.disabled}
                style={{
                  margin: `4 4 0 ${methods.length > 1 ? 4 : 0}`,
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
      </RightHandWrapper>
    </StatementWrapper>
  );
}

const StatementWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.25rem;
`;

const StatementName = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-right: 0.25rem;
  & > svg {
    cursor: pointer;
    flex-shrink: 0;
  }
`;

const RightHandWrapper = styled.div<{ newLine?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 4px;
  flex-direction: ${({ newLine }) => (newLine ? "column" : "row")};
`;
