"use client";

import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  cancelText = "再想想",
  confirmText = "确认删除",
  description,
  isOpen,
  isWorking = false,
  eyebrow = "危险操作",
  onCancel,
  onConfirm,
  title,
}: {
  cancelText?: string;
  confirmText?: string;
  description: string;
  eyebrow?: string;
  isOpen: boolean;
  isWorking?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-8 backdrop-blur-[2px]" role="presentation">
      <section
        aria-modal="true"
        className="w-full max-w-xl border border-black bg-[#f0f0e8] text-black shadow-sw-xl"
        role="dialog"
      >
        <div className="border-b border-black bg-black px-5 py-4 text-white">
          <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-[#93c5fd]">// {eyebrow}</p>
          <h2 className="mt-3 font-serif text-4xl font-semibold uppercase leading-none tracking-tight">{title}</h2>
        </div>
        <div className="grid gap-5 p-5 md:grid-cols-[auto_1fr]">
          <div className="flex h-20 w-20 items-center justify-center border-2 border-black bg-[#dc2626] font-mono text-4xl font-black text-white shadow-sw-sm">
            !
          </div>
          <div>
            <p className="font-mono text-sm leading-7 text-[#374151]">{description}</p>
            <p className="mt-4 border border-black bg-[#e5e5e0] p-3 font-mono text-xs font-bold uppercase leading-5 text-[#6b7280]">
              这一步会立即写入数据库；如果有关联记录，系统会按规则一并清理。
            </p>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-3 border-t border-black bg-[#e5e5e0] p-4">
          <Button disabled={isWorking} onClick={onCancel} tone="paper" type="button">
            {cancelText}
          </Button>
          <Button disabled={isWorking} onClick={onConfirm} tone="danger" type="button">
            {isWorking ? "处理中" : confirmText}
          </Button>
        </div>
      </section>
    </div>
  );
}
