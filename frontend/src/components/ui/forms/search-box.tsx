"use client";

import { Search, X } from "lucide-react";

type SearchBoxProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchBox({ value, onChange, placeholder = "搜索" }: SearchBoxProps) {
  return (
    <label className="flex h-10 min-w-64 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm">
      <Search aria-hidden size={16} className="text-slate-400" />
      <input
        className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
      {value ? (
        <button
          aria-label="清空搜索"
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          onClick={() => onChange("")}
          type="button"
        >
          <X size={14} />
        </button>
      ) : null}
    </label>
  );
}
