import { useState } from "react";
import styled from "styled-components";
import { Func } from "./components/Function";
import { ParseFunction } from "./components/Parse/ParseFunction";
import { useStore } from "./lib/store";
import { theme } from "./lib/theme";
import { Header } from "./ui/Header";
import { Sidebar } from "./ui/Sidebar";

function App() {
  const [func, setFunc] = useStore((state) => [
    state.functions,
    state.setFunction,
  ]);
  const [currentId, setCurrentId] = useState<string>();
  const currentFunction = func.find((item) => item.id === currentId);
  const [toggleCode, setToggleCode] = useState(false);
  return (
    <AppWrapper>
      <Header />
      <AppContainer>
        <FunctionContainer>
          {currentFunction ? (
            <Func func={currentFunction} handleFunc={(fn) => setFunc(fn)} />
          ) : (
            <div>Select a function</div>
          )}
        </FunctionContainer>
        {toggleCode && currentFunction ? (
          <FunctionContainer>
            <ParseFunction func={currentFunction} showVariable={true} />
          </FunctionContainer>
        ) : null}
        <Sidebar
          currentId={currentId}
          setCurrentId={(id) => setCurrentId(id)}
          setToggleCode={() => setToggleCode((prev) => !prev)}
        />
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

const FunctionContainer = styled.div`
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
