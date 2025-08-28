"use client";
import React from "react";

type TableProps = React.HTMLAttributes<HTMLTableElement> & { children: React.ReactNode };
export function Table({ children, ...props }: TableProps) {
  return <table className="min-w-full border-collapse" {...props}>{children}</table>;
}

type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement> & { children: React.ReactNode };
export function TableHeader({ children, ...props }: TableHeaderProps) {
  return <thead {...props}>{children}</thead>;
}

type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement> & { children: React.ReactNode };
export function TableHead({ children, ...props }: TableHeadProps) {
  return <th className="border px-4 py-2 text-left" {...props}>{children}</th>;
}

type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement> & { children: React.ReactNode };
export function TableBody({ children, ...props }: TableBodyProps) {
  return <tbody {...props}>{children}</tbody>;
}

type TableRowProps = React.HTMLAttributes<HTMLTableRowElement> & { children: React.ReactNode };
export function TableRow({ children, ...props }: TableRowProps) {
  return <tr {...props}>{children}</tr>;
}

type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement> & { children: React.ReactNode };
export function TableCell({ children, ...props }: TableCellProps) {
  return <td className="border px-4 py-2" {...props}>{children}</td>;
}
