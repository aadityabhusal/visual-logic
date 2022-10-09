import { typeToObject } from "../lib/data";
import { IOperation } from "../lib/types";

export function Operation({
  operation,
  handleOperation,
}: {
  operation: IOperation;
  handleOperation: (data: IOperation) => void;
}) {
  return (
    <>
      <select
        value={operation.selectedMethod.name}
        onChange={(e) =>
          handleOperation({
            ...operation,
            selectedMethod:
              operation.methods.find(
                (method) => method.name === e.target.value
              ) || operation.methods[0],
          })
        }
      >
        {operation.methods.map((method) => (
          <option value={method.name} key={method.name}>
            {method.name}
          </option>
        ))}
      </select>
      {operation.selectedMethod.parameters.map((item, i) => (
        <input
          key={i}
          type={typeof item === "number" ? "number" : "text"}
          value={item}
          onChange={(e) => {
            const ValueConstructor = typeToObject[typeof item];
            operation.selectedMethod.parameters[i] = ValueConstructor(
              e.target.value
            );
            handleOperation({
              ...operation,
              selectedMethod: {
                ...operation.selectedMethod,
                parameters: operation.selectedMethod.parameters,
              },
            });
          }}
        ></input>
      ))}
    </>
  );
}
