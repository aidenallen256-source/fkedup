import * as React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

export function Checkbox({ onCheckedChange, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      {...props}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      className="h-4 w-4 border rounded"
    />
  );
}