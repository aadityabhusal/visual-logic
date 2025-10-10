import { ReactNode } from "react";

export function NoteText(props: {
  italic?: boolean;
  center?: boolean;
  border?: boolean;
  children?: ReactNode;
}) {
  return (
    <p
      className={
        "text-xs text-disabled p-1 " + (props.border ? "border-b" : "")
      }
      style={{
        ...(props.center ? { textAlign: "center" } : {}),
        ...(props.italic ? { fontStyle: "italic" } : {}),
      }}
    >
      {props.children}
    </p>
  );
}
