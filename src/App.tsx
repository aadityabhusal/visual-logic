import { Operation } from "./components/Operation";
import { ParseOperation } from "./components/Parse/ParseOperation";
import { uiConfigStore, useStore } from "./lib/store";
import { Header } from "./ui/Header";
import { Sidebar } from "./ui/Sidebar";
import { NoteText } from "./ui/NoteText";
import { updateOperations } from "./lib/update";
import { useEffect } from "react";
import { visitCount } from "./lib/services";
import { useHotkeys } from "@mantine/hooks";

function App() {
  const { operations, setOperation } = useStore();
  const { displayCode, hideSidebar, selectedOperationId, setUiConfig } =
    uiConfigStore((s) => ({
      displayCode: s.displayCode,
      hideSidebar: s.hideSidebar,
      selectedOperationId: s.selectedOperationId,
      setUiConfig: s.setUiConfig,
    }));
  const { undo, redo } = useStore.temporal.getState();

  const currentOperationIndex = operations.findIndex(
    (item) => item.id === selectedOperationId
  );
  const currentOperation = operations[currentOperationIndex];

  useHotkeys([
    ["meta+shift+z", () => redo()],
    ["meta+z", () => undo()],
    ["meta+y", () => redo()],
  ]);

  useEffect(() => {
    if (!selectedOperationId && operations[0]) {
      setUiConfig({ selectedOperationId: operations[0]?.id });
    }
  });

  useEffect(() => {
    if (window.location.hostname !== "localhost") visitCount();
  }, []);

  const operationContainerClassNames =
    "p-1 pb-[25%] flex-1 overflow-y-auto scroll border-r border-solid border-border";

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 min-h-0">
        <div className={operationContainerClassNames}>
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
        </div>
        {displayCode && currentOperation ? (
          <div className={operationContainerClassNames}>
            <NoteText border italic>
              In-progress and preview-only.
            </NoteText>
            <pre>
              <ParseOperation operation={currentOperation} />
            </pre>
          </div>
        ) : null}
        {!hideSidebar && <Sidebar />}
      </div>
    </div>
  );
}

export default App;
