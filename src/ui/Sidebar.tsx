import { Code, Plus, X } from "@styled-icons/fa-solid";
import styled from "styled-components";
import { useStore } from "../lib/store";
import { theme } from "../lib/theme";

export function Sidebar({
  currentId,
  setCurrentId,
  setToggleCode,
}: {
  currentId?: string;
  setCurrentId: (id: string) => void;
  setToggleCode: () => void;
}) {
  const [functions, addFunction, removeFunction] = useStore((state) => [
    state.functions,
    state.addFunction,
    state.removeFunction,
  ]);

  return (
    <SidebarWrapper>
      <SidebarHead>Functions</SidebarHead>
      <SidebarContainer>
        <FunctionList>
          {functions.map((value) => (
            <FunctionListItem
              key={value.id}
              onClick={() => setCurrentId(value.id)}
              selected={value.id === currentId}
            >
              <span>{value.name}</span>
              <X
                title="Delete function"
                size={8}
                onClick={(e) => {
                  e.stopPropagation();
                  removeFunction(value.id);
                }}
              />
            </FunctionListItem>
          ))}
        </FunctionList>
      </SidebarContainer>
      <SidebarFooter>
        <Button title="View Code" onClick={setToggleCode}>
          <Code size={12} /> <span>Code</span>
        </Button>
        <Button title="Add a new function" onClick={addFunction}>
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
  width: 12rem;
`;

const SidebarHead = styled.div`
  padding: 0.25rem;
`;

const SidebarContainer = styled.div`
  flex: 1;
  border: 1px solid ${theme.color.border};
  padding: 0.2rem;
  border-width: 1px 0 1px 0;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${theme.background.dropdown.scrollbar};
  }
`;

const FunctionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FunctionListItem = styled.li<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 0.25rem;
  background-color: ${({ selected }) =>
    selected ? theme.background.dropdown.hover : theme.background.editor};

  &:hover {
    background-color: ${theme.background.dropdown.hover};
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
  color: ${theme.color.white};
  border: none;
  background-color: ${theme.background.dropdown.selected}95;
  &:hover {
    background-color: ${theme.background.dropdown.selected};
  }
`;