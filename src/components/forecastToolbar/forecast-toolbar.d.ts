export type ToolbarSelectOption = {
  label: string;
  value: string;
};

export type ToolbarSelect = {
  label: string;
  value: string;
  options: ToolbarSelectOption[];
  setValue: (value: string) => void;
  disabled?: boolean;
};

export type forecastToolbarProps = {
  selects: ToolbarSelect[];
};