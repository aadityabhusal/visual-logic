import { ChevronDown, Equals, Play, X } from "@styled-icons/fa-solid";
import { ReactNode, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { theme } from "../lib/theme";

interface IProps {
  head?: ReactNode;
  children?: ReactNode;
  handleDelete?: () => void;
  handleVariable?: (remove: boolean) => void;
  handleMethod?: () => void;
  data: {
    variable?: string;
  };
}

export function Dropdown({
  head,
  children,
  handleMethod,
  handleDelete,
  handleVariable,
  data,
}: IProps) {
  const [display, setDisplay] = useState(false);
  const [content, setContent] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasVariable = data.variable !== undefined;

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
      style={{ zIndex: display ? (content ? 101 : 100) : 99 }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>{head}</div>
      {display ? (
        <DropdownHeadBottom onClick={(e) => setContent((c) => !c)}>
          {handleVariable ? (
            <Equals
              size={10}
              onClick={(e) => {
                e.stopPropagation();
                handleVariable?.(hasVariable);
              }}
              color={theme.color[hasVariable ? "variable" : "white"]}
            />
          ) : null}
          {handleMethod ? (
            <Play
              size={10}
              onClick={(e) => {
                e.stopPropagation();
                handleMethod();
              }}
            />
          ) : null}
          {handleDelete && (
            <X
              size={10}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            />
          )}
          <ChevronDown size={10} style={{ marginLeft: "auto" }} />
        </DropdownHeadBottom>
      ) : null}
      {content ? <DropdownContainer>{children}</DropdownContainer> : null}
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
`;

const DropdownHead = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  & > svg {
    padding: 0 0.1rem;
  }
`;

const DropdownHeadBottom = styled.div`
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
