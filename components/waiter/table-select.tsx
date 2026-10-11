"use client";

import Select, { type StylesConfig } from "react-select";

import type { TableRecord } from "@/types/table";

type TableOption = { value: string; label: string };

const selectStyles: StylesConfig<TableOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    borderColor: state.isFocused ? "#ea580c" : "#fdba74",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(234, 88, 12, 0.25)" : "none",
    backgroundColor: "#ffffff",
    "&:hover": { borderColor: "#ea580c" },
  }),
  menu: (base) => ({ ...base, zIndex: 50 }),
};

type TableSelectProps = {
  tables: TableRecord[];
  value: string | null;
  onChange: (tableId: string) => void;
  inputId: string;
  disabled?: boolean;
};

export function TableSelect({
  tables,
  value,
  onChange,
  inputId,
  disabled,
}: TableSelectProps) {
  const options: TableOption[] = tables.map((t) => ({
    value: t.id,
    label: `${t.label} (${t.capacity} seats)`,
  }));

  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <>
      <Select<TableOption, false>
        inputId={inputId}
        instanceId={inputId}
        options={options}
        value={selected}
        onChange={(option) => {
          if (option) {
            onChange(option.value);
          }
        }}
        isDisabled={disabled || options.length === 0}
        placeholder="Select table"
        styles={selectStyles}
      />
      <input type="hidden" name="tableId" value={value ?? ""} readOnly />
    </>
  );
}
