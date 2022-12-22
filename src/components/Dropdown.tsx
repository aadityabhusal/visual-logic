import { ChevronDown, X } from "@styled-icons/fa-solid";
import { ReactNode, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useUncontrolled } from "../hooks/useUncontrolled";
import { theme } from "../lib/theme";

interface IProps {
  display?: boolean;
  setDisplay?: React.Dispatch<React.SetStateAction<boolean>>;
  head?: ReactNode;
  hoverContent?: ReactNode;
  children?: ReactNode;
  handleDelete?: () => void;
}

export function Dropdown({
  display,
  setDisplay,
  head,
  hoverContent,
  children,
  handleDelete,
}: IProps) {
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
        <div style={{ display: "flex", alignItems: "center" }}>{head}</div>
        {mouseover ? (
          <DropdownHeadBottom>
            <div>{hoverContent}</div>
            <ChevronDown
              size={10}
              className="dropdownIcon"
              onClick={(e) => {
                e.stopPropagation();
                setDropdown(!dropdown);
              }}
            />
            {handleDelete && <X size={10} onClick={() => handleDelete()} />}
          </DropdownHeadBottom>
        ) : null}
      </DropdownHead>
      {dropdown ? <DropdownContainer>{children}</DropdownContainer> : null}
    </DropdownWrapper>
  );
}

const DropdownWrapper = styled.div<{ mouseover: boolean }>`
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
  align-items: center;
  z-index: 1;
  gap: 0.25rem;
  border: 1px solid #ddd;
  background-color: #444;
  & > div {
    display: flex;
    flex: 1;
    gap: 0.25rem;
  }
  & svg {
    cursor: pointer;
  }
`;
