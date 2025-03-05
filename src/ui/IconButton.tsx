import {
  ActionIcon,
  ActionIconProps,
  PolymorphicComponentProps,
  Tooltip,
} from "@mantine/core";
import { forwardRef } from "react";
import { IconType } from "react-icons";

export const IconButton = forwardRef<
  HTMLButtonElement,
  PolymorphicComponentProps<"button", ActionIconProps> & {
    icon: IconType;
    size?: number;
  }
>(({ icon: Icon, size, children, title, ...props }, ref) => {
  const iconNode = (
    <ActionIcon size={size} ref={ref} {...props}>
      <Icon style={{ width: size, height: size }} />
    </ActionIcon>
  );
  if (title === undefined) return iconNode;
  return <Tooltip label={title}>{iconNode}</Tooltip>;
});

IconButton.displayName = "IconButton";
