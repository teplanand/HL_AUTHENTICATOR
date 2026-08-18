import React from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerModule from "pdfjs-dist/build/pdf.worker.min.mjs?raw";

let pdfWorkerBlobUrl: string | null = null;

function configurePdfWorker() {
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    return;
  }

  if (pdfjsLib.GlobalWorkerOptions.workerPort) {
    return;
  }

  if (!pdfWorkerBlobUrl) {
    pdfWorkerBlobUrl = URL.createObjectURL(
      new Blob([pdfWorkerModule], { type: "text/javascript" }),
    );
  }

  pdfjsLib.GlobalWorkerOptions.workerPort = new Worker(pdfWorkerBlobUrl, {
    type: "module",
  });
}

configurePdfWorker();

export type ProtectedFileItem = {
  name: string;
  url: string;
  type: "pdf" | "image";
};

interface ProtectedFileSurfaceProps {
  file: ProtectedFileItem;
  watermarkText?: string;
  minHeight?: number;
}

function useProtectedInteractions(active: boolean) {
  const surfaceRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!active) {
      return;
    }

    const surface = surfaceRef.current;
    if (!surface) {
      return;
    }

    const preventDefault = (event: Event) => {
      event.preventDefault();
    };

    const preventKeys = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const blockedCombo =
        (event.ctrlKey || event.metaKey) &&
        ["s", "p", "c", "x", "a", "u"].includes(key);
      const blockedDevtoolsCombo =
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        ["i", "j", "c"].includes(key);

      if (blockedCombo || blockedDevtoolsCombo || key === "f12" || key === "printscreen") {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const preventMouseContext = (event: MouseEvent) => {
      if (event.button === 2) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    surface.addEventListener("contextmenu", preventDefault);
    surface.addEventListener("dragstart", preventDefault);
    surface.addEventListener("selectstart", preventDefault);
    surface.addEventListener("copy", preventDefault);
    surface.addEventListener("cut", preventDefault);
    window.addEventListener("keydown", preventKeys, true);
    window.addEventListener("contextmenu", preventDefault, true);
    window.addEventListener("mousedown", preventMouseContext, true);
    window.addEventListener("auxclick", preventDefault, true);

    return () => {
      surface.removeEventListener("contextmenu", preventDefault);
      surface.removeEventListener("dragstart", preventDefault);
      surface.removeEventListener("selectstart", preventDefault);
      surface.removeEventListener("copy", preventDefault);
      surface.removeEventListener("cut", preventDefault);
      window.removeEventListener("keydown", preventKeys, true);
      window.removeEventListener("contextmenu", preventDefault, true);
      window.removeEventListener("mousedown", preventMouseContext, true);
      window.removeEventListener("auxclick", preventDefault, true);
    };
  }, [active]);

  return surfaceRef;
}

function Watermark({ text }: { text: string }) {
  return (
    <Box
      sx={{
        pointerEvents: "none",
        position: "absolute",
        inset: 0,
        overflow: "hidden",
      }}
    >
      {Array.from({ length: 12 }).map((_, index) => (
        <Box
          key={index}
          sx={{
            position: "absolute",
            left: "50%",
            top: `${8 + index * 8}%`,
            transform: "translateX(-50%) rotate(-24deg)",
            color: "rgba(255,255,255,0.12)",
            fontSize: "1rem",
            fontWeight: 800,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </Box>
      ))}
    </Box>
  );
}

function FileLoadError({ message }: { message: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320, p: 3 }}>
      <Alert
        severity="error"
        icon={<WarningAmberRoundedIcon fontSize="inherit" />}
        sx={{ width: "100%", maxWidth: 420 }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          File preview could not be loaded.
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {message}
        </Typography>
      </Alert>
    </Box>
  );
}

function useBlobUrl(file: ProtectedFileItem) {
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [blobUrl, setBlobUrl] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;
    let objectUrl = "";

    async function loadFile() {
      if (!file.url) {
        setStatus("error");
        setErrorMessage("File URL is missing.");
        return;
      }

      setStatus("loading");
      setErrorMessage("");
      setBlobUrl("");

      try {
        const response = await fetch(file.url, {
          method: "GET",
          cache: "no-store",
          credentials: "omit",
        });

        if (!response.ok) {
          throw new Error(`Unable to fetch file (${response.status}).`);
        }

        const loadedBlob = await response.blob();
        objectUrl = URL.createObjectURL(loadedBlob);

        if (!cancelled) {
          setBlobUrl(objectUrl);
          setStatus("ready");
        }
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage(error instanceof Error ? error.message : "Unable to load file.");
        }
      }
    }

    void loadFile();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file.url]);

  return { status, errorMessage, blobUrl };
}

function PdfCanvasViewer({
  file,
  minHeight = 620,
}: {
  file: ProtectedFileItem;
  minHeight?: number;
}) {
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = React.useState("");
  const hostRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let cancelled = false;
    let pdfDocument: pdfjsLib.PDFDocumentProxy | null = null;

    const clearHost = () => {
      if (hostRef.current) {
        hostRef.current.innerHTML = "";
      }
    };

    const renderPdf = async () => {
      if (!file.url) {
        setStatus("error");
        setErrorMessage("File URL is missing.");
        return;
      }

      const host = hostRef.current;
      if (!host) {
        return;
      }

      setStatus("loading");
      setErrorMessage("");
      clearHost();

      try {
        const response = await fetch(file.url, {
          method: "GET",
          cache: "no-store",
          credentials: "omit",
        });

        if (!response.ok) {
          throw new Error(`Unable to fetch file (${response.status}).`);
        }

        const fileBuffer = await response.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({
          data: fileBuffer,
          useSystemFonts: true,
        });

        pdfDocument = await loadingTask.promise;

        if (cancelled || !hostRef.current) {
          await pdfDocument.cleanup();
          return;
        }

        const availableWidth = Math.max((hostRef.current.clientWidth || 960) - 48, 320);
        const pixelRatio = window.devicePixelRatio || 1;

        for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
          const page = await pdfDocument.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = availableWidth / baseViewport.width;
          const viewport = page.getViewport({ scale });

          const wrapper = document.createElement("div");
          wrapper.style.width = `${viewport.width}px`;
          wrapper.style.maxWidth = "100%";
          wrapper.style.margin = "0 auto 16px";
          wrapper.style.background = "#ffffff";
          wrapper.style.border = "1px solid rgba(148,163,184,0.24)";
          wrapper.style.borderRadius = "16px";
          wrapper.style.overflow = "hidden";
          wrapper.style.boxShadow = "0 18px 36px -24px rgba(15,23,42,0.55)";

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (!context) {
            throw new Error("Canvas rendering is not supported in this browser.");
          }

          canvas.width = Math.floor(viewport.width * pixelRatio);
          canvas.height = Math.floor(viewport.height * pixelRatio);
          canvas.style.width = `${viewport.width}px`;
          canvas.style.height = `${viewport.height}px`;
          canvas.style.display = "block";
          canvas.setAttribute("aria-label", `PDF page ${pageNumber}`);

          context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

          wrapper.appendChild(canvas);
          hostRef.current.appendChild(wrapper);

          await page.render({
            canvas,
            canvasContext: context,
            viewport,
          }).promise;
        }

        if (!cancelled) {
          setStatus("ready");
        }
      } catch (error) {
        if (!cancelled) {
          clearHost();
          setStatus("error");
          setErrorMessage(error instanceof Error ? error.message : "Unable to load file.");
        }
      }
    };

    void renderPdf();

    return () => {
      cancelled = true;
      clearHost();
      void pdfDocument?.cleanup();
    };
  }, [file.url]);

  return (
    <Box sx={{ position: "relative", minHeight }}>
      <Box
        ref={hostRef}
        sx={{
          minHeight,
          px: 3,
          py: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      />

      {status === "loading" ? (
        <Stack
          alignItems="center"
          justifyContent="center"
          spacing={1.5}
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(2,6,23,0.42)",
          }}
        >
          <CircularProgress size={24} />
          <Typography variant="body2" color="common.white">
            Loading PDF...
          </Typography>
        </Stack>
      ) : null}

      {status === "error" ? (
        <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(2,6,23,0.42)" }}>
          <FileLoadError message={errorMessage} />
        </Box>
      ) : null}
    </Box>
  );
}

function ImageViewer({
  file,
  minHeight = 620,
}: {
  file: ProtectedFileItem;
  minHeight?: number;
}) {
  const { status, errorMessage, blobUrl } = useBlobUrl(file);

  if (status === "loading") {
    return (
      <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ minHeight: 420 }}>
        <CircularProgress size={24} />
        <Typography variant="body2" color="common.white">
          Loading image...
        </Typography>
      </Stack>
    );
  }

  if (status === "error" || !blobUrl) {
    return <FileLoadError message={errorMessage} />;
  }

  return (
    <iframe
      title="protected-image-preview"
      srcDoc={`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body {
        margin: 0;
        height: 100%;
        background: #020617;
        overflow: auto;
      }
      body {
        display: flex;
        align-items: center;
        justify-content: center;
        user-select: none;
        -webkit-user-select: none;
      }
      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        pointer-events: none;
        -webkit-user-drag: none;
      }
    </style>
  </head>
  <body oncontextmenu="return false;">
    <img src="${blobUrl}" alt="${file.name.replace(/"/g, "&quot;")}" />
  </body>
</html>`}
      style={{ width: "100%", height: "100%", border: 0, display: "block", minHeight }}
      sandbox="allow-same-origin"
    />
  );
}

export function ProtectedFileSurface({
  file,
  watermarkText = "Protected",
  minHeight = 620,
}: ProtectedFileSurfaceProps) {
  const surfaceRef = useProtectedInteractions(file.type === "pdf" || file.type === "image");

  return (
    <Box
      ref={surfaceRef}
      sx={{
        position: "relative",
        height: "100%",
        minHeight,
        overflow: "hidden",
        bgcolor: "#020617",
        borderRadius: 3,
        border: "1px solid rgba(148,163,184,0.18)",
        userSelect: "none",
      }}
      onContextMenu={(event) => event.preventDefault()}
      onMouseDownCapture={(event) => {
        if (event.button === 2) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      {file.type === "pdf" ? (
        <PdfCanvasViewer file={file} minHeight={minHeight} />
      ) : (
        <ImageViewer file={file} minHeight={minHeight} />
      )}
      <Watermark text={watermarkText} />
    </Box>
  );
}

export default ProtectedFileSurface;
