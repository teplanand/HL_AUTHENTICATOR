type PrintPdfBlobOptions = {
  fileName?: string;
};

export const printPdfBlob = async (blob: Blob, _options?: PrintPdfBlobOptions) => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("PDF printing is only available in the browser");
  }

  const objectUrl = URL.createObjectURL(blob);
  const iframe = document.createElement("iframe");

  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";

  const cleanup = () => {
    window.removeEventListener("afterprint", cleanup);
    window.setTimeout(() => {
      iframe.remove();
      URL.revokeObjectURL(objectUrl);
    }, 1000);
  };

  await new Promise<void>((resolve, reject) => {
    iframe.onload = () => {
      try {
        const frameWindow = iframe.contentWindow;

        if (!frameWindow) {
          reject(new Error("Unable to access the print frame"));
          return;
        }

        window.addEventListener("afterprint", cleanup, { once: true });
        frameWindow.focus();
        frameWindow.print();
        window.setTimeout(cleanup, 30000);
        resolve();
      } catch (error) {
        cleanup();
        reject(error instanceof Error ? error : new Error("Unable to print PDF"));
      }
    };

    iframe.onerror = () => {
      cleanup();
      reject(new Error("Unable to load PDF for printing"));
    };

    iframe.src = objectUrl;
    document.body.appendChild(iframe);
  });
};

export default printPdfBlob;
