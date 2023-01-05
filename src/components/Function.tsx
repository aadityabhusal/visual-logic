import { Play } from "@styled-icons/fa-solid";
import { useState } from "react";
import styled from "styled-components";
import { theme } from "../lib/theme";
import { IFunction, IStatement } from "../lib/types";
import { createData, createStatement } from "../lib/utils";
import { Input } from "./Input/Input";
import { Result } from "./Result";
import { Statement } from "./Statement";

export function Func({
  func,
  handleFunc,
}: {
  func: IFunction;
  handleFunc(fn: IFunction): void;
}) {
  const [toggleResult, setToggleResult] = useState(false);

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
    statement: IStatement,
    remove?: boolean
  ) {
    let statements = [...func.statements];
    if (remove) statements.splice(index, 1);
    else statements[index] = statement;
    handleFunc({ ...func, statements });
  }

  return (
    <FunctionWrapper>
      <FunctionHead>
        <Input
          data={createData("string", func.name)}
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
        <div style={{ cursor: "pointer" }} onClick={addStatement}>
          +
        </div>
      </FunctionBody>
      <div>
        {"}"}
        <Play
          size={10}
          style={{ cursor: "pointer" }}
          onClick={() => setToggleResult((t) => !t)}
        />
      </div>
      {toggleResult ? <Result func={func} /> : null}
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
