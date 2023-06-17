import { Code, Plus, X } from "@styled-icons/fa-solid";
import styled from "styled-components";
import { useStore } from "../lib/store";
import { updateOperations } from "../lib/update";
import { createOperation } from "../lib/utils";

export function Sidebar() {
  const {
    operations,
    addOperation,
    setOperation,
    currentId,
    setCurrentId,
    preferences,
    setPreferences,
  } = useStore((state) => state);

  return (
    <SidebarWrapper>
      <SidebarHead>Operations</SidebarHead>
      <SidebarContainer>
        <OperationList>
          {operations.map((item, index) => (
            <OperationListItem
              key={item.id}
              onClick={() => setCurrentId(item.id)}
              selected={item.id === currentId}
            >
              <span>{item.name}</span>
              <X
                title="Delete operation"
                size={8}
                onClick={(e) => {
                  e.stopPropagation();
                  setOperation(updateOperations(operations, item, true));
                }}
              />
            </OperationListItem>
          ))}
        </OperationList>
      </SidebarContainer>
      <SidebarFooter>
        <Button
          title="View Code"
          onClick={() =>
            setPreferences({ codeDisplay: !preferences.codeDisplay })
          }
        >
          <Code size={12} /> <span>Code</span>
        </Button>
        <Button
          title="Add a new operation"
          onClick={() =>
            addOperation(createOperation({ name: "", isGeneric: true }))
          }
        >
          <Plus size={12} /> <span>Operation</span>
        </Button>
      </SidebarFooter>
    </SidebarWrapper>
  );
}

const SidebarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: auto;
  width: 12rem;
`;

const SidebarHead = styled.div`
  padding: 0.25rem;
`;

const SidebarContainer = styled.div`
  flex: 1;
  border: 1px solid ${({ theme }) => theme.color.border};
  padding: 0.2rem;
  border-width: 1px 0 1px 0;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.background.dropdown.scrollbar};
  }
`;

const OperationList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const OperationListItem = styled.li<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 0.25rem;
  background-color: ${({ selected, theme }) =>
    selected ? theme.background.dropdown.hover : theme.background.editor};

  &:hover {
    background-color: ${({ theme }) => theme.background.dropdown.hover};
  }

  & span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  & svg {
    flex-shrink: 0;
  }
`;

const SidebarFooter = styled.div`
  padding: 0.25rem;
  display: flex;
  justify-content: space-between;
`;

const Button = styled.button`
  padding: 0.3rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  color: ${({ theme }) => theme.color.white};
  border: none;
  background-color: ${({ theme }) => theme.background.dropdown.selected}95;
  &:hover {
    background-color: ${({ theme }) => theme.background.dropdown.selected};
  }
`;
