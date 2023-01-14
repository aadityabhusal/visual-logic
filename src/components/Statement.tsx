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
  const firstData = statement.entities[0] as IData;
  const hasVariable = statement.variable !== undefined;

  function addMethod() {
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
    entities = updateEntities(entities);
    handleStatement(
      { ...statement, entities, return: getLastEntity(entities) },
      remove && index === 0
    );
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
        data={firstData}
        handleData={(data, remove) => handleEntity(data, 0, remove)}
        parentStatement={statement}
        disableDelete={disableDelete}
      />
      {(statement.entities.slice(1) as IMethod[]).map((method, i, entities) => {
        let data = i === 0 ? firstData : entities[i - 1].result;
        return (
          <Operation
            key={method.id}
            data={data}
            operation={method}
            handleOperation={(method, remove) =>
              handleEntity(method, i + 1, remove)
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
