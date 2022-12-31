import { ChevronDown, R, X } from "@styled-icons/fa-solid";
import { ReactNode, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { theme } from "../lib/theme";
import { IData } from "../lib/types";
import { parseData } from "../lib/utils";

interface IProps {
  head?: ReactNode;
  children?: ReactNode;
  data: { result?: IData };
  handleDelete?: () => void;
}

export function Dropdown({ head, children, data, handleDelete }: IProps) {
  const [display, setDisplay] = useState(false);
  const [content, setContent] = useState(false);
  const [result, setResult] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function clickHandler(e: MouseEvent) {
      if (!Boolean(ref.current?.contains(e.target as Node))) {
        setDisplay(false);
        setContent(false);
        setResult(false);
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
        !content && !result && setDisplay(false);
      }}
      style={{ zIndex: display ? (content ? 1001 : 1000) : 999 }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>{head}</div>
      {display ? (
        <DropdownHead>
          <R
            size={10}
            color={theme.color[result ? "variable" : "white"]}
            onClick={(e) => {
              e.stopPropagation();
              setContent(false);
              setResult((r) => !r);
            }}
          />
          {handleDelete && (
            <X
              size={10}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            />
          )}
          <ChevronDown
            size={10}
            style={{ marginLeft: "auto" }}
            color={theme.color[content ? "variable" : "white"]}
            onClick={(e) => {
              setResult(false);
              setContent((c) => !c);
            }}
          />
        </DropdownHead>
      ) : null}
      {content ? <DropdownContainer>{children}</DropdownContainer> : null}
      {data.result && result && (
        <DropdownContainer>
          <DropdownContainerHead style={{ fontSize: "0.6rem" }}>
            Type: {data.result.type}
          </DropdownContainerHead>
          {parseData(data.result)}
        </DropdownContainer>
      )}
    </DropdownWrapper>
  );
}

const DropdownWrapper = styled.div<{ border: boolean }>`
  position: relative;
  border: 1px solid
    ${({ border }) => (border ? theme.color.border : "transparent")};
`;

const DropdownContainer = styled.div`
  position: absolute;
  top: calc(100% + 11px);
  left: -1px;
  min-width: max-content;
  border: 1px solid ${theme.color.border};
  background-color: ${theme.background.dropdown.default};
`;

const DropdownContainerHead = styled.div`
  font-size: 0.6rem;
  padding: 0.1rem;
  border-bottom: 1px solid ${theme.color.border};
  background-color: ${theme.background.dropdown.default};
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
