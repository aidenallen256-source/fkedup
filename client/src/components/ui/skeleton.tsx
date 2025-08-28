import * as React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width = "100%", height = "1rem", className, ...props }) => {
  return (
    <div
      className={`bg-gray-200 animate-pulse rounded ${className}`}
      style={{ width, height }}
      {...props}
    />
  );
};
