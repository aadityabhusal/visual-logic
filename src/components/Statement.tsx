import { Equals, Plus } from "@styled-icons/fa-solid";
import styled from "styled-components";
import { useStore } from "../lib/store";
import { theme } from "../lib/theme";
import { IData, IMethod, IStatement } from "../lib/types";
import { updateStatementMethods, getLastEntity } from "../lib/update";
import { createMethod } from "../lib/utils";
import { Data } from "./Data";
import { Input } from "./Input/Input";
import { Operation } from "./Operation";

export function Statement({
  statement,
  handleStatement,
  disableVariable,
  disableDelete,
  path,
}: {
  statement: IStatement;
  handleStatement: (statement: IStatement, remove?: boolean) => void;
  disableVariable?: boolean;
  disableDelete?: boolean;
  path: string[];
}) {
  const hasVariable = statement.variable !== undefined;
  const context = useStore((state) => state.functions);
  const statements =
    context.find((func) => func.id === path[0])?.statements || [];

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
      {!disableVariable ? (
        <StatementVariable>
          {hasVariable ? (
            <Input
              data={{
                id: "",
                type: "string",
                value: statement.variable || "",
                entityType: "data",
              }}
              handleData={(data) => {
                let variable = (data.value as string) || statement.variable;
                const exists = statements.find(
                  (item) => item.variable === variable
                );
                if (!exists) handleStatement({ ...statement, variable });
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
                variable: hasVariable
                  ? undefined
                  : `var_${statement.id.slice(-3)}`,
              })
            }
          />
        </StatementVariable>
      ) : null}
      <Data
        data={statement.data}
        handleData={(data, remove) => handleData(data, remove)}
        path={[...path, statement.id]}
        disableDelete={disableDelete}
      />
      {statement.methods.map((method, i, methods) => {
        let data = i === 0 ? statement.data : methods[i - 1].result;
        return (
          <Operation
            key={method.id}
            data={data}
            operation={method}
            handleOperation={(meth, remove) => handleMethod(meth, i, remove)}
            path={[...path, statement.id]}
          />
        );
      })}
      <Plus size={10} onClick={addMethod}>
        +
      </Plus>
    </StatementWrapper>
  );
}

const StatementWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  & svg {
    cursor: pointer;
    flex-shrink: 0;
  }
`;

const StatementVariable = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-right: 0.25rem;
`;
