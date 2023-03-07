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
  return (
    <AppWrapper>
      <Header />
      <AppContainer>
        <FunctionContainer>
          {func.map((value, i) => (
            <Func key={i} func={value} handleFunc={(fn) => setFunc(fn, i)} />
          ))}
        </FunctionContainer>
        <Sidebar />
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
