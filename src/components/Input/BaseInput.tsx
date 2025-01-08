import { useUncontrolled } from "@mantine/hooks";
import { forwardRef, InputHTMLAttributes, useState } from "react";
import { theme } from "../../lib/theme";

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
    options?: { withQuotes?: boolean };
  }
>(
  (
    {
      value,
      defaultValue,
      className = "",
      onChange,
      containerClassName,
      options,
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
      <div
        className={`relative flex flex-col py-0 ${
          options?.withQuotes ? "px-[7px] input-quotes" : "px-0"
        } ${containerClassName}`}
      >
        <div
          className="self-start h-0 overflow-hidden whitespace-pre"
          ref={(elem) => setTextWidth(elem?.clientWidth || 12)}
        >
          {inputValue}
        </div>
        <input
          ref={ref}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className={`number-input outline-none bg-inherit border-none p-0 ${className}`}
          style={textWidth ? { width: textWidth } : {}}
          placeholder={inputProps.type === "number" ? "0" : "..."}
          {...inputProps}
        />
      </div>
    );
  }
);

BaseInput.displayName = "BaseInput";
