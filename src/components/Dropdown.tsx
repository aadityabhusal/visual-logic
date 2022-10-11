import { ChevronDown } from "@styled-icons/fa-solid";
import { ReactNode, useEffect, useRef } from "react";
import styled from "styled-components";
import { useUncontrolled } from "../hooks/useUncontrolled";

interface IProps {
  value?: string;
  display?: boolean;
  setDisplay?: React.Dispatch<React.SetStateAction<boolean>>;
  children: ReactNode;
}

export function Dropdown({ value, display, setDisplay, children }: IProps) {
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
      <div onClick={() => setDropdown((d) => !d)}>
        {value ? <span>{value}</span> : null}
        <ChevronDown size={10} />
      </div>
      {dropdown ? <DropdownContainer>{children}</DropdownContainer> : null}
    </DropdownWrapper>
  );
}

const DropdownWrapper = styled.div`
  z-index: 2;
  & > svg {
    padding: 0 0.1rem;
  }
`;

const DropdownContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
`;
