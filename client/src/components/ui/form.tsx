import * as React from "react";

export function Form({ children, className }: { children: React.ReactNode; className?: string }) {
  return <form className={className}>{children}</form>;
}

export function FormField<T>({ name, render }: { name: string; render: (props: any) => React.ReactNode }) {
  return <div data-name={name}>{render({})}</div>;
}

export function FormItem({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

export function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{children}</label>;
}

export function FormControl({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function FormMessage({ children }: { children?: React.ReactNode }) {
  return children ? <p className="text-xs text-destructive">{children}</p> : null;
}