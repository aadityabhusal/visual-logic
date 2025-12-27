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
import { IData, OperationType } from "@/lib/types";
import {
  createFileFromOperation,
  createFileVariables,
  createOperationFromFile,
} from "@/lib/utils";
import { getOperationEntities } from "@/lib/navigation";
import { updateFiles } from "@/lib/update";

export default function Project() {
  const [searchParams] = useSearchParams();
  const { getCurrentProject, deleteFile, updateProject } = useProjectStore();
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
        updateProject(currentProject.id, {
          files: updateFiles(
            currentProject.files,
            createFileFromOperation(operation)
          ),
        });
      }
    },
    [currentProject, updateProject, deleteFile]
  );

  useEffect(() => {
    if (currentOperation) {
      setUiConfig({
        navigationEntities: getOperationEntities(currentOperation, 0),
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
        {!hideSidebar && <Sidebar />}
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
                variables: createFileVariables(
                  currentProject?.files,
                  currentOperation?.id
                ),
              }}
              options={{ isTopLevel: true, disableDropdown: true }}
            />
          ) : (
            <NoteText>Select an operation</NoteText>
          )}
          {!hideFocusInfo && <FocusInfo />}
        </div>
      </div>
    </div>
  );
}
