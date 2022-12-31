import { Equals } from "@styled-icons/fa-solid";
import styled from "styled-components";
import { theme } from "../lib/theme";
import { IContextProps, IData, IMethod, IStatement } from "../lib/types";
import { createData, createMethod, getDataFromVariable } from "../lib/utils";
import { Data } from "./Data";
import { Input } from "./Input/Input";

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

  function handleEntity(data: IData, index: number, remove?: boolean) {
    let entities = [...statement.entities];
    if (remove) entities.splice(index, 1);
    else entities[index] = data;
    handleStatement({ ...statement, entities });
  }

  return (
    <StatementWrapper>
      <StatementVariable>
        {hasVariable ? (
          <Input
            data={createData("string", statement.variable || "")}
            handleData={(value) =>
              handleStatement({ ...statement, variable: value.value as string })
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
