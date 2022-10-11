import { ChevronDown } from "@styled-icons/fa-solid";
import { ReactNode, useEffect, useRef, useState } from "react";
import styled from "styled-components";

interface IProps {
  children: ReactNode;
}

export function Dropdown({ children }: IProps) {
  const [dropdown, setDropdown] = useState(false);
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
      <ChevronDown size={16} onClick={() => setDropdown((d) => !d)} />
      {dropdown ? <DropdownContainer>{children}</DropdownContainer> : null}
    </DropdownWrapper>
  );
}

const DropdownWrapper = styled.div`
  position: relative;
`;

const DropdownContainer = styled.div`
  position: relative;
`;
