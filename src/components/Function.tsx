import { Plus } from "@styled-icons/fa-solid";
import styled from "styled-components";
import { theme } from "../lib/theme";
import { IFunction } from "../lib/types";
import { updateFunction } from "../lib/update";
import { createStatement } from "../lib/utils";
import { Input } from "./Input/Input";
import { Statement } from "./Statement";

export function Func({
  func,
  handleFunc,
}: {
  func: IFunction;
  handleFunc(fn: IFunction): void;
}) {
  function handleFunctionProps(
    key: keyof IFunction,
    value: IFunction[typeof key]
  ) {
    handleFunc({ ...func, [key]: value });
  }

  function addStatement() {
    let statements = [...func.statements, createStatement()];
    handleFunc({ ...func, statements });
  }

  function handleStatement(
    index: number,
    statement: IFunction["statements"][number],
    remove?: boolean
  ) {
    let statements = [...func.statements];
    if (remove) statements.splice(index, 1);
    else statements[index] = statement;
    let result = { ...func, statements } as IFunction;
    if (index + 1 < func.statements.length) {
      result = updateFunction(result, statement, index, remove);
    }
    handleFunc(result);
  }

  return (
    <FunctionWrapper>
      <FunctionHead>
        <Input
          data={{
            id: "",
            type: "string",
            value: func.name,
            entityType: "data",
          }}
          handleData={(data) =>
            handleFunctionProps("name", data.value as string)
          }
          color={theme.color.variable}
          noQuotes
        />
        <span>{"("}</span>
        <span>{") {"}</span>
      </FunctionHead>
      <FunctionBody>
        {func.statements.map((statement, i) => (
          <Statement
            key={statement.id}
            statement={statement}
            handleStatement={(statement, remove) =>
              handleStatement(i, statement, remove)
            }
          />
        ))}
        <Plus size={10} style={{ cursor: "pointer" }} onClick={addStatement} />
      </FunctionBody>
      <div>{"}"}</div>
    </FunctionWrapper>
  );
}

const FunctionWrapper = styled.div`
  max-width: max-content;
`;

const FunctionHead = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const FunctionBody = styled.div`
  padding-left: 1rem;
`;
