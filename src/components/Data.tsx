import { typeToObject } from "../lib/data";
import { IData } from "../lib/types";

export function Data({
  data,
  handleData,
  readOnly,
}: {
  data: IData;
  handleData: (data: IData) => void;
  readOnly?: boolean;
}) {
  const ValueConstructor = typeToObject[typeof data.value];
  return (
    <>
      <input
        type={typeof data.value === "number" ? "number" : "text"}
        placeholder={`Enter ${typeof data.value} here`}
        value={data.value}
        onChange={(e) =>
          handleData({ ...data, value: ValueConstructor(e.target.value) })
        }
        readOnly={readOnly}
        style={{ opacity: readOnly ? 0.9 : 1 }}
      />
      {!readOnly ? (
        <select
          value={typeof data.value}
          onChange={(e) =>
            handleData({
              ...data,
              value: typeToObject[e.target.value](Number(data.value) || ""),
            })
          }
        >
          {Object.keys(typeToObject).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      ) : (
        <input value={typeof data.value} readOnly style={{ opacity: 0.9 }} />
      )}
    </>
  );
}
