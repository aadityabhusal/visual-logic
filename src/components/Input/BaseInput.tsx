import {
  NumberInput,
  NumberInputProps,
  TextInput,
  TextInputProps,
} from "@mantine/core";
import { useUncontrolled } from "@mantine/hooks";
import { forwardRef, useState } from "react";

interface BaseInputProps<T extends string | number>
  extends Omit<
    TextInputProps & NumberInputProps,
    "value" | "onChange" | "type" | "defaultValue"
  > {
  value?: T;
  onChange?: (change: T) => void;
  defaultValue?: T;
  type?: "text" | "number";
  containerClassName?: string;
  options?: { withQuotes?: boolean };
}

function BaseInputInner<T extends string | number>(
  { type, ...props }: BaseInputProps<T>,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const MAX_WIDTH = 160;
  const [textWidth, setTextWidth] = useState(0);
  const [inputValue, setInputValue] = useUncontrolled({
    value: props.value,
    defaultValue: props.defaultValue,
    onChange: props.onChange,
  });

  const commonProps = {
    value: inputValue,
    classNames: {
      input: [
        "number-input outline-none bg-inherit border-none p-0",
        props.className,
        textWidth >= MAX_WIDTH ? "truncate" : "",
      ].join(" "),
    },
    styles: { input: { width: textWidth, ...props.styles } },
    onClick: props.onClick,
    ...props,
  } as typeof props;

  return (
    <div
      className={`relative flex flex-col py-0 ${
        props.options?.withQuotes ? "px-[7px] input-quotes" : "px-0"
      } ${props.containerClassName}`}
    >
      <div
        className="self-start h-0 overflow-hidden whitespace-pre max-w-40"
        ref={(elem) => setTextWidth(elem?.clientWidth || 14)}
      >
        {inputValue}
      </div>
      {type === "number" ? (
        <NumberInput
          {...commonProps}
          ref={ref}
          onChange={(value) => setInputValue(value as T)}
          placeholder={"0"}
          withKeyboardEvents={false}
          hideControls
        />
      ) : (
        <TextInput
          {...commonProps}
          type="text"
          ref={ref}
          onChange={(e) => setInputValue(e.target.value as T)}
          placeholder={"..."}
        />
      )}
    </div>
  );
}

export const BaseInput = forwardRef(BaseInputInner) as <
  T extends string | number
>(
  props: BaseInputProps<T> & { ref?: React.ForwardedRef<HTMLInputElement> }
) => React.ReactElement | null;

// BaseInput.displayName = "BaseInput";
