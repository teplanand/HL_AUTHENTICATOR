import type { SopLevel, SopMasterRecord } from "./types";

const normalizeCategoryText = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

export const inferLevelFromCategory = (category: string, fallbackLevel: SopLevel): SopLevel => {
  const normalized = category.trim().toLowerCase();

  if (
    normalized.includes("level 3") ||
    normalized.includes("l3") ||
    normalized.includes("work instruction")
  ) {
    return "Level 3";
  }

  if (
    normalized.includes("level 2") ||
    normalized.includes("l2") ||
    normalized.includes("process instruction")
  ) {
    return "Level 2";
  }

  return fallbackLevel;
};

export const buildCategoryDropdownOptions = (
  categoryRecords: SopMasterRecord[],
  selectedCategory?: string,
) => {
  const baseOptions = categoryRecords
    .filter((item) => item.type === "Category" && item.status === "Active")
    .map((item) => item.name.trim())
    .filter(Boolean);

  if (selectedCategory?.trim() && !baseOptions.includes(selectedCategory.trim())) {
    baseOptions.unshift(selectedCategory.trim());
  }

  return Array.from(new Set(baseOptions));
};

export const getCategoryContentHeaders = (
  categoryRecords: SopMasterRecord[],
  category?: string,
) => {
  const normalizedCategory = normalizeCategoryText(category || "");

  if (!normalizedCategory) {
    return [];
  }

  const matchedRecord = categoryRecords.find((item) => {
    if (item.type !== "Category") {
      return false;
    }

    const normalizedName = normalizeCategoryText(item.name);
    return (
      normalizedName === normalizedCategory ||
      normalizedName.includes(normalizedCategory) ||
      normalizedCategory.includes(normalizedName)
    );
  });

  return (matchedRecord?.contentHeaders || []).map((item) => item.trim()).filter(Boolean);
};
