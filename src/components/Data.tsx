import { typeToObject } from "../lib/data";
import { IData } from "../lib/types";

export function Data({
  data,
  handleData,
}: {
  data: IData;
  handleData: (data: IData) => void;
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
      />
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
    </>
  );
}
