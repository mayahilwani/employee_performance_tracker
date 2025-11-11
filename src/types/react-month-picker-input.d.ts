declare module "react-month-picker-input" {
  import * as React from "react";

  export interface YearMonth {
    year: number;
    month: number;
  }

  export interface MonthPickerInputProps {
    yearAndMonth?: YearMonth;
    onChange?: (
      maskedValue: string,
      selectedYearMonth: YearMonth
    ) => void;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  }

  const MonthPickerInput: React.FC<MonthPickerInputProps>;
  export default MonthPickerInput;
}
