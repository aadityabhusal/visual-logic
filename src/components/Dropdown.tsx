import { ChevronDown } from "@styled-icons/fa-solid";
import { ReactNode, useEffect, useRef } from "react";
import styled from "styled-components";
import { useUncontrolled } from "../hooks/useUncontrolled";

interface IProps {
  display?: boolean;
  setDisplay?: React.Dispatch<React.SetStateAction<boolean>>;
  head?: ReactNode;
  children?: ReactNode;
}

export function Dropdown({ display, setDisplay, head, children }: IProps) {
  const [dropdown, setDropdown] = useUncontrolled<boolean>({
    value: display,
    onChange: setDisplay,
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function clickHandler(e: MouseEvent) {
      setDropdown(Boolean(ref.current?.contains(e.target as Node)));
    }

    if (dropdown) document.addEventListener("click", clickHandler);
    else document.removeEventListener("click", clickHandler);

    return () => {
      document.removeEventListener("click", clickHandler);
    };
  }, [dropdown]);

  return (
    <DropdownWrapper ref={ref}>
      <DropdownHead
        dropdown={dropdown}
        onClick={(e) => {
          e.stopPropagation();
          setDropdown(!dropdown);
        }}
      >
        {head}
        <ChevronDown size={10} className="dropdownIcon" />
      </DropdownHead>
      {dropdown ? <DropdownContainer>{children}</DropdownContainer> : null}
    </DropdownWrapper>
  );
}

const DropdownWrapper = styled.div`
  z-index: 2;
  &:hover {
    .dropdownIcon {
      display: block;
    }
  }
`;

const DropdownContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
`;

const DropdownHead = styled.div<{ dropdown: boolean }>`
  display: flex;
  align-items: center;
  & > svg {
    display: ${({ dropdown }) => (dropdown ? "block" : "none")};
    padding: 0 0.1rem;
  }
`;
