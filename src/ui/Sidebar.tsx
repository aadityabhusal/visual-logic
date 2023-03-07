import { Plus } from "@styled-icons/fa-solid";
import styled from "styled-components";
import { theme } from "../lib/theme";

export function Sidebar() {
  return (
    <SidebarWrapper>
      <SidebarHead>Functions</SidebarHead>
      <SidebarContainer></SidebarContainer>
      <SidebarFooter>
        <Button>
          <Plus size={12} /> <span>Function</span>
        </Button>
      </SidebarFooter>
    </SidebarWrapper>
  );
}

const SidebarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: auto;
  border-left: 1px solid ${theme.color.border};
  max-width: 200px;
`;

const SidebarHead = styled.div`
  padding: 0.25rem;
`;

const SidebarContainer = styled.div`
  flex: 1;
  border: 1px solid ${theme.color.border};
  padding: 0.5rem;
  border-width: 1px 0 1px 0;
`;

const SidebarFooter = styled.div`
  padding: 0.25rem;
`;

const Button = styled.button`
  padding: 0.3rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  color: ${theme.color.white};
  border: none;
  background-color: ${theme.background.dropdown.selected}95;
  &:hover {
    background-color: ${theme.background.dropdown.selected};
  }
`;
