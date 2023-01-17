import { Equals, Plus } from "@styled-icons/fa-solid";
import styled from "styled-components";
import { theme } from "../lib/theme";
import { IData, IMethod, IStatement } from "../lib/types";
import {
  createData,
  createMethod,
  getLastEntity,
  updateEntities,
} from "../lib/utils";
import { Data } from "./Data";
import { Input } from "./Input/Input";
import { Operation } from "./Operation";

export function Statement({
  statement,
  handleStatement,
  disableVariable,
  disableDelete,
}: {
  statement: IStatement;
  handleStatement: (statement: IStatement, remove?: boolean) => void;
  disableVariable?: boolean;
  disableDelete?: boolean;
}) {
  const hasVariable = statement.variable !== undefined;

  function addMethod() {
    let method = createMethod({ data: getLastEntity(statement), index: 0 });
    let methods = [...statement.methods, method];
    handleStatement({ ...statement, methods });
  }

  function handleMethod(method: IMethod, index: number, remove?: boolean) {
    let methods = [...statement.methods];
    if (remove) methods.splice(index, 1);
    else {
      if (method.result.type !== methods[index].result.type)
        methods.splice(index + 1);
      methods[index] = method;
    }
    methods = updateEntities(statement);
    let result = { ...statement, methods };
    handleStatement({ ...result, return: getLastEntity(result) });
  }

  return (
    <StatementWrapper>
      {!disableVariable ? (
        <StatementVariable>
          {hasVariable ? (
            <Input
              data={createData("string", statement.variable || "")}
              handleData={(data) =>
                handleStatement({
                  ...statement,
                  variable: data.value as string,
                })
              }
              color={theme.color.variable}
              noQuotes
            />
          ) : null}
          <Equals
            size={10}
            onClick={() =>
              handleStatement({
                ...statement,
                variable: hasVariable ? undefined : "",
              })
            }
          />
        </StatementVariable>
      ) : null}
      <Data
        data={statement.data}
        handleData={(data, remove) =>
          handleStatement({ ...statement, data }, remove)
        }
        parentStatement={statement}
        disableDelete={disableDelete}
      />
      {statement.methods.map((method, i) => {
        return (
          <Operation
            key={method.id}
            data={method.result}
            operation={method}
            handleOperation={(method, remove) =>
              handleMethod(method, i + 1, remove)
            }
            parentStatement={statement}
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
  }
`;

const StatementVariable = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-right: 0.25rem;
`;
