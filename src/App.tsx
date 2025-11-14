import { Operation } from "./components/Operation";
import { ParseOperation } from "./components/Parse/ParseOperation";
import { uiConfigStore, operationsStore } from "./lib/store";
import { Header } from "./ui/Header";
import { Sidebar } from "./ui/Sidebar";
import { NoteText } from "./ui/NoteText";
import { updateOperations } from "./lib/update";
import { useEffect } from "react";
import { visitCount } from "./lib/services";
import { useHotkeys } from "@mantine/hooks";
import {
  ActionIcon,
  createTheme,
  HeadlessMantineProvider,
  Tooltip,
} from "@mantine/core";
import { FocusInfo } from "./components/FocusInfo";
import { useSearchParams } from "react-router";
import { IData, OperationType } from "./lib/types";
import { createStatement } from "./lib/utils";

const theme = createTheme({
  scale: 1,
  components: {
    Tooltip: Tooltip.extend({
      classNames: {
        tooltip: "absolute bg-dropdown-default px-2 py-1 rounded-md text-xs",
      },
    }),
    ActionIcon: ActionIcon.extend({
      classNames: {
        root: "focus:outline focus:outline-1 focus:outline-white hover:opacity-90 disabled:text-disabled",
      },
    }),
  },
});

function App() {
  const [searchParams] = useSearchParams();
  const { operations, setOperation } = operationsStore();
  const { displayCode, hideSidebar } = uiConfigStore();
  const { undo, redo } = operationsStore.temporal.getState();

  const currentOperation = operations.find(
    (operation) => operation.id === searchParams.get("operationId")
  );

  useHotkeys([
    ["meta+shift+z", () => redo()],
    ["meta+z", () => undo()],
    ["meta+y", () => redo()],
  ]);

  useEffect(() => {
    if (window.location.hostname !== "localhost") visitCount();
  }, []);

  return (
    <HeadlessMantineProvider theme={theme}>
      <div className="flex flex-col h-screen">
        <Header currentOperation={currentOperation} />
        <div className="flex flex-1 min-h-0 relative">
          {!hideSidebar && <Sidebar />}
          <div className={"p-1 flex-1 overflow-y-auto scroll"}>
            {currentOperation ? (
              <Operation
                operation={currentOperation}
                handleChange={(operation: IData<OperationType>) =>
                  setOperation(updateOperations(operations, operation))
                }
                prevStatements={operations
                  .filter((operation) => operation.id !== currentOperation.id)
                  .map((operation) =>
                    createStatement({
                      data: operation,
                      name: operation.value.name,
                      id: operation.id,
                    })
                  )}
                options={{ isTopLevel: true, disableDropdown: true }}
              />
            ) : (
              <NoteText>Select an operation</NoteText>
            )}
            <FocusInfo />
          </div>
          {displayCode && currentOperation ? (
            <div className={"p-1 flex-1 overflow-y-auto scroll border-l"}>
              <NoteText border italic>
                In-progress and preview-only.
              </NoteText>
              <pre>
                <ParseOperation operation={currentOperation} />
              </pre>
            </div>
          ) : null}
        </div>
      </div>
    </HeadlessMantineProvider>
  );
}

export default App;
