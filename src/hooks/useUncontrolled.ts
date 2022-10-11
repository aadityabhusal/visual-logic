import { useState } from "react";

interface IProps<T> {
  value?: T;
  defaultValue?: T;
  onChange?(value: T): void;
}

export function useUncontrolled<T>({
  value,
  defaultValue,
  onChange = () => {},
}: IProps<T>): [T, (value: T) => void] {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  const handleUncontrolledChange = (val: T) => {
    setUncontrolledValue(val);
    onChange?.(val);
  };

  if (value !== undefined) return [value as T, onChange];
  return [uncontrolledValue as T, handleUncontrolledChange];
}
