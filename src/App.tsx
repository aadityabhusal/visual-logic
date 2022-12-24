import { Dropdown } from "./components/Dropdown";
import { Func } from "./components/Function";
import { useStore } from "./lib/store";
import { createFunction } from "./lib/utils";

function App() {
  const func = useStore((state) => state.functions);
  const setFunc = useStore((state) => state.setFunction);
  return (
    <div>
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>
        Visual Logic
      </h1>
      {func.map((value, i) => (
        <Func
          key={i}
          funcData={value}
          handleFunc={(fn) => setFunc(fn, i)}
          context={createFunction()}
        />
      ))}
      <Dropdown />
    </div>
  );
}

export default App;
