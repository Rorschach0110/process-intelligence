import { apiGet, apiPost, apiUpload } from "@/lib/api/client";
import type { Dataset, DatasetDetail, DatasetPreview } from "@/types/api";

export const datasetsClient = {
  list: () => apiGet<{ datasets: Dataset[] }>("/api/datasets"),
  detail: (id: number) => apiGet<DatasetDetail>(`/api/datasets/${id}`),
  preview: (id: number, page = 1, pageSize = 20) =>
    apiGet<DatasetPreview>(`/api/datasets/${id}/preview?page=${page}&page_size=${pageSize}`),
  templates: () => apiGet<{ templates: { id: number; name: string; mapping: Record<string, string> }[] }>("/api/mapping-templates"),
  saveTemplate: (name: string, mapping: Record<string, string>) => apiPost("/api/mapping-templates", { name, mapping }),
  uploadCsv: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiUpload<{ dataset_id: number; file: string; fields: string[]; preview: Record<string, string>[] }>("/api/upload-csv", form);
  },
};
