import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

export default function DatePickerValue() {
  const [value, setValue] = React.useState<Dayjs | null>(dayjs("2022-04-17"));

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={["DatePicker", "DatePicker"]}>
        {/* Uncontrolled picker */}
        <DatePicker
          label="Uncontrolled picker"
          defaultValue={dayjs("2022-04-17")}
          format="DD-MM-YYYY" // <-- Format here
        />

        {/* Controlled picker */}
        {/* <DatePicker
          label="Controlled picker"
          value={value}
          onChange={(newValue) => setValue(newValue)}
          format="DD-MM-YYYY" // 
         
        /> */}
        <DatePicker
          label="Controlled picker"
          value={value}
          onChange={(newValue) => setValue(newValue ? dayjs(newValue) : null)}
          format="DD-MM-YYYY"
        />
      </DemoContainer>
    </LocalizationProvider>
  );
}
