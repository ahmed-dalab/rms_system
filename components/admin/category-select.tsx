"use client";

import Select, { type StylesConfig } from "react-select";

import type { CategoryRecord } from "@/types/category";

type CategoryOption = { value: string; label: string };

const selectStyles: StylesConfig<CategoryOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    borderColor: state.isFocused ? "#ea580c" : "#fdba74",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(234, 88, 12, 0.25)" : "none",
    backgroundColor: "#ffffff",
    "&:hover": { borderColor: "#ea580c" },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#ea580c"
      : state.isFocused
        ? "#ffedd5"
        : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#0f172a",
  }),
  menu: (base) => ({ ...base, zIndex: 50 }),
};

type CategorySelectProps = {
  categories: CategoryRecord[];
  value: string | null;
  onChange: (categoryId: string) => void;
  inputId: string;
  disabled?: boolean;
  placeholder?: string;
};

export function CategorySelect({
  categories,
  value,
  onChange,
  inputId,
  disabled,
  placeholder = "Select category",
}: CategorySelectProps) {
  const options: CategoryOption[] = categories
    .filter((c) => c.isActive)
    .map((c) => ({ value: c.id, label: c.name }));

  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <>
      <Select<CategoryOption, false>
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
        placeholder={placeholder}
        styles={selectStyles}
      />
      <input type="hidden" name="categoryId" value={value ?? ""} readOnly />
    </>
  );
}
