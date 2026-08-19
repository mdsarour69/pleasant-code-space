import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const LANGS = [
  { code: "bn", label: "বাংলা" },
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
] as const;

export type LangCode = (typeof LANGS)[number]["code"];

/** Column name for a base field in a given language ("bn" uses the base column). */
export function langField(base: string, lang: LangCode) {
  return lang === "bn" ? base : `${base}_${lang}`;
}

export function Field({
  label,
  value,
  onChange,
  textarea,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  textarea?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-[#9b93ad]">{label}</Label>
      {textarea ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-[#2a2438] bg-[#0d0a17] text-white"
        />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-[#2a2438] bg-[#0d0a17] text-white"
        />
      )}
    </div>
  );
}

export function LangTabs({ value, onChange }: { value: LangCode; onChange: (l: LangCode) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => onChange(l.code)}
          className={`rounded-full px-3 py-1 text-xs transition-colors ${
            value === l.code
              ? "bg-[#ff3b9d] text-white"
              : "border border-[#2a2438] text-[#9b93ad] hover:text-white"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

export function EntityDialog({
  open,
  onOpenChange,
  title,
  onSave,
  saving,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onSave: () => void;
  saving: boolean;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-[#2a2438] bg-[#120e1e] text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">{children}</div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving} className="bg-[#ff3b9d] hover:bg-[#ff3b9d]/90">
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useLang() {
  return useState<LangCode>("bn");
}