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
    options?: { withQuotes?: boolean };
  }
>(
  (
    { value, defaultValue, onChange, containerClassName, options, ...props },
    ref
  ) => {
    const MAX_WIDTH = 160;
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
          className="self-start h-0 overflow-hidden whitespace-pre max-w-40"
          ref={(elem) => setTextWidth(elem?.clientWidth || 14)}
        >
          {inputValue}
        </div>
        <input
          ref={ref}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={props.type === "number" ? "0" : "..."}
          {...props}
          className={[
            "number-input outline-none bg-inherit border-none p-0",
            props.className,
            textWidth >= MAX_WIDTH ? "truncate" : "",
          ].join(" ")}
          style={{ width: textWidth, ...props.style }}
          onClick={props.onClick}
        />
      </div>
    );
  }
);

BaseInput.displayName = "BaseInput";
