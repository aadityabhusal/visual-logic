import { useState } from "react";
import styled, { ThemeProvider } from "styled-components";
import { Operation } from "./components/Operation";
import { ParseOperation } from "./components/Parse/ParseOperation";
import { useStore } from "./lib/store";
import { theme } from "./lib/theme";
import { Header } from "./ui/Header";
import { Sidebar } from "./ui/Sidebar";
import { updateOperations } from "./lib/update";

function App() {
  const [operations, setOperation, currentId] = useStore((state) => [
    state.operations,
    state.setOperation,
    state.currentId,
  ]);
  const currentOperationIndex = operations.findIndex(
    (item) => item.id === currentId
  );
  const currentOperation = operations[currentOperationIndex];
  const [codeDisplay, setCodeDisplay] = useState(false);
  const [sidebarDisplay, setSidebarDisplay] = useState(true);

  return (
    <ThemeProvider theme={theme}>
      <AppWrapper>
        <Header toggleSidebar={() => setSidebarDisplay((prev) => !prev)} />
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
              <div>Select an operation</div>
            )}
          </OperationContainer>
          {codeDisplay && currentOperation ? (
            <OperationContainer>
              <ExportCodeNote>
                In progress and preview only. Not to be used as valid code.
              </ExportCodeNote>
              <pre>
                <ParseOperation operation={currentOperation} />
              </pre>
            </OperationContainer>
          ) : null}
          {sidebarDisplay && (
            <Sidebar toggleCode={() => setCodeDisplay((prev) => !prev)} />
          )}
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
  padding: 0.5rem;
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

const ExportCodeNote = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.color.disabled};
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
  margin-bottom: 0.5rem;
  font-style: italic;
`;

export default App;
