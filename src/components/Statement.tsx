import { Equals } from "@styled-icons/fa-solid";
import styled from "styled-components";
import { theme } from "../lib/theme";
import { IData, IMethod, IOperation, IStatement } from "../lib/types";
import { updateStatementMethods, getStatementResult } from "../lib/update";
import { createMethod } from "../lib/utils";
import { Data } from "./Data";
import { Input } from "./Input/Input";
import { Method } from "./Method";
import { Operation } from "./Operation";
import { DropdownList } from "./DropdownList";

export function Statement({
  statement,
  handleStatement,
  disableName,
  disableDelete,
  disableMethods,
  prevStatements,
  prevOperations,
}: {
  statement: IStatement;
  handleStatement: (statement: IStatement, remove?: boolean) => void;
  disableName?: boolean;
  disableDelete?: boolean;
  disableMethods?: boolean;
  prevStatements: IStatement[];
  prevOperations: IOperation[];
}) {
  const hasName = statement.name !== undefined;

  function addMethod() {
    let method = createMethod({
      data: getStatementResult(statement),
    });
    let methods = [...statement.methods, method];
    handleStatement(updateStatementMethods({ ...statement, methods }));
  }

  function handleData(data: IData, remove?: boolean) {
    if (remove) handleStatement(statement, remove);
    else {
      let methods = [...statement.methods];
      let statementData = statement.data as IData;
      if (statementData.type !== data.type) methods = [];
      handleStatement(updateStatementMethods({ ...statement, data, methods }));
    }
  }

  function handelOperation(operation: IOperation, remove?: boolean) {
    if (remove) handleStatement(statement, remove);
    else handleStatement({ ...statement, data: operation });
  }

  function handleMethod(method: IMethod, index: number, remove?: boolean) {
    let methods = [...statement.methods];
    if (remove) {
      let data = getStatementResult(statement, index);
      if (method.result.type !== data.type) methods.splice(index);
      else methods.splice(index, 1);
    } else {
      if (method.result.type !== methods[index].result.type)
        methods.splice(index + 1);
      methods[index] = method;
    }
    handleStatement(updateStatementMethods({ ...statement, methods }));
  }

  const dropdownList = (
    <DropdownList
      data={statement.data}
      handleData={(data, remove) => handleData(data, remove)}
      prevStatements={prevStatements}
      prevOperations={prevOperations}
      selectOperation={(operation) =>
        handleStatement({ ...statement, data: operation })
      }
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
              handleStatement({
                ...statement,
                name: hasName ? undefined : `v_${statement.id.slice(-3)}`,
              })
            }
          />
        </StatementName>
      ) : null}
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
        />
      ) : (
        <Operation
          operation={statement.data}
          handleOperation={handelOperation}
          prevStatements={prevStatements}
          prevOperations={prevOperations}
          disableDelete={disableDelete}
          children={dropdownList}
        />
      )}
      {statement.methods.map((method, i, methods) => {
        let data = getStatementResult(statement, i);
        return (
          <Method
            key={method.id}
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
        );
      })}
    </StatementWrapper>
  );
}

const StatementWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.25rem;
  & svg {
    cursor: pointer;
    flex-shrink: 0;
  }
`;

const StatementName = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-right: 0.25rem;
`;
