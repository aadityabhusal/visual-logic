import { Operation } from "@/components/Operation";
import { uiConfigStore, useProjectStore } from "@/lib/store";
import { Header } from "@/ui/Header";
import { Sidebar } from "@/ui/Sidebar";
import { NoteText } from "@/ui/NoteText";
import { useCallback, useEffect, useMemo } from "react";
import { useHotkeys } from "@mantine/hooks";
import { FocusInfo } from "@/components/FocusInfo";
import { useSearchParams, Navigate } from "react-router";
import { useCustomHotkeys } from "@/hooks/useNavigation";
import { Context, IData, OperationType } from "@/lib/types";
import { createOperationFromFile } from "@/lib/utils";
import { getOperationEntities } from "@/lib/navigation";

export default function Project() {
  const [searchParams] = useSearchParams();
  const { getCurrentProject, updateFile, deleteFile } = useProjectStore();
  const { hideSidebar, hideFocusInfo, setUiConfig } = uiConfigStore();

  const currentProject = getCurrentProject();
  const fileName = searchParams.get("file");
  const currentOperation = useMemo(
    () =>
      createOperationFromFile(
        currentProject?.files.find((file) => file.name === fileName)
      ),
    [currentProject?.files, fileName]
  );

  const handleOperationChange = useCallback(
    (operation: IData<OperationType>, remove?: boolean) => {
      if (!currentProject) return;
      if (remove) deleteFile(operation.id);
      else {
        updateFile(operation.id, {
          content: { type: operation.type, value: operation.value },
        });
      }
    },
    [currentProject, updateFile, deleteFile]
  );

  useEffect(() => {
    if (currentOperation) {
      setUiConfig({
        navigationEntities: getOperationEntities(currentOperation),
      });
    }
  }, [currentOperation, setUiConfig]);

  useHotkeys(useCustomHotkeys(currentOperation), []);

  if (!currentProject) return <Navigate to="/" replace />;

  return (
    <div className="flex flex-col h-screen">
      <Header
        currentOperation={currentOperation}
        currentProject={currentProject}
      />
      <div className="flex flex-1 min-h-0 relative">
        {!hideSidebar && <Sidebar projectFiles={currentProject?.files || []} />}
        <div
          className={"p-1 flex-1 overflow-y-auto scroll"}
          onClick={(e) => {
            if (currentOperation?.id && e.target === e.currentTarget) {
              setUiConfig({
                navigation: { id: `${currentOperation.id}_statement_add` },
              });
            }
          }}
        >
          {currentProject && currentOperation ? (
            <Operation
              operation={currentOperation}
              handleChange={handleOperationChange}
              context={{
                variables: currentProject.files.reduce((acc, operationFile) => {
                  const operation = createOperationFromFile(operationFile);
                  if (!operation || operationFile.id === currentOperation?.id) {
                    return acc;
                  }
                  acc.set(operationFile.name, operation);
                  return acc;
                }, new Map() as Context["variables"]),
              }}
              options={{ isTopLevel: true, disableDropdown: true }}
            />
          ) : (
            <NoteText>Select an operation</NoteText>
          )}
          {!hideFocusInfo && <FocusInfo />}
        </div>
        {/* {displayCode && currentOperation ? (
          <div className={"p-1 flex-1 overflow-y-auto scroll border-l"}>
            <NoteText border italic>
              In-progress and preview-only.
            </NoteText>
            <pre>
              <ParseOperation operation={currentOperation} />
            </pre>
          </div>
        ) : null} */}
      </div>
    </div>
  );
}
