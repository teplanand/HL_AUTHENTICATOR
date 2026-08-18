import React from "react";
import {
  Card,
  CardContent,
  Chip,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { Page } from "../../../shared/components/common/Page";
import SopPdfPreviewPanel from "./SopPdfPreviewPanel";
import { sectionTitleSx, surfaceSx } from "./ui";
import { useSopsWorkflowData } from "./useSopsWorkflowData";

const SopsViewerPage = () => {
  const { documents } = useSopsWorkflowData();
  const releasedDocuments = React.useMemo(
    () => documents.filter((item) => item.status === "Released"),
    [documents],
  );
  const authorizedDocuments = React.useMemo(
    () => documents.filter((item) => item.status === "Authorized"),
    [documents],
  );
  const archivedDocuments = React.useMemo(
    () => documents.filter((item) => item.status === "Archived"),
    [documents],
  );
  const [selectedId, setSelectedId] = React.useState(releasedDocuments[0]?.id ?? "");
  const selectedDocument =
    releasedDocuments.find((item) => item.id === selectedId) ?? releasedDocuments[0];

  React.useEffect(() => {
    if (!releasedDocuments.some((item) => item.id === selectedId)) {
      setSelectedId(releasedDocuments[0]?.id ?? "");
    }
  }, [releasedDocuments, selectedId]);

  if (!selectedDocument) {
    return (
      <Page module="sops">
      <Card sx={surfaceSx}>
        <CardContent>
          <Typography variant="h6" sx={sectionTitleSx}>
            Secure Viewer
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            No released SOP is available right now. Only officially released SOPs appear in Secure Viewer.
          </Typography>
        </CardContent>
      </Card>
      </Page>
    );
  }

  return (
    <Page module="sops">
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, lg: 3.25 }}>
        <Stack spacing={3}>
          <Card sx={surfaceSx}>
            <CardContent>
              <Typography variant="h6" sx={sectionTitleSx}>
                Secure Viewer
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                Released SOPs stay in a simple reader-friendly library for general department users.
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap" }}>
                <Chip label={`Released: ${releasedDocuments.length}`} size="small" color="success" />
                <Chip
                  label={`Release Pending: ${authorizedDocuments.length}`}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
                <Chip
                  label={`Archived: ${archivedDocuments.length}`}
                  size="small"
                  variant="outlined"
                />
              </Stack>
              <List sx={{ mt: 1 }}>
                {releasedDocuments.map((item) => (
                  <ListItemButton
                    key={item.id}
                    selected={item.id === selectedDocument.id}
                    onClick={() => setSelectedId(item.id)}
                    sx={{ borderRadius: 2, mb: 0.75 }}
                  >
                    <ListItemText
                      primary={item.title}
                      secondary={`${item.sopNumber} • ${item.department}`}
                      primaryTypographyProps={{ fontWeight: 700 }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </CardContent>
          </Card>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, lg: 8.75 }}>
        <Stack spacing={3}>
          <Card sx={surfaceSx}>
            <CardContent>
              <SopPdfPreviewPanel document={selectedDocument} />
            </CardContent>
          </Card>
 
        </Stack>
      </Grid>
    </Grid>
    </Page>
  );
};

export default SopsViewerPage;
