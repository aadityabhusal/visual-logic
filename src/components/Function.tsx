import { Play } from "@styled-icons/fa-solid";
import { useState } from "react";
import styled from "styled-components";
import { theme } from "../lib/theme";
import { IContextProps, IData, IFunction } from "../lib/types";
import { createData, getDataFromVariable } from "../lib/utils";
import { Data } from "./Data";
import { Input } from "./Input/Input";

export function Func({
  funcData,
  handleFunc,
  context,
}: {
  funcData: IFunction;
  handleFunc(fn: IFunction): void;
  context: IContextProps;
}) {
  const [func, setFunc] = useState<IFunction>(funcData);

  function handleFunctionProps(
    key: keyof IFunction,
    value: IFunction[typeof key]
  ) {
    setFunc((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function addStatement() {
    setFunc((prev) => ({
      ...prev,
      statements: [...prev.statements, createData("string", "")],
    }));
  }

  function handleData(index: number, data: IData, remove?: boolean) {
    let statements = [...func.statements];
    if (remove) statements.splice(index, 1);
    else statements[index] = data;
    setFunc((prev) => ({
      ...prev,
      statements,
    }));
  }

  return func ? (
    <FunctionWrapper>
      <FunctionHead>
        <Play
          size={14}
          onClick={() => handleFunc(func)}
          style={{ cursor: "pointer" }}
        />
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
          <Data
            key={i}
            data={
              statement.entityType === "variable"
                ? getDataFromVariable(statement, { ...func, parent: context })
                : statement
            }
            handleData={(value, remove) => handleData(i, value, remove)}
            context={{ ...func, parent: context }}
          />
        ))}
        <div style={{ cursor: "pointer" }} onClick={addStatement}>
          +
        </div>
      </FunctionBody>
      <div>{"}"}</div>
    </FunctionWrapper>
  ) : null;
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
