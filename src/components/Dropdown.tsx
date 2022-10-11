import { ChevronDown } from "@styled-icons/fa-solid";
import { ReactNode, useEffect, useRef } from "react";
import styled from "styled-components";
import { useUncontrolled } from "../hooks/useUncontrolled";

interface IProps {
  display?: boolean;
  setDisplay?: React.Dispatch<React.SetStateAction<boolean>>;
  children: ReactNode;
}

export function Dropdown({ display, setDisplay, children }: IProps) {
  const [dropdown, setDropdown] = useUncontrolled({
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
      <ChevronDown size={10} onClick={() => setDropdown((d) => !d)} />
      {dropdown ? <DropdownContainer>{children}</DropdownContainer> : null}
    </DropdownWrapper>
  );
}

const DropdownWrapper = styled.div`
  position: relative;
  z-index: 2;
  & > svg {
    padding: 0 0.1rem;
  }
`;

const DropdownContainer = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
`;
