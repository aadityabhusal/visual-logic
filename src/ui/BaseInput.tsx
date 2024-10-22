import { useUncontrolled } from "@mantine/hooks";
import { forwardRef, InputHTMLAttributes, useState } from "react";

export const BaseInput = forwardRef<
  HTMLInputElement,
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "defaultValue" | "onChange"
  > & {
    value?: string;
    defaultValue?: string;
    containerClassName?: string;
    onChange?: (change: string) => void;
  }
>(
  (
    {
      value,
      defaultValue,
      className,
      onChange,
      containerClassName,
      ...inputProps
    },
    ref
  ) => {
    const [textWidth, setTextWidth] = useState(0);
    const [inputValue, setInputValue] = useUncontrolled({
      value,
      defaultValue,
      onChange,
    });

    return (
      <div className={`relative flex flex-col py-0 ${containerClassName}`}>
        <div
          className="self-start h-0 overflow-hidden whitespace-pre"
          ref={(elem) => setTextWidth(elem?.clientWidth || 7)}
        >
          {inputValue}
        </div>
        <input
          ref={ref}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className={`outline-none bg-inherit border-none p-0 number-input ${
            className || ""
          }`}
          style={textWidth ? { width: textWidth } : {}}
          {...inputProps}
        />
      </div>
    );
  }
);

BaseInput.displayName = "BaseInput";
