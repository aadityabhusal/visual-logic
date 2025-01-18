import { FaX } from "react-icons/fa6";
import { IconButton } from "../ui/IconButton";
import { focusStore } from "../lib/store";
import { ErrorBoundary } from "./ErrorBoundary";
import { ParseData } from "./Parse/ParseData";

export function FocusInfo() {
  const { showPopup, result, setFocus } = focusStore();

  const type =
    result?.entityType === "data" ? result?.type : result?.entityType;

  if (!showPopup) return null;
  return (
    <div className="absolute border top-1 right-1 flex flex-col">
      <div className="flex justify-between min-w-60 max-w-96 p-1 border-b">
        <div>Details</div>
        <IconButton
          icon={FaX}
          title="Delete operation"
          size={12}
          onClick={(e) => {
            e.stopPropagation();
            setFocus({ showPopup: false, result: undefined });
          }}
        />
      </div>
      <div className="border-b p-1">
        <span className="text-type">Type: </span>
        <span className={`text-${type}`}>{type}</span>
      </div>
      {result?.entityType === "data" ? (
        <div className="p-1">
          <div className="text-gray-400 mb-1.5">Result</div>
          <ErrorBoundary displayError={true}>
            <pre className="max-w-96 overflow-x-auto dropdown-scrollbar text-wrap">
              <ParseData data={result} showData={true} />
            </pre>
          </ErrorBoundary>
        </div>
      ) : null}
    </div>
  );
}
