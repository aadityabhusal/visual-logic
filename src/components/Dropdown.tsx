import { Plus, X } from "@styled-icons/fa-solid";
import { ReactNode, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { theme } from "../lib/theme";
import { IData } from "../lib/types";
import { ParseData } from "./Parse/ParseData";

interface IProps {
  head?: ReactNode;
  children?: ReactNode;
  result: { data: IData };
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

  return (
    <DropdownWrapper
      ref={ref}
      border={display}
      onMouseOver={(e) => {
        e.stopPropagation();
        setDisplay(true);
      }}
      onMouseOut={(e) => {
        e.stopPropagation();
        !content && setDisplay(false);
      }}
      style={{ zIndex: content ? 999 : display ? 1000 : 1 }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>{head}</div>
      {display ? (
        <DropdownHead onClick={() => setContent((c) => !c)}>
          <DropdownReturnType>{result.data.type}</DropdownReturnType>
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
            />
          )}
        </DropdownHead>
      ) : null}
      {content ? (
        <DropdownContainer>{children}</DropdownContainer>
      ) : display ? (
        <DropdownContainer>
          <ParseData data={result.data} showData={true} />
        </DropdownContainer>
      ) : null}
    </DropdownWrapper>
  );
}

const DropdownWrapper = styled.div<{ border: boolean }>`
  position: relative;
  background-color: ${theme.background.editor};
  border: 1px solid
    ${({ border }) => (border ? theme.color.border : "transparent")};
`;

const DropdownContainer = styled.div`
  position: absolute;
  top: calc(100% + 12px);
  left: -1px;
  min-width: 100%;
  border: 1px solid ${theme.color.border};
  background-color: ${theme.background.dropdown.default};
  max-height: 7rem;
  overflow-y: auto;
  overflow-x: hidden;
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${theme.background.dropdown.scrollbar};
  }
`;

const DropdownReturnType = styled.span`
  font-size: 0.7rem;
  margin-right: auto;
  padding-right: 0.5rem;
  color: ${theme.color.type};
`;

const DropdownHead = styled.div`
  position: absolute;
  top: 100%;
  left: -1px;
  min-width: 100%;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border: 1px solid ${theme.color.border};
  background-color: ${theme.background.dropdown.default};
  cursor: pointer;
  &:hover {
    background-color: ${theme.background.dropdown.hover};
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
  background-color: ${theme.background.dropdown.default};
  color: ${theme.color.white};
`;

export const DropdownOption = styled.div<{ selected?: boolean }>`
  font-size: 0.8rem;
  padding: 0.1rem 0.2rem;
  background-color: ${({ selected }) =>
    selected ? theme.background.dropdown.selected : "inherit"};
  &:hover {
    background-color: ${theme.background.dropdown.hover};
  }
`;
