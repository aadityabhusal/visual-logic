import { IOperation, IValueObject } from "../lib/types";

export function Operation({
  operation,
  handleOperation,
}: {
  operation: IOperation;
  handleOperation: (data: IOperation) => void;
}) {
  return (
    <select
      value={operation.selectedMethod}
      onChange={(e) =>
        handleOperation({
          ...operation,
          selectedMethod: e.target.value as keyof IValueObject,
        })
      }
    >
      {operation.methods.map((method) => (
        <option value={method} key={method}>
          {method}
        </option>
      ))}
    </select>
  );
}
