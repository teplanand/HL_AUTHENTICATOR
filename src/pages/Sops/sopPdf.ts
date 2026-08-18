import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { SopDocumentRecord } from "./types";

const PAGE_MARGIN_X = 18;
const HEADER_HEIGHT = 22;
const FOOTER_HEIGHT = 14;
const SECTION_GAP = 8;

const normalizeText = (value: string) => value.replace(/\s+/g, " ").trim();

const getContentBounds = (doc: jsPDF) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  return {
    pageWidth,
    pageHeight,
    contentWidth: pageWidth - PAGE_MARGIN_X * 2,
    contentTop: HEADER_HEIGHT + 10,
    contentBottom: pageHeight - FOOTER_HEIGHT - 6,
  };
};

const ensureSpace = (doc: jsPDF, y: number, requiredHeight: number) => {
  const { contentTop, contentBottom } = getContentBounds(doc);

  if (y + requiredHeight <= contentBottom) {
    return y;
  }

  doc.addPage();
  return contentTop;
};

const writeWrappedText = (
  doc: jsPDF,
  text: string,
  y: number,
  options?: {
    fontSize?: number;
    indent?: number;
    lineHeight?: number;
    fontStyle?: "normal" | "bold";
    color?: [number, number, number];
  },
) => {
  const cleanText = normalizeText(text);
  if (!cleanText) {
    return y;
  }

  const { contentWidth } = getContentBounds(doc);
  const fontSize = options?.fontSize ?? 10.5;
  const indent = options?.indent ?? 0;
  const lineHeight = options?.lineHeight ?? 5.6;
  const fontStyle = options?.fontStyle ?? "normal";

  doc.setFont("helvetica", fontStyle);
  doc.setFontSize(fontSize);

  if (options?.color) {
    doc.setTextColor(...options.color);
  } else {
    doc.setTextColor(31, 41, 55);
  }

  const wrappedLines = doc.splitTextToSize(cleanText, contentWidth - indent);
  const requiredHeight = Math.max(wrappedLines.length * lineHeight, lineHeight);
  const nextY = ensureSpace(doc, y, requiredHeight);

  doc.text(wrappedLines, PAGE_MARGIN_X + indent, nextY);
  return nextY + requiredHeight;
};

const renderTable = (doc: jsPDF, table: HTMLTableElement, y: number) => {
  const rows = Array.from(table.querySelectorAll("tr")).map((row) =>
    Array.from(row.children).map((cell) => normalizeText(cell.textContent ?? "")),
  );

  if (!rows.length) {
    return y;
  }

  const headerRow = rows[0];
  const bodyRows = rows.slice(1);

  autoTable(doc, {
    startY: y,
    margin: { left: PAGE_MARGIN_X, right: PAGE_MARGIN_X, top: HEADER_HEIGHT + 10, bottom: 20 },
    head: headerRow.some(Boolean) ? [headerRow] : undefined,
    body: bodyRows.length ? bodyRows : headerRow.some(Boolean) ? [] : rows,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      textColor: [31, 41, 55],
      cellPadding: 2.4,
      lineColor: [203, 213, 225],
    },
    headStyles: {
      fillColor: [226, 232, 240],
      textColor: [15, 23, 42],
      fontStyle: "bold",
    },
  });

  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY;
  return (finalY ?? y) + 7;
};

const renderList = (
  doc: jsPDF,
  listElement: HTMLUListElement | HTMLOListElement,
  y: number,
) => {
  const items = Array.from(listElement.children).filter(
    (child): child is HTMLLIElement => child.tagName === "LI",
  );

  let nextY = y;

  items.forEach((item, index) => {
    const marker = listElement.tagName === "OL" ? `${index + 1}.` : "\u2022";
    const itemText = normalizeText(item.textContent ?? "");

    if (!itemText) {
      return;
    }

    nextY = ensureSpace(doc, nextY, 8);
    nextY = writeWrappedText(doc, `${marker} ${itemText}`, nextY, {
      indent: 2,
      fontSize: 10.2,
      lineHeight: 5.4,
    });
    nextY += 1.2;
  });

  return nextY + 1.5;
};

const renderHtmlBlock = (doc: jsPDF, html: string, y: number) => {
  const parser = new DOMParser();
  const parsed = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const container = parsed.body.firstElementChild;

  if (!container) {
    return y;
  }

  let nextY = y;

  Array.from(container.children).forEach((child) => {
    const tagName = child.tagName.toLowerCase();

    if (tagName === "p") {
      nextY = writeWrappedText(doc, child.textContent ?? "", nextY, {
        fontSize: 10.4,
        lineHeight: 5.5,
      });
      nextY += 2;
      return;
    }

    if (tagName === "ul" || tagName === "ol") {
      nextY = renderList(doc, child as HTMLUListElement | HTMLOListElement, nextY);
      return;
    }

    if (tagName === "table") {
      nextY = ensureSpace(doc, nextY, 18);
      nextY = renderTable(doc, child as HTMLTableElement, nextY);
      return;
    }

    nextY = writeWrappedText(doc, child.textContent ?? "", nextY, {
      fontSize: 10.4,
      lineHeight: 5.5,
    });
    nextY += 2;
  });

  return nextY;
};

const drawHeaderAndFooter = (doc: jsPDF, document: SopDocumentRecord) => {
  const totalPages = doc.getNumberOfPages();

  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);

    const { pageWidth, pageHeight } = getContentBounds(doc);

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, HEADER_HEIGHT, "F");

    doc.setTextColor(248, 250, 252);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(document.title, PAGE_MARGIN_X, 13);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      `${document.sopNumber}  |  ${document.department}  |  ${document.version}`,
      PAGE_MARGIN_X,
      18,
    );

    doc.setDrawColor(226, 232, 240);
    doc.line(PAGE_MARGIN_X, pageHeight - FOOTER_HEIGHT, pageWidth - PAGE_MARGIN_X, pageHeight - FOOTER_HEIGHT);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8.5);
   //doc.text(`Controlled Copy`, PAGE_MARGIN_X, pageHeight - 5);
    doc.text(`Page ${page} of ${totalPages}`, pageWidth - PAGE_MARGIN_X, pageHeight - 5, {
      align: "right",
    });
  }
};

export const createSopPdfBlob = async (document: SopDocumentRecord) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const { contentTop, contentWidth } = getContentBounds(doc);
  let cursorY = contentTop;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(20);
  doc.text(document.title, PAGE_MARGIN_X, cursorY);
  cursorY += 10;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(11);
  const summaryLines = doc.splitTextToSize(document.subject || document.purpose, contentWidth);
  doc.text(summaryLines, PAGE_MARGIN_X, cursorY);
  cursorY += summaryLines.length * 5.5 + 6;

  const metaRows = [
    ["SOP Number", document.sopNumber, "Level", document.level],
    ["Department", document.department, "Version", document.version],
    ["Owner", document.owner, "Effective Date", document.effectiveDate],
    ["Review Date", document.reviewDate, "Status", document.status],
  ];

  autoTable(doc, {
    startY: cursorY,
    margin: { left: PAGE_MARGIN_X, right: PAGE_MARGIN_X, top: HEADER_HEIGHT + 10, bottom: 20 },
    body: metaRows,
    theme: "grid",
    tableWidth: contentWidth,
    styles: {
      font: "helvetica",
      fontSize: 9.5,
      cellPadding: 2.5,
      textColor: [31, 41, 55],
    },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: [248, 250, 252] },
      2: { fontStyle: "bold", fillColor: [248, 250, 252] },
    },
  });

  cursorY =
    ((doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? cursorY) + 10;

  for (const block of document.structuredContent) {
    cursorY = ensureSpace(doc, cursorY, 16);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(block.title, PAGE_MARGIN_X, cursorY);
    cursorY += 3;

    doc.setDrawColor(191, 219, 254);
    doc.line(PAGE_MARGIN_X, cursorY, PAGE_MARGIN_X + 36, cursorY);
    cursorY += 5;

    cursorY = renderHtmlBlock(doc, block.html, cursorY);
    cursorY += SECTION_GAP;
  }

  drawHeaderAndFooter(doc, document);

  return doc.output("blob");
};
