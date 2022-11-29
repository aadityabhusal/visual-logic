import styled from "styled-components";
import { IData, IFunction } from "../lib/types";
import { createData } from "../lib/utils";
import { Data } from "./Data";
import { Input } from "./Input/Input";

export function Func({
  func,
  handleFunc,
}: {
  func: IFunction;
  handleFunc: React.Dispatch<React.SetStateAction<IFunction>>;
}) {
  function handleFunctionProps(
    key: keyof IFunction,
    value: IFunction[typeof key]
  ) {
    handleFunc((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function addStatement() {
    handleFunc((prev) => ({
      ...prev,
      statements: [...prev.statements, createData("string", "")],
    }));
  }

  function handleData(statement: IData, index: number) {
    handleFunc((prev) => {
      let statements = [...prev.statements];
      // let index = statements.findIndex((item) => item.id === statement.id);
      statements[index] = statement;
      return {
        ...prev,
        statements,
      };
    });
  }

  return (
    <FunctionWrapper>
      <FunctionHead>
        <Input
          data={createData("string", func.name)}
          handleData={(data) => handleFunctionProps("name", data.value.value)}
        />
        <span>{"("}</span>
        <span>{") {"}</span>
      </FunctionHead>
      {func.statements.map((statement, i) => (
        <Data
          key={i}
          data={statement}
          handleData={(value) => handleData(value, i)}
        />
      ))}
      <div onClick={addStatement}>+</div>
      <div>{"}"}</div>
    </FunctionWrapper>
  );
}

const FunctionWrapper = styled.div``;

const FunctionHead = styled.div`
  display: flex;
`;
