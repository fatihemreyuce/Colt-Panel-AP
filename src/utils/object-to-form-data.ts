export function objectToFormData<
  T extends Record<
    string,
    string | number | boolean | File | object | null | undefined
  >,
>(obj: T): FormData {
  const formData = new FormData();

  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value instanceof FileList) {
        Array.from(value).forEach((file) => formData.append(key, file));
      } else if (
        Array.isArray(value) &&
        value.every((v) => v instanceof File)
      ) {
        (value as File[]).forEach((file) => formData.append(key, file));
      } else if (Array.isArray(value)) {
        // Handle arrays - check if it's an array of objects (like localizations)
        if (value.length > 0 && typeof value[0] === "object" && !(value[0] instanceof File)) {
          // Array of objects - append as nested form data
          value.forEach((item, index) => {
            Object.entries(item as Record<string, unknown>).forEach(([nestedKey, nestedValue]) => {
              formData.append(`${key}[${index}].${nestedKey}`, String(nestedValue));
            });
          });
        } else {
          // Array of primitives
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, String(item));
        });
        }
      } else if (typeof value === "object") {
        formData.append(key, JSON.stringify(value));
      } else {
        if (String(value) !== "") {
          formData.append(key, String(value));
        }
      }
    }
  });

  return formData;
}
