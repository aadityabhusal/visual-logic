import { IOperation } from "../lib/types";

export function Operation({ operation }: { operation: IOperation }) {
  return (
    <select>
      {operation.methods.map((operation) => (
        <option value={operation.name}>{operation.name}</option>
      ))}
    </select>
  );
}
