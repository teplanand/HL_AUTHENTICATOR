// formikHelpers.ts
import { FormikProps } from "formik";

export const formikFieldProps = (
  formik: any,
  name: any // 👈 YEH LINE CHANGE KAREIN
) => ({
  name,
  value: formik.values[name],
  onChange: formik.handleChange,
  onBlur: formik.handleBlur,
  error: !!formik.touched[name] && !!formik.errors[name],
  helperText: (formik.touched[name] && formik.errors[name]) as string,
});
