import { useState } from "react";
import styled from "styled-components";
import { Func } from "./components/Function";
import { useStore } from "./lib/store";
import { Header } from "./ui/Header";
import { Sidebar } from "./ui/Sidebar";

function App() {
  const [func, setFunc] = useStore((state) => [
    state.functions,
    state.setFunction,
  ]);
  const [currentId, setCurrentId] = useState<string>();
  const currentFunction = func.find((item) => item.id === currentId);
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
        <Sidebar
          currentId={currentId}
          setCurrentId={(id) => setCurrentId(id)}
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
`;

const FunctionContainer = styled.div`
  padding: 0.5rem;
`;

export default App;
