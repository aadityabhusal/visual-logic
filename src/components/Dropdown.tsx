import { ChevronDown } from "@styled-icons/fa-solid";
import { ReactNode, useEffect, useRef, useState } from "react";
import styled from "styled-components";

interface IProps {
  display?: boolean;
  setDisplay?: React.Dispatch<React.SetStateAction<boolean>>;
  children: ReactNode;
}

export function Dropdown({ display, setDisplay, children }: IProps) {
  const [dropdown, setDropdown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  function handleDisplay() {
    if (setDisplay) setDisplay((d) => !d);
    else setDropdown((d) => !d);
  }

  useEffect(() => {
    if (setDisplay) setDisplay(Boolean(display));
    else setDropdown(Boolean(display));
  }, [display]);

  useEffect(() => {
    function clickHandler(e: MouseEvent) {
      let value = Boolean(ref.current?.contains(e.target as Node));
      if (setDisplay) setDisplay(value);
      else setDropdown(value);
    }

    if (display || dropdown) document.addEventListener("click", clickHandler);
    else document.removeEventListener("click", clickHandler);

    return () => {
      document.removeEventListener("click", clickHandler);
    };
  }, [display, dropdown]);

  return (
    <DropdownWrapper ref={ref}>
      <ChevronDown size={16} onClick={handleDisplay} />
      {display || dropdown ? (
        <DropdownContainer>{children}</DropdownContainer>
      ) : null}
    </DropdownWrapper>
  );
}

const DropdownWrapper = styled.div`
  position: relative;
  z-index: 2;
`;

const DropdownContainer = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
`;
