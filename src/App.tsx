import { useState } from "react";
import styled from "styled-components";
import { Operation } from "./components/Operation";
import { ParseOperation } from "./components/Parse/ParseOperation";
import { useStore } from "./lib/store";
import { theme } from "./lib/theme";
import { Header } from "./ui/Header";
import { Sidebar } from "./ui/Sidebar";

function App() {
  const [operations, setOperation, currentIndex] = useStore((state) => [
    state.operations,
    state.setOperation,
    state.currentIndex,
  ]);
  const currentOperation = operations[currentIndex];
  const [toggleCode, setToggleCode] = useState(false);

  return (
    <AppWrapper>
      <Header />
      <AppContainer>
        <OperationContainer>
          {currentOperation ? (
            <Operation
              operation={currentOperation}
              handleOperation={(operation) =>
                setOperation(operation, currentIndex)
              }
            />
          ) : (
            <div>Select an operation</div>
          )}
        </OperationContainer>
        {toggleCode && currentOperation ? (
          <OperationContainer>
            <ParseOperation operation={currentOperation} showVariable={true} />
          </OperationContainer>
        ) : null}
        <Sidebar setToggleCode={() => setToggleCode((prev) => !prev)} />
      </AppContainer>
    </AppWrapper>
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
  border-right: 1px solid ${theme.color.border};

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${theme.background.dropdown.scrollbar};
  }
`;

export default App;
