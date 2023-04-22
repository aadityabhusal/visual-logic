import { Equals } from "@styled-icons/fa-solid";
import styled from "styled-components";
import { theme } from "../lib/theme";
import { IData, IMethod, IStatement } from "../lib/types";
import { updateStatementMethods, getLastEntity } from "../lib/update";
import { createMethod } from "../lib/utils";
import { Data, DataWrapper } from "./Data";
import { Input } from "./Input/Input";
import { Method } from "./Method";
import { Operation } from "./Operation";
import { DropdownList } from "./DropdownList";
import { Dropdown } from "../ui/Dropdown";

export function Statement({
  statement,
  handleStatement,
  path,
  disableName,
  disableDelete,
  disableMethods,
  prevStatements,
}: {
  statement: IStatement;
  handleStatement: (statement: IStatement, remove?: boolean) => void;
  path: string[];
  disableName?: boolean;
  disableDelete?: boolean;
  disableMethods?: boolean;
  prevStatements: IStatement[];
}) {
  const hasName = statement.name !== undefined;

  function addMethod() {
    let method = createMethod({
      data: getLastEntity(statement, statement.methods.length),
    });
    let methods = [...statement.methods, method];
    handleStatement(updateStatementMethods({ ...statement, methods }));
  }

  function handleData(data: IStatement["data"], remove?: boolean) {
    if (remove) handleStatement(statement, remove);
    else {
      let methods = [...statement.methods];
      let statementData = getLastEntity(statement);
      if (statementData.type !== (data as IData).type) methods = [];
      handleStatement(updateStatementMethods({ ...statement, data, methods }));
    }
  }

  function handleMethod(method: IMethod, index: number, remove?: boolean) {
    let methods = [...statement.methods];
    if (remove) {
      let data = getLastEntity(statement, index);
      if (method.result.type !== data.type) methods.splice(index);
      else methods.splice(index, 1);
    } else {
      if (method.result.type !== methods[index].result.type)
        methods.splice(index + 1);
      methods[index] = method;
    }
    handleStatement(updateStatementMethods({ ...statement, methods }));
  }

  return (
    <StatementWrapper>
      {!disableName ? (
        <StatementName>
          {hasName ? (
            <Input
              data={{
                id: "",
                type: "string",
                value: statement.name || "",
                entityType: "data",
              }}
              handleData={(data) => {
                let name = (data.value as string) || statement.name;
                const exists = prevStatements.find(
                  (item) => item.name === name
                );
                if (!exists) handleStatement({ ...statement, name });
              }}
              color={theme.color.variable}
              noQuotes
            />
          ) : null}
          <Equals
            size={10}
            style={{ paddingTop: "0.25rem" }}
            onClick={() =>
              handleStatement({
                ...statement,
                name: hasName ? undefined : `v_${statement.id.slice(-3)}`,
              })
            }
          />
        </StatementName>
      ) : null}
      <DataWrapper>
        <Dropdown
          result={{ data: statement.data }}
          handleDelete={
            !disableDelete ? () => handleData(statement.data, true) : undefined
          }
          addMethod={
            !disableMethods &&
            statement.methods.length === 0 &&
            statement.data.entityType !== "operation"
              ? addMethod
              : undefined
          }
          head={
            statement.data.reference?.name ? (
              <>
                <Input
                  data={{
                    id: "",
                    type: "string",
                    value: statement.data.reference?.name,
                    entityType: "data",
                  }}
                  handleData={() => {}}
                  disabled={true}
                  color={theme.color.variable}
                  noQuotes
                />
              </>
            ) : statement.data.entityType === "data" ? (
              <Data
                data={statement.data}
                handleData={(data, remove) => handleData(data, remove)}
              />
            ) : (
              <Operation
                operation={statement.data}
                handleOperation={(operation) =>
                  handleStatement({ ...statement, data: operation })
                }
                prevStatements={prevStatements}
              />
            )
          }
        >
          <DropdownList
            data={statement.data}
            handleData={(data, remove) => handleData(data, remove)}
            prevStatements={prevStatements}
            selectOperation={(operation) =>
              handleStatement({ ...statement, data: operation })
            }
          />
        </Dropdown>
      </DataWrapper>
      {statement.methods.map((method, i, methods) => {
        let data = getLastEntity(statement, i);
        return (
          <Method
            key={method.id}
            data={data}
            method={method}
            handleMethod={(meth, remove) => handleMethod(meth, i, remove)}
            path={[...path, statement.id]}
            prevStatements={prevStatements}
            addMethod={
              !disableMethods && i + 1 === methods.length
                ? addMethod
                : undefined
            }
          />
        );
      })}
    </StatementWrapper>
  );
}

const StatementWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.25rem;
  & svg {
    cursor: pointer;
    flex-shrink: 0;
  }
`;

const StatementName = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-right: 0.25rem;
`;
