import { IconButton } from "../ui/IconButton";
import { FaPlus } from "react-icons/fa6";
import { IStatement } from "../lib/types";
import { createData, createStatement } from "../lib/utils";
import { ComponentPropsWithoutRef } from "react";
import { uiConfigStore } from "@/lib/store";

export function AddStatement({
  onSelect,
  iconProps,
}: {
  onSelect: (statement: IStatement) => void;
  iconProps?: Partial<ComponentPropsWithoutRef<typeof IconButton>>;
}) {
  const { setUiConfig } = uiConfigStore();

  return (
    <div className="w-max">
      <IconButton
        icon={FaPlus}
        size={14}
        className="mt-1 bg-editor hover:outline hover:outline-border"
        onClick={() => {
          const data = createData({
            type: { kind: "undefined" },
            isGeneric: true,
          });
          setUiConfig({ navigation: { id: data.id } });
          onSelect(createStatement({ data }));
        }}
        {...iconProps}
      />
    </div>
  );
}
