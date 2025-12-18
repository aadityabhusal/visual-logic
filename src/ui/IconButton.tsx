import {
  ActionIcon,
  ActionIconProps,
  Tooltip,
  TooltipProps,
} from "@mantine/core";
import { forwardRef, HTMLAttributes } from "react";
import { IconType } from "react-icons";

export const IconButton = forwardRef<
  HTMLButtonElement,
  ActionIconProps &
    HTMLAttributes<HTMLButtonElement> & {
      icon: IconType;
      position?: TooltipProps["position"];
    }
>(({ icon: Icon, size, children: _children, title, ...props }, ref) => {
  const iconNode = (
    <ActionIcon size={size} ref={ref} {...props}>
      <Icon style={{ width: size, height: size }} />
    </ActionIcon>
  );
  if (title === undefined || props.disabled) return iconNode;
  return (
    <Tooltip label={title} position={props.position}>
      {iconNode}
    </Tooltip>
  );
});

IconButton.displayName = "IconButton";
