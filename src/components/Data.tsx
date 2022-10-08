import { IData } from "../lib/types";

export function Data({
  data,
  handleData,
}: {
  data: IData;
  handleData: (data: IData) => void;
}) {
  return (
    <input
      type="text"
      placeholder="Enter here value here"
      value={data.value}
      onChange={(e) => handleData({ ...data, value: e.target.value })}
    />
  );
}
