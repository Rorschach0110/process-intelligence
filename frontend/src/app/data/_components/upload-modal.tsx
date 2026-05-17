"use client";

import { UploadCloud } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/forms/button";
import { Modal } from "@/components/ui/forms/modal";
import { datasetsClient } from "@/lib/api/domains/datasets";

type UploadModalProps = {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
};

export function UploadModal({ open, onClose, onUploaded }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");

  async function upload() {
    if (!file) return;
    setStatus("上传中...");
    try {
      await datasetsClient.uploadCsv(file);
      setStatus("上传完成");
      onUploaded();
      onClose();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "上传失败");
    }
  }

  return (
    <Modal open={open} title="上传事件日志" onClose={onClose}>
      <div className="grid gap-4">
        <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <UploadCloud className="text-blue-600" size={28} />
          <span className="mt-3 text-sm font-medium text-slate-800">{file?.name || "选择 CSV 或 XES 事件日志"}</span>
          <span className="mt-1 text-xs text-slate-500">CSV 需包含 case_id、activity、timestamp；XES 会自动转换</span>
          <input
            accept=".csv,.xes,text/csv,text/xml,application/xml"
            className="hidden"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            type="file"
          />
        </label>
        {status ? <p className="text-sm text-slate-600">{status}</p> : null}
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>取消</Button>
          <Button disabled={!file} onClick={upload} variant="primary">
            上传
          </Button>
        </div>
      </div>
    </Modal>
  );
}
