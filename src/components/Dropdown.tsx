import { ChevronDown, Equals, Play, X } from "@styled-icons/fa-solid";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useStore } from "../lib/store";
import { theme } from "../lib/theme";
import { getPosition } from "../lib/utils";

export function Dropdown() {
  const dropdown = useStore((state) => state.dropdown);
  const setDropdown = useStore((state) => state.setDropdown);
  const [showOptions, setShowOptions] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [hasVariable, setHasVariable] = useState(
    dropdown.data?.variable !== undefined
  );

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
            onClick={() => {
              setHasVariable((prev) => !prev);
              dropdown.toggleVariable?.(hasVariable);
            }}
            color={theme.color[hasVariable ? "variable" : "white"]}
          />
        ) : null}
        {dropdown.addMethod ? (
          <Play size={10} onClick={dropdown.addMethod} />
        ) : null}
        {dropdown.handleDelete ? (
          <X size={10} onClick={() => dropdown.handleDelete?.()} />
        ) : null}
        {dropdown.options ? (
          <ChevronDown
            size={10}
            className="dropdownIcon"
            onClick={(e) => setShowOptions((prev) => !prev)}
          />
        ) : null}
      </DropdownHead>
    </DropdownWrapper>
  );
}

const DropdownWrapper = styled.div<{
  position?: { top: number; left: number };
  show: boolean;
}>`
  position: absolute;
  z-index: 10;
  top: ${({ position }) => position?.top}px;
  left: ${({ position }) => position?.left}px;
  display: ${({ show }) => (show ? "flex" : "none")};
  flex-direction: column;
`;

const DropdownHead = styled.div`
  display: flex;
  align-items: center;
  background-color: ${theme.background.dropdown.default};
  border: 1px solid ${theme.color.border};
  & > svg {
    padding: 0 0.1rem;
    cursor: pointer;
  }
`;
