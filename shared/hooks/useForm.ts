import { useState, useCallback, useRef, useEffect } from 'react';

type ValidationRule = {
  required?: boolean | string;
  pattern?: { value: RegExp; message: string };
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  validate?: (value: any, formValues: any) => string | undefined | null;
};

type ValidatorMap<T extends Record<string, any>> = Partial<
  Record<keyof T, (value: any, formValues: T) => string | undefined | null>
>;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === '[object Object]';

const areValuesEqual = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) {
    return true;
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => areValuesEqual(item, b[index]));
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    return (
      aKeys.length === bKeys.length &&
      aKeys.every((key) => areValuesEqual(a[key], b[key]))
    );
  }

  return false;
};

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validators?: ValidatorMap<T>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  const rulesRef = useRef<Partial<Record<keyof T, ValidationRule>>>({});
  const initialValuesRef = useRef(initialValues);

  useEffect(() => {
    if (!validators) {
      return;
    }

    const nextRules = { ...rulesRef.current };

    (Object.keys(validators) as Array<keyof T>).forEach((key) => {
      const validate = validators[key];
      if (!validate) {
        return;
      }

      nextRules[key] = {
        ...nextRules[key],
        validate,
      };
    });

    rulesRef.current = nextRules;
  }, [validators]);

  // Sync only when external initialValues truly change, not on every rerender.
  useEffect(() => {
    if (areValuesEqual(initialValuesRef.current, initialValues)) {
      return;
    }

    initialValuesRef.current = initialValues;
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setSubmitCount(0);
  }, [initialValues]);

  const validateField = (name: keyof T, value: any, currentValues: T) => {
    const rules = rulesRef.current[name];
    if (!rules) return undefined;

    // Required
    if (rules.required) {
      const isEmpty =
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0);

      if (isEmpty) {
        return typeof rules.required === 'string'
          ? rules.required
          : 'This field is required';
      }
    }

    if (value !== undefined && value !== null && value !== '') {
      if (rules.pattern && !rules.pattern.value.test(String(value))) {
        return rules.pattern.message || 'Invalid format';
      }

      if (
        rules.minLength &&
        String(value).length < rules.minLength.value
      ) {
        return (
          rules.minLength.message ||
          `Minimum length is ${rules.minLength.value}`
        );
      }

      if (
        rules.maxLength &&
        String(value).length > rules.maxLength.value
      ) {
        return (
          rules.maxLength.message ||
          `Maximum length is ${rules.maxLength.value}`
        );
      }
    }

    if (rules.validate) {
      const msg = rules.validate(value, currentValues);
      if (msg) return msg;
    }

    return undefined;
  };

  const handleChange = useCallback(
    (name: keyof T, value: any) => {
      setValues((prev) => {
        const newValues = { ...prev, [name]: value };

        if (touched[name]) {
          const errorMsg = validateField(name, value, newValues);
          setErrors((currentErrors) => ({ ...currentErrors, [name]: errorMsg || undefined }));
        }

        return newValues;
      });
    },
    [touched]
  );

  const handleBlur = useCallback(
    (name: keyof T) => {
      setTouched(prev => ({ ...prev, [name]: true }));

      setErrors(prev => {
        const errorMsg = validateField(name, values[name], values);
        return { ...prev, [name]: errorMsg || undefined };
      });
    },
    [values]
  );

  const validateAll = useCallback(() => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;
    const allTouched: Partial<Record<keyof T, boolean>> = {};

    Object.keys(rulesRef.current).forEach(key => {
      const k = key as keyof T;
      allTouched[k] = true;

      const errorMsg = validateField(k, values[k], values);
      if (errorMsg) {
        newErrors[k] = errorMsg;
        isValid = false;
      }
    });

    setTouched(allTouched);
    setErrors(newErrors);

    return isValid;
  }, [values]);

  const handleSubmit =
    (onSubmit: (data: T) => void | Promise<void>) =>
      async (e: any) => {
        e?.preventDefault?.();

        const isValid = validateAll();
        setSubmitCount(c => c + 1);

        if (!isValid) return;

        try {
          setIsSubmitting(true);
          await onSubmit(values);
        } finally {
          setIsSubmitting(false);
        }
      };

  const resetForm = useCallback(() => {
    setValues(initialValuesRef.current);
    setErrors({});
    setTouched({});
    setSubmitCount(0);
  }, []);

  const register = (name: keyof T, rules?: ValidationRule) => {
    if (rules && !rulesRef.current[name]) {
      rulesRef.current[name] = rules;
    }

    return {
      name: name as string,
      value: values[name] as any,
      onChange: (e: any) => {
        const val =
          e?.target !== undefined
            ? e.target.type === 'checkbox'
              ? e.target.checked
              : e.target.type === 'file'
                ? e.target.files?.[0] ?? null
                : e.target.value
            : e;

        handleChange(name, val);
      },
      onBlur: () => handleBlur(name),
      error: !!errors[name],
      helperText: errors[name] as string | undefined,
      required: !!rules?.required,
    };
  };

  const getFieldProps = (name: keyof T) => register(name);

  return {
    values,
    setValues,
    errors,
    setErrors,
    touched,
    setTouched,
    isSubmitting,
    submitCount,
    handleChange,
    handleBlur,
    validateAll,
    handleSubmit,
    getFieldProps,
    register,
    resetForm,
  };
}
