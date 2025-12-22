import { Context, ErrorType, IData } from "@/lib/types";
import { forwardRef, HTMLAttributes } from "react";
import { FaCircleExclamation } from "react-icons/fa6";
import { BaseInput } from "./BaseInput";

export interface ErrorInputProps extends HTMLAttributes<HTMLInputElement> {
  data: IData<ErrorType>;
  handleData: (data: IData<ErrorType>) => void;
  context: Context;
}

export const ErrorInput = forwardRef<HTMLInputElement, ErrorInputProps>(
  ({ data, handleData, context: _context, ...props }, ref) => {
    // TODO: Dropdown icon selector for error type
    return (
      <BaseInput
        ref={ref}
        {...props}
        type="text"
        leftSection={<FaCircleExclamation className="text-error" />}
        defaultValue={data.value.reason}
        value={data.value.reason}
        onChange={(value) =>
          handleData({ ...data, value: { reason: value.toString() } })
        }
      />
    );
  }
);

ErrorInput.displayName = "ErrorInput";
