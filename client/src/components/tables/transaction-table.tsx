"use client";
import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../ui/table";

interface Column {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
}

interface TransactionTableProps {
  columns: Column[];
  data: any[];
}

export default function TransactionTable({ columns, data }: TransactionTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableCell key={col.key} className={`text-${col.align || "left"} font-medium`}>
              {col.label}
            </TableCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, i) => (
          <TableRow key={i}>
            {columns.map((col) => (
              <TableCell key={col.key}>{row[col.key]}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
