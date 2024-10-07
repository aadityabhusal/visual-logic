import { ButtonHTMLAttributes } from "react";

export function Button({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={
        "p-1 flex items-center flex-1 gap-2 justify-center cursor-pointer text-white border-none bg-dropdown-selected bg-opacity-95 hover:bg-opacity-0 " +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
}
