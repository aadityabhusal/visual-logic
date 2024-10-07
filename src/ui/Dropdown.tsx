import { FaChevronDown, FaPlus, FaX } from "react-icons/fa6";
import { ReactNode, useEffect, useRef, useState } from "react";
import { IData, IOperation, IType } from "../lib/types";
import { ParseData } from "../components/Parse/ParseData";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { uiConfigStore } from "../lib/store";

interface IProps {
  head?: ReactNode;
  children?: ReactNode;
  result: { data?: IData | IOperation; type?: keyof IType };
  handleDelete?: () => void;
  addMethod?: () => void;
}

export function Dropdown({
  head,
  children,
  result,
  handleDelete,
  addMethod,
}: IProps) {
  const [display, setDisplay] = useState(false);
  const [content, setContent] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { highlightOperation, highlightAll, hideResultValue } = uiConfigStore();

  useEffect(() => {
    function clickHandler(e: MouseEvent) {
      if (!Boolean(ref.current?.contains(e.target as Node))) {
        setDisplay(false);
        setContent(false);
      }
    }
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [display]);

  const preferenceBorderDisplay =
    (highlightOperation && result.data?.entityType === "operation") ||
    highlightAll;

  return (
    <div
      className={
        "relative bg-editor border border-solid " +
        (preferenceBorderDisplay || display
          ? "border-border"
          : "border-transparent")
      }
      ref={ref}
      onMouseOver={(e) => {
        e.stopPropagation();
        children && setDisplay(true);
      }}
      onMouseOut={(e) => {
        e.stopPropagation();
        children && !content && setDisplay(false);
      }}
      style={{ zIndex: content ? 999 : display ? 1000 : "initial" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start" }}>{head}</div>
      {display ? (
        <div
          className="absolute top-full -left-[1px] min-w-full flex items-center gap-1 border border-solid border-border bg-dropdown-default cursor-pointer hover:bg-dropdown-hover [&>svg]:cursor-pointer"
          onClick={() => setContent((c) => !c)}
        >
          <FaChevronDown size={9} />
          {addMethod && (
            <FaPlus
              size={9}
              onClick={(e) => {
                e.stopPropagation();
                addMethod();
              }}
            />
          )}
          {handleDelete && (
            <FaX
              size={9}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              style={{ marginLeft: "auto" }}
            />
          )}
        </div>
      ) : null}
      {content || display ? (
        <div
          className="absolute top-[calc(100%+10px)] -left-[1px] min-w-full border border-solid border-border bg-dropdown-default max-h-28 overflow-y-auto overflow-x-hidden dropdown-scrollbar"
          onClick={content ? () => setContent(false) : undefined}
        >
          {content ? (
            children
          ) : (
            <>
              <div className="text-[0.5rem] text-type">
                {result.type ||
                  (result?.data?.entityType === "data"
                    ? result.data?.type
                    : result.data?.entityType)}
              </div>
              {result.data?.entityType === "data" && !hideResultValue ? (
                <ErrorBoundary displayError={true}>
                  <pre className="border-t border-solid border-border">
                    <ParseData data={result.data} showData={true} />
                  </pre>
                </ErrorBoundary>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
