export type EvidenceApiRecord = Record<string, unknown>;

export type EvidenceWorkspaceMode = "upload" | "view" | "admin";

export type EvidenceMediaKind = "image" | "video" | "audio" | "file";

export interface EvidenceCategoryOption {
  id: string;
  numericId: number | null;
  label: string;
  childLabel: string;
  subtitle: string;
  raw: EvidenceApiRecord | null;
}

export interface EvidenceReferenceOption {
  id: string;
  refNo: string;
  label: string;
  subtitle: string;
  raw: EvidenceApiRecord | null;
}

export interface EvidenceRemarkOption {
  id: string;
  label: string;
  value: string;
}

export interface EvidenceMediaItem {
  id: string;
  kind: EvidenceMediaKind;
  title: string;
  url: string;
  previewUrl: string;
  remark: string;
  createdAt: string;
  sourceLabel: string;
  raw: EvidenceApiRecord | null;
}

export interface EvidenceViewerProfile {
  name: string;
  hrmsId: string;
  role: string;
  company: string;
  companyId: number | null;
  division: string;
  canUpload: boolean;
  canView: boolean;
}

export interface UploadPreviewItem {
  id: string;
  name: string;
  sizeLabel: string;
  mimeType: string;
  isImage: boolean;
  previewUrl: string;
}
