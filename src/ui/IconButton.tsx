import {
  ActionIcon,
  ActionIconProps,
  PolymorphicComponentProps,
} from "@mantine/core";
import { forwardRef } from "react";
import { IconType } from "react-icons";

export const IconButton = forwardRef<
  HTMLButtonElement,
  PolymorphicComponentProps<"button", ActionIconProps> & { icon: IconType }
>(({ className, icon: Icon, children, ...props }, ref) => {
  return (
    <ActionIcon
      ref={ref}
      className={`w-3 h-3 focus:outline focus:outline-1 focus:outline-white ${
        className || ""
      }`}
      {...props}
    >
      <Icon className="w-full h-full" />
    </ActionIcon>
  );
});

IconButton.displayName = "IconButton";
