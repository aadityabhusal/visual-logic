import styled from "styled-components";
import { theme } from "../../lib/theme";
import { IData } from "../../lib/types";
import { parseData } from "../../lib/utils";

export function ParseData({ data }: { data: IData }) {
  return (
    <Data type={data.type} variable={data.name}>
      {data.name || parseData(data)}
    </Data>
  );
}

const Data = styled.div<{
  type: keyof typeof theme["color"];
  variable?: string;
}>`
  color: ${({ type, variable }) =>
    theme.color[variable ? "variable" : type] || "white"};
`;
