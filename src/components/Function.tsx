import { Play } from "@styled-icons/fa-solid";
import { useState } from "react";
import styled from "styled-components";
import { theme } from "../lib/theme";
import { IFunction } from "../lib/types";
import { createCondition, createData, createStatement } from "../lib/utils";
import { Condition } from "./Condition";
import { Input } from "./Input/Input";
import { ParseFunction } from "./Parse/ParseFunction";
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

  function addStatement(type: "statement" | "condition") {
    let statements = [
      ...func.statements,
      type === "condition" ? createCondition() : createStatement(),
    ];
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
        {func.statements.map((statement, i) =>
          statement.entityType === "statement" ? (
            <Statement
              key={statement.id}
              statement={statement}
              handleStatement={(statement, remove) =>
                handleStatement(i, statement, remove)
              }
            />
          ) : (
            <Condition
              key={statement.id}
              condition={statement}
              handleCondition={(condition, remove) =>
                handleStatement(i, condition, remove)
              }
            />
          )
        )}
        <div style={{ cursor: "pointer", display: "flex", gap: "8px" }}>
          <span onClick={() => addStatement("statement")}>+</span>
          <span onClick={() => addStatement("condition")}>?</span>
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
      {toggleResult ? <ParseFunction func={func} /> : null}
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
