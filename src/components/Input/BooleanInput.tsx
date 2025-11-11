import { forwardRef } from "react";
import { BooleanType, IData } from "../../lib/types";

export interface IBooleanInput {
  data: IData<BooleanType>;
  handleData: (data: IData<BooleanType>) => void;
  className?: string;
}
export const BooleanInput = forwardRef<HTMLInputElement, IBooleanInput>(
  ({ data, handleData, className }, ref) => {
    return (
      <input
        ref={ref}
        type="checkbox"
        checked={data.value as boolean}
        className={`mt-1 mb-0.5 ${className}`}
        onChange={(e) =>
          handleData({
            ...data,
            value: e.target.checked,
          })
        }
      />
    );
  }
);

BooleanInput.displayName = "BooleanInput";
