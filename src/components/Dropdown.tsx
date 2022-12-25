import { Equals, Play, X } from "@styled-icons/fa-solid";
import { useEffect, useRef } from "react";
import styled from "styled-components";
import { useStore } from "../lib/store";
import { theme } from "../lib/theme";
import { getPosition } from "../lib/utils";

export function Dropdown() {
  const dropdown = useStore((state) => state.dropdown);
  const setDropdown = useStore((state) => state.setDropdown);
  const ref = useRef<HTMLDivElement>(null);
  const hasVariable = dropdown.data?.variable !== undefined;

  useEffect(() => {
    function clickHandler(e: MouseEvent) {
      setDropdown({
        display: Boolean(
          ref.current?.contains(e.target as Node) ||
            dropdown.targetRef?.current?.contains(e.target as Node)
        ),
        position: getPosition(dropdown.targetRef?.current),
      });
    }
    if (dropdown) document.addEventListener("click", clickHandler);
    else document.removeEventListener("click", clickHandler);
    return () => {
      document.removeEventListener("click", clickHandler);
    };
  }, [dropdown.display, dropdown.targetRef]);

  return (
    <DropdownWrapper
      ref={ref}
      position={dropdown.position}
      show={dropdown.display}
    >
      <DropdownHead>
        {dropdown.toggleVariable ? (
          <Equals
            size={10}
            onClick={() =>
              dropdown.data &&
              dropdown.toggleVariable?.(dropdown.data, hasVariable)
            }
            color={theme.color[hasVariable ? "variable" : "white"]}
          />
        ) : null}
        {dropdown.addMethod ? (
          <Play size={10} onClick={dropdown.addMethod} />
        ) : null}
        {dropdown.handleDelete ? (
          <X size={10} onClick={() => dropdown.handleDelete?.()} />
        ) : null}
      </DropdownHead>
      {dropdown.options?.length ? (
        <DropdownOptions>
          {dropdown.options?.map((option, index) => (
            <DropdownOption
              key={index}
              onClick={(e) => {
                dropdown.data && dropdown.selectOption?.(option, dropdown.data);
              }}
              selected={
                option.id ===
                dropdown.data?.[
                  dropdown.data?.referenceId ? "referenceId" : "type"
                ]
              }
            >
              {option.name}
            </DropdownOption>
          ))}
        </DropdownOptions>
      ) : (
        <DropdownOption>No Options</DropdownOption>
      )}
    </DropdownWrapper>
  );
}

const DropdownWrapper = styled.div<{
  position?: { top: number; left: number };
  show: boolean;
}>`
  position: absolute;
  z-index: 10;
  border: 1px solid ${theme.color.border};
  top: ${({ position }) => position?.top}px;
  left: ${({ position }) => position?.left}px;
  display: ${({ show }) => (show ? "flex" : "none")};
  flex-direction: column;
`;

const DropdownHead = styled.div`
  display: flex;
  align-items: center;
  background-color: ${theme.background.dropdown.default};
  border-bottom: 1px solid ${theme.color.border};
  & > svg {
    padding: 0 0.1rem;
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
