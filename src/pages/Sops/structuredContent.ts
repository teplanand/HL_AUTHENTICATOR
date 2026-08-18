import type { SopLevel, SopStructuredContentBlock } from "./types";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const SOP_CONTENT_SECTION_TITLE = "Content";

export const sopTemplateBlocks = {
  metadata: [
    "Title",
    "Subject",
    "Department",
    "Reference Number",
    "Effective Date",
    "Review Date",
    "Keywords",
  ],
  content: [SOP_CONTENT_SECTION_TITLE],
} as const;

export const getSopTemplateSections = (_level: SopLevel) => [...sopTemplateBlocks.content];

const normalizeHeaderKey = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

const normalizeHeaderTitles = (headers: string[] = []) => {
  const cleanedHeaders = headers.map((item) => item.trim()).filter(Boolean);
  return Array.from(new Set(cleanedHeaders));
};

const createDefaultStructuredContent = (
  level: SopLevel,
  title: string,
  department: string,
  purpose?: string,
  scope?: string,
  headers: string[] = [],
): SopStructuredContentBlock[] => {
  const safeTitle = escapeHtml(title);
  const safeDepartment = escapeHtml(department);
  const purposeHtml = purpose?.trim()
    ? `<p><strong>Purpose:</strong> ${escapeHtml(purpose.trim())}</p>`
    : "";
  const scopeHtml = scope?.trim()
    ? `<p><strong>Scope:</strong> ${escapeHtml(scope.trim())}</p>`
    : "";

  const defaultHtml =
    level === "Level 2"
      ? `
        ${purposeHtml}
        ${scopeHtml}
        <p><strong>${safeTitle}</strong> defines the controlled process for <strong>${safeDepartment}</strong>.</p>
        <ol>
          <li>Capture all controlled process steps in business sequence.</li>
          <li>Include checkpoints, records, and responsibilities in the same content block.</li>
          <li>Keep the write-up audit-ready and easy for reviewers to verify.</li>
        </ol>
      `
      : `
        ${purposeHtml}
        ${scopeHtml}
        <p><strong>${safeTitle}</strong> guides execution activities for <strong>${safeDepartment}</strong>.</p>
        <ol>
          <li>Document pre-checks, execution steps, and safety notes in one place.</li>
          <li>Include machine settings, observations, and quality checkpoints together.</li>
          <li>Make the content clear enough for trained operators and reviewers.</li>
        </ol>
      `;

  const normalizedHeaders = normalizeHeaderTitles(headers);
  if (!normalizedHeaders.length) {
    return [
      {
        title: SOP_CONTENT_SECTION_TITLE,
        html: defaultHtml.trim(),
      },
    ];
  }

  return normalizedHeaders.map((header, index) => {
    const normalizedHeader = normalizeHeaderKey(header);

    if (normalizedHeader === "purpose") {
      return {
        title: header,
        html: purpose?.trim()
          ? `<p>${escapeHtml(purpose.trim())}</p>`
          : "<p>Describe the purpose of this SOP.</p>",
      };
    }

    if (normalizedHeader === "scope") {
      return {
        title: header,
        html: scope?.trim()
          ? `<p>${escapeHtml(scope.trim())}</p>`
          : "<p>Define the scope and applicability of this SOP.</p>",
      };
    }

    if (
      normalizedHeader.includes("role") ||
      normalizedHeader.includes("responsibilit")
    ) {
      return {
        title: header,
        html:
          "<ul><li>Creator</li><li>Checker</li><li>Approver</li><li>Authorizer</li></ul>",
      };
    }

    if (
      normalizedHeader.includes("procedure") ||
      normalizedHeader.includes("instruction") ||
      normalizedHeader.includes("process") ||
      normalizedHeader.includes("content") ||
      normalizedHeader.includes("step")
    ) {
      return {
        title: header,
        html: defaultHtml.trim(),
      };
    }

    if (normalizedHeader.includes("annexure") || normalizedHeader.includes("attachment")) {
      return {
        title: header,
        html: "<p>List the annexures, attachments, or supporting formats used in this SOP.</p>",
      };
    }

    if (normalizedHeader.includes("reference")) {
      return {
        title: header,
        html: "<p>Mention the reference documents, standards, or linked procedures here.</p>",
      };
    }

    return {
      title: header,
      html:
        index === 0
          ? defaultHtml.trim()
          : `<p>Add details for <strong>${escapeHtml(header)}</strong>.</p>`,
    };
  });
};

type NormalizeStructuredContentOptions = {
  level: SopLevel;
  title: string;
  department: string;
  purpose?: string;
  scope?: string;
  headers?: string[];
  existingContent?: SopStructuredContentBlock[];
};

export const normalizeStructuredContentForLevel = ({
  level,
  title,
  department,
  purpose,
  scope,
  headers = [],
  existingContent = [],
}: NormalizeStructuredContentOptions): SopStructuredContentBlock[] => {
  const defaults = createDefaultStructuredContent(level, title, department, purpose, scope, headers);
  const normalizedHeaders = normalizeHeaderTitles(headers);
  const existingContentByTitle = new Map(
    existingContent
      .map((block) => [normalizeHeaderKey(block.title), block.html?.trim() ?? ""] as const)
      .filter(([, html]) => Boolean(html)),
  );
  const fallbackExistingHtml = existingContent.find((block) => block.html?.trim())?.html?.trim() ?? "";

  if (!normalizedHeaders.length && existingContent.length > 1) {
    return existingContent.map((block) => ({
      title: block.title,
      html: block.html?.trim() || "",
    }));
  }

  return defaults.map((block, index) => ({
    title: block.title,
    html:
      existingContentByTitle.get(normalizeHeaderKey(block.title)) ||
      (existingContent.length === 1 && index === 0 ? fallbackExistingHtml || block.html : block.html),
  }));
};
