import { Func } from "./components/Function";
import { useStore } from "./lib/store";
import { createFunction } from "./lib/utils";

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
      {func.map((value, i) => (
        <Func
          key={i}
          func={value}
          handleFunc={(fn) => setFunc(fn, i)}
          context={createFunction()}
        />
      ))}
    </div>
  );
}

export default App;
