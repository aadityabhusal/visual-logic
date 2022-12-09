import { Func } from "./components/Function";
import { useStore } from "./lib/store";

function App() {
  const [func, setFunc] = useStore((state) => [
    state.functions,
    state.setFunction,
  ]);
  return (
    <div>
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>
        Visual Logic
      </h1>
      {Object.entries(func).map(([key, value]) => (
        <Func
          key={key}
          funcData={value}
          handleFunc={(fn) => setFunc(key, fn)}
        />
      ))}
    </div>
  );
}

export default App;
