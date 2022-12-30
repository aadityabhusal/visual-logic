import styled from "styled-components";
import { IContextProps, IData, IMethod, IStatement } from "../lib/types";
import { createMethod, getDataFromVariable } from "../lib/utils";
import { Data } from "./Data";

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

  function handleEntity(data: IData, index: number, remove?: boolean) {
    let entities = [...statement.entities];
    if (remove) entities.splice(index, 1);
    else entities[index] = data;
    handleStatement({ ...statement, entities });
  }

  return (
    <StatementWrapper>
      <Data
        data={
          firstData.entityType === "variable"
            ? getDataFromVariable(firstData, context)
            : firstData
        }
        handleData={(data) => handleEntity(data, 0)}
        context={context}
      />
      <div onClick={addMethod}>+</div>
    </StatementWrapper>
  );
}

const StatementWrapper = styled.div`
  display: flex;
  align-items: center;
`;
