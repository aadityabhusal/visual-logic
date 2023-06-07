import { Bars } from "@styled-icons/fa-solid";
import styled from "styled-components";

export function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  return (
    <HeaderWrapper>
      <h1>Visual Logic</h1>
      <Bars size={14} style={{ cursor: "pointer" }} onClick={toggleSidebar} />
    </HeaderWrapper>
  );
}

const HeaderWrapper = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
  padding: 0 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
