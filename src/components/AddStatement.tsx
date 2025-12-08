import { IconButton } from "../ui/IconButton";
import { FaPlus } from "react-icons/fa6";
import { Context, IStatement } from "../lib/types";
import { createData, createStatement } from "../lib/utils";
import { ComponentPropsWithoutRef } from "react";
import { uiConfigStore } from "@/lib/store";

export function AddStatement({
  id,
  onSelect,
  iconProps,
  className,
}: {
  id: string;
  onSelect: (statement: IStatement) => void;
  iconProps?: Partial<ComponentPropsWithoutRef<typeof IconButton>>;
  context: Context;
  className?: string;
}) {
  const { navigation, setUiConfig } = uiConfigStore();
  const isFocused = navigation?.id === `${id}_add`;

  return (
    <div className="w-max">
      <IconButton
        icon={FaPlus}
        size={14}
        ref={(elem) => isFocused && elem?.focus()}
        className={[
          "mt-1 hover:outline hover:outline-border",
          isFocused ? "outline outline-border" : "",
          className || "",
        ].join(" ")}
        onClick={() => {
          const data = createData({
            type: { kind: "undefined" },
            isTypeEditable: true,
          });
          setUiConfig({ navigation: { id: data.id } });
          onSelect(createStatement({ data }));
        }}
        {...iconProps}
      />
    </div>
  );
}
