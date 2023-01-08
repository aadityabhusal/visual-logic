import styled from "styled-components";
import { IData } from "../../lib/types";

export interface IBooleanInput {
  data: IData;
  handleData: (data: IData) => void;
}
export function BooleanInput({ data, handleData }: IBooleanInput) {
  return (
    <BooleanContainer>
      <input
        type="checkbox"
        checked={data.value as boolean}
        onChange={(e) =>
          handleData({
            ...data,
            value: e.target.checked,
          })
        }
      />
    </BooleanContainer>
  );
}

const BooleanContainer = styled.div`
  display: flex;
  align-items: center;
`;
