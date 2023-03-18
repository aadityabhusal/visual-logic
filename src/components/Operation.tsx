import { Plus } from "@styled-icons/fa-solid";
import styled from "styled-components";
import { useStore } from "../lib/store";
import { theme } from "../lib/theme";
import { IOperation } from "../lib/types";
import { updateOperationStatements } from "../lib/update";
import { createStatement } from "../lib/utils";
import { Input } from "./Input/Input";
import { Statement } from "./Statement";

export function Operation({
  operation,
  handleOperation,
}: {
  operation: IOperation;
  handleOperation(operation: IOperation): void;
}) {
  const operations = useStore((state) => state.operations);

  function handleOperationProps(
    key: keyof IOperation,
    value: IOperation[typeof key]
  ) {
    if (key === "name" && operations.find((item) => item.name === value))
      return;
    handleOperation({ ...operation, [key]: value });
  }

  function addStatement() {
    let statements = [...operation.statements, createStatement()];
    handleOperation({ ...operation, statements });
  }

  function handleStatement(
    index: number,
    statement: IOperation["statements"][number],
    remove?: boolean
  ) {
    let statements = [...operation.statements];
    if (remove) statements.splice(index, 1);
    else statements[index] = statement;
    let result = { ...operation, statements } as IOperation;
    if (index + 1 < operation.statements.length) {
      result = updateOperationStatements(result, statement, index, remove);
    }
    handleOperation(result);
  }

  return (
    <OperationWrapper>
      <OperationHead>
        <Input
          data={{
            id: "",
            type: "string",
            value: operation.name,
            entityType: "data",
          }}
          handleData={(data) =>
            handleOperationProps("name", data.value as string)
          }
          color={theme.color.variable}
          noQuotes
        />
        <span>{"("}</span>
        <span>{") {"}</span>
      </OperationHead>
      <OperationBody>
        {operation.statements.map((statement, i) => (
          <Statement
            key={statement.id}
            statement={statement}
            handleStatement={(statement, remove) =>
              handleStatement(i, statement, remove)
            }
            path={[operation.id]}
          />
        ))}
        <Plus size={10} style={{ cursor: "pointer" }} onClick={addStatement} />
      </OperationBody>
      <div>{"}"}</div>
    </OperationWrapper>
  );
}

const OperationWrapper = styled.div`
  max-width: max-content;
`;

const OperationHead = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const OperationBody = styled.div`
  padding-left: 1rem;
`;
