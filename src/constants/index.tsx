export const metadata:Metadata = {
  frequency: [
    {
      value: "daily",
      label: "Daily",
    },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ],
};

export type Option = {
  value: string;
  label: string;
};

export type Metadata = {
  frequency: Option[];
};
