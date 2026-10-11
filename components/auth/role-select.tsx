"use client";

import Select, { type StylesConfig } from "react-select";

import { USER_ROLES, type UserRole } from "@/types/roles";

type RoleOption = { value: UserRole; label: string };

const options: RoleOption[] = USER_ROLES.map((role) => ({
  value: role,
  label: role.charAt(0).toUpperCase() + role.slice(1),
}));

const selectStyles: StylesConfig<RoleOption, false> = {
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

type RoleSelectProps = {
  value: UserRole | null;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
  /** When omitted, all roles are shown. */
  allowedRoles?: UserRole[];
};

export function RoleSelect({
  value,
  onChange,
  disabled,
  allowedRoles,
}: RoleSelectProps) {
  const visibleOptions = allowedRoles
    ? options.filter((option) => allowedRoles.includes(option.value))
    : options;
  const selected =
    visibleOptions.find((option) => option.value === value) ??
    visibleOptions[0] ??
    null;

  return (
    <Select<RoleOption, false>
      instanceId="register-role"
      options={visibleOptions}
      value={selected}
      onChange={(option) => {
        if (option) {
          onChange(option.value);
        }
      }}
      isDisabled={disabled}
      placeholder="Select role"
      styles={selectStyles}
    />
  );
}
