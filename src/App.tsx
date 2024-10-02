import styled, { ThemeProvider } from "styled-components";
import { Operation } from "./components/Operation";
import { ParseOperation } from "./components/Parse/ParseOperation";
import { uiConfigStore, useStore } from "./lib/store";
import { theme } from "./lib/theme";
import { Header } from "./ui/Header";
import { NoteText, Sidebar } from "./ui/Sidebar";
import { updateOperations } from "./lib/update";
import { useEffect } from "react";
import { visitCount } from "./ui/services";
import { useHotkeys } from "@mantine/hooks";

function App() {
  const { operations, setOperation } = useStore();
  const { displayCode, hideSidebar, selectedOperationId, setUiConfig } =
    uiConfigStore();
  const { undo, redo } = useStore.temporal.getState();

  const currentOperationIndex = operations.findIndex(
    (item) => item.id === selectedOperationId
  );
  const currentOperation = operations[currentOperationIndex];

  useEffect(() => {
    if (!selectedOperationId && operations[0]) {
      setUiConfig({ selectedOperationId: operations[0]?.id });
    }
  });

  useEffect(() => {
    if (window.location.hostname !== "localhost") visitCount();
  }, []);

  useHotkeys([
    ["meta+shift+z", () => redo()],
    ["meta+z", () => undo()],
    ["meta+y", () => redo()],
  ]);

  return (
    <ThemeProvider theme={theme}>
      <AppWrapper>
        <Header />
        <AppContainer>
          <OperationContainer>
            {currentOperation ? (
              <Operation
                operation={currentOperation}
                handleOperation={(operation) =>
                  setOperation(updateOperations(operations, operation))
                }
                prevStatements={[]}
                prevOperations={operations.slice(0, currentOperationIndex)}
              />
            ) : (
              <NoteText>Select an operation</NoteText>
            )}
          </OperationContainer>
          {displayCode && currentOperation ? (
            <OperationContainer>
              <NoteText border italic>
                In-progress and preview-only.
              </NoteText>
              <pre>
                <ParseOperation operation={currentOperation} />
              </pre>
            </OperationContainer>
          ) : null}
          {!hideSidebar && <Sidebar />}
        </AppContainer>
      </AppWrapper>
    </ThemeProvider>
  );
}

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const AppContainer = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
`;

const OperationContainer = styled.div`
  padding: 0.25rem;
  padding-bottom: 25%;
  flex: 1;
  overflow-y: auto;
  border-right: 1px solid ${({ theme }) => theme.color.border};

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.background.dropdown.scrollbar};
  }
`;

export default App;
