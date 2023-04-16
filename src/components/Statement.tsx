import { Equals } from "@styled-icons/fa-solid";
import styled from "styled-components";
import { theme } from "../lib/theme";
import { IData, IMethod, IStatement } from "../lib/types";
import { updateStatementMethods, getLastEntity } from "../lib/update";
import { createMethod } from "../lib/utils";
import { Data } from "./Data";
import { Input } from "./Input/Input";
import { Method } from "./Method";

export function Statement({
  statement,
  handleStatement,
  prevStatements,
  disableName,
  disableDelete,
  disableMethods,
}: {
  statement: IStatement;
  handleStatement: (statement: IStatement, remove?: boolean) => void;
  prevStatements: IStatement[];
  disableName?: boolean;
  disableDelete?: boolean;
  disableMethods?: boolean;
}) {
  const hasName = statement.name !== undefined;

  function addMethod() {
    let method = createMethod({ data: getLastEntity(statement) });
    let methods = [...statement.methods, method];
    handleStatement(updateStatementMethods({ ...statement, methods }));
  }

  function handleData(data: IData, remove?: boolean) {
    if (remove) handleStatement(statement, remove);
    else {
      let methods = [...statement.methods];
      if (statement.data.type !== data.type) methods = [];
      handleStatement(updateStatementMethods({ ...statement, data, methods }));
    }
  }

  function handleMethod(method: IMethod, index: number, remove?: boolean) {
    let methods = [...statement.methods];
    if (remove) {
      let data = index === 0 ? statement.data : methods[index - 1].result;
      if (method.result.type !== data.type) methods.splice(index);
      else methods.splice(index, 1);
    } else {
      if (method.result.type !== methods[index].result.type)
        methods.splice(index + 1);
      methods[index] = method;
    }
    handleStatement(updateStatementMethods({ ...statement, methods }));
  }

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
            onClick={() =>
              handleStatement({
                ...statement,
                name: hasName ? undefined : `v_${statement.id.slice(-3)}`,
              })
            }
            style={{ paddingTop: "0.25rem" }}
          />
        </StatementName>
      ) : null}
      <Data
        data={statement.data}
        handleData={(data, remove) => handleData(data, remove)}
        prevStatements={prevStatements}
        disableDelete={disableDelete}
        addMethod={
          !disableMethods && statement.methods.length === 0
            ? addMethod
            : undefined
        }
      />
      {statement.methods.map((method, i, methods) => {
        let data = i === 0 ? statement.data : methods[i - 1].result;
        return (
          <Method
            key={method.id}
            data={data}
            method={method}
            handleMethod={(meth, remove) => handleMethod(meth, i, remove)}
            prevStatements={prevStatements}
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
