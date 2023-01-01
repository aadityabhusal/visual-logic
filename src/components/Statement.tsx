import { Equals } from "@styled-icons/fa-solid";
import styled from "styled-components";
import { theme } from "../lib/theme";
import { IContextProps, IData, IMethod, IStatement } from "../lib/types";
import { createData, createMethod, getDataFromVariable } from "../lib/utils";
import { Data } from "./Data";
import { Input } from "./Input/Input";
import { Operation } from "./Operation";

export function Statement({
  statement,
  handleStatement,
  context,
}: {
  statement: IStatement;
  handleStatement: (statement: IStatement, remove?: boolean) => void;
  context: IContextProps;
}) {
  const firstData = statement.entities[0] as IData;
  const hasVariable = statement.variable !== undefined;

  function addMethod() {
    function getLastEntity(entities: IStatement["entities"]) {
      if (entities.length === 1) return entities[0] as IData;
      else return (entities[entities.length - 1] as IMethod).result;
    }
    let data = getLastEntity(statement.entities);
    let method = createMethod({ data, index: 0 });
    handleStatement({
      ...statement,
      entities: [...statement.entities, method],
    });
  }

  function handleEntity(
    entity: IData | IMethod,
    index: number,
    remove?: boolean
  ) {
    let entities = [...statement.entities];
    if (remove) entities.splice(index, 1);
    else {
      let [prevData, newData] = [
        index === 0 ? entities[index] : (entities[index] as IMethod).result,
        index === 0 ? entity : (entity as IMethod).result,
      ] as IData[];
      if (prevData.type !== newData.type) entities.splice(index + 1);
      entities[index] = entity;
    }
    handleStatement({ ...statement, entities });
  }

  return (
    <StatementWrapper>
      <StatementVariable>
        {hasVariable ? (
          <Input
            data={createData("string", statement.variable || "")}
            handleData={(data) =>
              handleStatement({ ...statement, variable: data.value as string })
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
      <Data
        data={
          firstData.entityType === "variable"
            ? getDataFromVariable(firstData, context)
            : firstData
        }
        handleData={(data, remove) => handleEntity(data, 0, remove)}
        context={context}
      />
      {(statement.entities.slice(1) as IMethod[]).map((method, i, entities) => {
        let data = i === 0 ? firstData : entities[i - 1].result;
        method.result = method.handler(data, ...method.parameters);
        return (
          <Operation
            key={method.id}
            data={data}
            operation={method}
            handleOperation={(method, rem) => handleEntity(method, i + 1, rem)}
            context={context}
          />
        );
      })}
      <div onClick={addMethod}>+</div>
    </StatementWrapper>
  );
}

const StatementWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const StatementVariable = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-right: 0.25rem;

  & svg {
    cursor: pointer;
  }
`;
