import { useState } from "react";
import { Func } from "./components/Function";
import { IFunction } from "./lib/types";
import { createFunction } from "./lib/utils";

function App() {
  const [func, handleFunc] = useState<IFunction>(createFunction());
  return (
    <div>
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>
        Visual Logic
      </h1>
      <Func func={func} handleFunc={handleFunc} />
    </div>
  );
}

export default App;
