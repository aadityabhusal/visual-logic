import styled from "styled-components";

export const Reserved = styled.span`
  color: ${({ theme }) => theme.color.reserved};
`;

export const Variable = styled.span`
  color: ${({ theme }) => theme.color.variable};
`;

export const Method = styled.span`
  color: ${({ theme }) => theme.color.method};
`;

export const Namespace = styled.span`
  color: ${({ theme }) => theme.color.type};
`;
