import { ChevronDown } from "@styled-icons/fa-solid";
import { ReactNode, useEffect, useRef, useState } from "react";
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
  const [mouseover, setMouseover] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function clickHandler(e: MouseEvent) {
      setDropdown(Boolean(ref.current?.contains(e.target as Node)));
    }

    if (dropdown) document.addEventListener("click", clickHandler);
    else document.removeEventListener("click", clickHandler);
    setMouseover(dropdown);

    return () => {
      document.removeEventListener("click", clickHandler);
    };
  }, [dropdown]);

  return (
    <DropdownWrapper mouseover={mouseover} ref={ref}>
      <DropdownHead
        onMouseOver={(e) => {
          e.stopPropagation();
          setMouseover(true);
        }}
        onMouseOut={(e) => {
          e.stopPropagation();
          setMouseover(dropdown);
        }}
      >
        <div style={{ display: "flex" }}>{head}</div>
        {mouseover ? (
          <DropdownHeadBottom
            onClick={(e) => {
              e.stopPropagation();
              setDropdown(!dropdown);
            }}
          >
            <div />
            <ChevronDown size={10} className="dropdownIcon" />
          </DropdownHeadBottom>
        ) : null}
      </DropdownHead>
      {dropdown ? <DropdownContainer>{children}</DropdownContainer> : null}
    </DropdownWrapper>
  );
}

const DropdownWrapper = styled.div<{ mouseover: boolean }>`
  z-index: 2;
  border: 1px solid ${({ mouseover }) => (mouseover ? "#ddd" : "transparent")};
`;

const DropdownContainer = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  left: -1px;
  min-width: 100%;
  border: 1px solid #444;
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
  justify-content: space-between;
  border: 1px solid #ddd;
  background-color: #444;
`;
