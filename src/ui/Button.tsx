import React, { ButtonHTMLAttributes, forwardRef } from "react";

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={
        "p-1 flex items-center flex-1 gap-2 justify-center cursor-pointer text-white border-none bg-dropdown-selected bg-opacity-95 hover:bg-opacity-0 " +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";
