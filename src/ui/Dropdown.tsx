import { ChevronDown, Plus, X } from "@styled-icons/fa-solid";
import { ReactNode, useEffect, useRef, useState } from "react";
import styled from "styled-components";
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
    <DropdownWrapper
      ref={ref}
      border={preferenceBorderDisplay || display}
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
        <DropdownHead onClick={() => setContent((c) => !c)}>
          <ChevronDown size={9} />
          {addMethod && (
            <Plus
              size={9}
              onClick={(e) => {
                e.stopPropagation();
                addMethod();
              }}
            />
          )}
          {handleDelete && (
            <X
              size={9}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              style={{ marginLeft: "auto" }}
            />
          )}
        </DropdownHead>
      ) : null}
      {content ? (
        <DropdownContainer onClick={() => setContent(false)}>
          {children}
        </DropdownContainer>
      ) : display ? (
        <DropdownContainer>
          <DataType>
            {result.type ||
              (result?.data?.entityType === "data"
                ? result.data?.type
                : result.data?.entityType)}
          </DataType>
          {result.data?.entityType === "data" && !hideResultValue ? (
            <ErrorBoundary displayError={true}>
              <pre>
                <ParseData data={result.data} showData={true} />
              </pre>
            </ErrorBoundary>
          ) : null}
        </DropdownContainer>
      ) : null}
    </DropdownWrapper>
  );
}

const DropdownWrapper = styled.div<{ border: boolean }>`
  position: relative;
  background-color: ${({ theme }) => theme.background.editor};
  border: 1px solid
    ${({ border, theme }) => (border ? theme.color.border : "transparent")};
`;

const DropdownContainer = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  left: -1px;
  min-width: 100%;
  border: 1px solid ${({ theme }) => theme.color.border};
  background-color: ${({ theme }) => theme.background.dropdown.default};
  max-height: 7rem;
  overflow-y: auto;
  overflow-x: hidden;
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.background.dropdown.scrollbar};
  }
`;

const DropdownHead = styled.div`
  position: absolute;
  top: 100%;
  left: -1px;
  min-width: 100%;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border: 1px solid ${({ theme }) => theme.color.border};
  background-color: ${({ theme }) => theme.background.dropdown.default};
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }) => theme.background.dropdown.hover};
  }
  & > div {
    display: flex;
    flex: 1;
    gap: 0.25rem;
  }
  & svg {
    cursor: pointer;
  }
`;

export const DropdownOptions = styled.div`
  cursor: pointer;
  background-color: ${({ theme }) => theme.background.dropdown.default};
  color: ${({ theme }) => theme.color.white};
`;

export const DropdownOption = styled.div<{ selected?: boolean }>`
  font-size: 0.8rem;
  padding: 0.1rem 0.2rem;
  background-color: ${({ selected, theme }) =>
    selected ? theme.background.dropdown.selected : "inherit"};
  &:hover {
    background-color: ${({ theme }) => theme.background.dropdown.hover};
  }
`;

const DataType = styled.div`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.color.type};
  & ~ pre {
    border-top: 1px solid ${({ theme }) => theme.color.border};
  }
`;
