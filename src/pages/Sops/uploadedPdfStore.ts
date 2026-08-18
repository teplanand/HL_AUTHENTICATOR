import type { SopDocumentRecord } from "./types";

const DATABASE_NAME = "sops-uploaded-files";
const DATABASE_VERSION = 1;
const STORE_NAME = "pdfs";

type StoredUploadedPdfRecord = {
  sopId: string;
  dataUrl: string;
  updatedAt: string;
};

const canUseIndexedDb = () =>
  typeof window !== "undefined" && typeof window.indexedDB !== "undefined";

const openDatabase = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    if (!canUseIndexedDb()) {
      reject(new Error("IndexedDB is not available."));
      return;
    }

    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "sopId" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Unable to open uploaded PDF database."));
  });

const withStore = async <T>(
  mode: IDBTransactionMode,
  runner: (store: IDBObjectStore, resolve: (value: T) => void, reject: (reason?: unknown) => void) => void,
) => {
  const database = await openDatabase();

  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);

    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error("Uploaded PDF transaction failed."));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error("Uploaded PDF transaction was aborted."));
    };

    runner(store, resolve, reject);
  });
};

export const saveUploadedPdf = async (sopId: string, dataUrl: string) => {
  if (!sopId || !dataUrl || !canUseIndexedDb()) {
    return;
  }

  await withStore<void>("readwrite", (store, resolve, reject) => {
    const request = store.put({
      sopId,
      dataUrl,
      updatedAt: new Date().toISOString(),
    } satisfies StoredUploadedPdfRecord);

    request.onsuccess = () => resolve();
    request.onerror = () =>
      reject(request.error ?? new Error("Unable to save uploaded PDF."));
  });
};

export const removeUploadedPdf = async (sopId: string) => {
  if (!sopId || !canUseIndexedDb()) {
    return;
  }

  await withStore<void>("readwrite", (store, resolve, reject) => {
    const request = store.delete(sopId);

    request.onsuccess = () => resolve();
    request.onerror = () =>
      reject(request.error ?? new Error("Unable to remove uploaded PDF."));
  });
};

export const loadUploadedPdf = async (sopId: string) => {
  if (!sopId || !canUseIndexedDb()) {
    return null;
  }

  return withStore<string | null>("readonly", (store, resolve, reject) => {
    const request = store.get(sopId);

    request.onsuccess = () => {
      const record = request.result as StoredUploadedPdfRecord | undefined;
      resolve(record?.dataUrl ?? null);
    };
    request.onerror = () =>
      reject(request.error ?? new Error("Unable to load uploaded PDF."));
  });
};

export const hydrateDocumentsWithUploadedPdfs = async (documents: SopDocumentRecord[]) => {
  const nextDocuments = await Promise.all(
    documents.map(async (document) => {
      if (document.contentSource !== "file" || document.contentFileUrl) {
        return document;
      }

      const storedDataUrl = await loadUploadedPdf(document.id);
      if (!storedDataUrl) {
        return document;
      }

      return {
        ...document,
        contentFileUrl: storedDataUrl,
      };
    }),
  );

  const didHydrate = nextDocuments.some(
    (document, index) => document.contentFileUrl !== documents[index]?.contentFileUrl,
  );

  return didHydrate ? nextDocuments : documents;
};

export const syncUploadedPdfStore = async (documents: SopDocumentRecord[]) => {
  await Promise.all(
    documents.map(async (document) => {
      if (document.contentSource !== "file") {
        await removeUploadedPdf(document.id);
        return;
      }

      if (document.contentFileUrl?.startsWith("data:")) {
        await saveUploadedPdf(document.id, document.contentFileUrl);
      }
    }),
  );
};
