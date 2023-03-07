import styled from "styled-components";
import { theme } from "../lib/theme";

export function Header() {
  return (
    <HeaderWrapper>
      <h1>Visual Logic</h1>
    </HeaderWrapper>
  );
}

const HeaderWrapper = styled.div`
  border-bottom: 1px solid ${theme.color.border};
  padding: 0 0.5rem;
`;