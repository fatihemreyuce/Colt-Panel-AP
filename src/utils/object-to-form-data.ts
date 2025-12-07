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
        // Handle arrays - check if it's an array of objects (like localizations or assets)
        if (value.length > 0 && typeof value[0] === "object" && !(value[0] instanceof File)) {
          // Array of objects - append as nested form data
          value.forEach((item, index) => {
            Object.entries(item as Record<string, unknown>).forEach(([nestedKey, nestedValue]) => {
              if (nestedValue !== null && nestedValue !== undefined) {
                if (nestedValue instanceof File) {
                  formData.append(`${key}[${index}].${nestedKey}`, nestedValue);
                } else if (Array.isArray(nestedValue)) {
                  // Handle nested arrays (like localizations in assets)
                  nestedValue.forEach((nestedItem, nestedIndex) => {
                    if (typeof nestedItem === "object" && !(nestedItem instanceof File)) {
                      Object.entries(nestedItem as Record<string, unknown>).forEach(([deepKey, deepValue]) => {
                        formData.append(`${key}[${index}].${nestedKey}[${nestedIndex}].${deepKey}`, String(deepValue));
                      });
                    } else {
                      formData.append(`${key}[${index}].${nestedKey}[${nestedIndex}]`, String(nestedItem));
                    }
                  });
                } else if (typeof nestedValue === "object") {
                  formData.append(`${key}[${index}].${nestedKey}`, JSON.stringify(nestedValue));
                } else {
                  formData.append(`${key}[${index}].${nestedKey}`, String(nestedValue));
                }
              }
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
        // Skip if value is 0 and key ends with "Id" or "AssetId" (like fileAssetId, imageAssetId)
        // These are optional fields and 0 means "not set"
        if (value === 0 && (key.endsWith("Id") || key.endsWith("AssetId"))) {
          return; // Skip this field
        }
        if (String(value) !== "") {
          formData.append(key, String(value));
        }
      }
    }
  });

  return formData;
}
