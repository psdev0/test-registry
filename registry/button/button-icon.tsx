// registry/button/button.tsx
import * as React from "react";
import { clsx } from "clsx";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function ButtonIcon({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition",
        variant === "primary" && "bg-black text-white hover:bg-black/90",
        variant === "secondary" &&
          "bg-gray-100 text-gray-900 hover:bg-gray-200",
        className,
      )}
      {...props}
    />
  );
}
