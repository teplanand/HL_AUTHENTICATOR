import { memo, type ChangeEvent } from "react";
import { Box, SxProps, Theme } from "@mui/material";
import { UseFormRegister } from "react-hook-form";
import MuiCheckbox from "../../mui/input/MuiCheckbox";

export type CheckboxField = {
  name: string;
  label: string;
};

export type CheckboxGridProps = {
  fields: CheckboxField[];
  /** react-hook-form register function */
  register?: UseFormRegister<any>;
  checkedValues?: Record<string, boolean | undefined>;
  onCheckedChange?: (name: string, checked: boolean) => void;
  /** Dot-notation prefix, e.g. "accessories" → registers "accessories.fieldName" */
  prefix?: string;
  /** Grid columns per breakpoint — defaults: xs=2, sm=3, md=4 */
  columns?: { xs?: number; sm?: number; md?: number };
  sx?: SxProps<Theme>;
};

const CheckboxGrid: React.FC<CheckboxGridProps> = ({
  fields,
  register,
  checkedValues,
  onCheckedChange,
  prefix,
  columns = { xs: 2, sm: 3, md: 4 },
  sx,
}) => {
  const getFieldPath = (name: string) =>
    prefix ? (`${prefix}.${name}` as any) : name;

  const getRegisterProps = (name: string) =>
    register ? register(getFieldPath(name)) : {};

  const handleCheckboxChange =
    (name: string) => (event: ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(name, event.target.checked);
    };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: `repeat(${columns.xs ?? 2}, 1fr)`,
          sm: `repeat(${columns.sm ?? 3}, 1fr)`,
          md: `repeat(${columns.md ?? 4}, 1fr)`,
        },
        gap: 1,
        ...sx,
      }}
    >
      {fields.map((field) => (
        <Box
          key={field.name}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1.5,
            px: 1,
            py: 0.25,
            transition: "all 0.15s ease",
            "&:hover": {
              borderColor: "primary.main",
              backgroundColor: "action.hover",
            },
          }}
        >
          <MuiCheckbox
            label={field.label}
            {...getRegisterProps(field.name)}
            checked={Boolean(checkedValues?.[field.name])}
            onChange={handleCheckboxChange(field.name)}
            size="small"
            sx={{
              "& .MuiFormControlLabel-label": {
                fontSize: "0.8125rem",
              },
            }}
          />
        </Box>
      ))}
    </Box>
  );
};

export default memo(CheckboxGrid);
