import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveSetting } from "@/lib/admin.functions";
import { LANGS, LangTabs, type LangCode } from "./EntityDialog";
import { Link2, Globe, Type } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";


type Setting = Tables<"settings">;

export function SettingsTab({ settings }: { settings: Setting[] }) {
  const qc = useQueryClient();
  const save = useServerFn(saveSetting);
  const [lang, setLang] = useState<LangCode>("bn");
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (vars: { key: string; value: string }) => save({ data: vars }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin-data"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = settings.filter((s) => s.key.startsWith(`${lang}.`));
  const globalLinks = settings.filter((s) => !s.key.includes("."));

  return (
    <div className="space-y-8 pb-20">
      {/* Global Links Section */}
      <section className="space-y-4 rounded-xl border border-[#2a2438] bg-[#120e1e] p-6">
        <div className="flex items-center gap-2">
          <Link2 size={18} className="text-[#ff3b9d]" />
          <h2 className="text-lg font-semibold text-white">Global Links & Contact</h2>
        </div>
        <p className="text-xs text-[#6f6880]">
          These links are shared across all languages (WhatsApp, Email, etc).
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {globalLinks.map((s) => {
            const draft = drafts[s.key] ?? s.value;
            const dirty = draft !== s.value;
            return (
              <div key={s.key} className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-[#9b93ad]">
                  {s.key.replace("_", " ")}
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={draft}
                    onChange={(e) => setDrafts((d) => ({ ...d, [s.key]: e.target.value }))}
                    className="border-[#2a2438] bg-[#0d0a17] text-white"
                  />
                  <Button
                    size="sm"
                    disabled={!dirty || mutation.isPending}
                    onClick={() => mutation.mutate({ key: s.key, value: draft })}
                    className="bg-[#ff3b9d] hover:bg-[#ff3b9d]/90"
                  >
                    Save
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Translations Section */}
      <section className="space-y-4 rounded-xl border border-[#2a2438] bg-[#120e1e] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-[#ff3b9d]" />
            <h2 className="text-lg font-semibold text-white">Website Text ({rows.length})</h2>
          </div>
          <LangTabs value={lang} onChange={setLang} />
        </div>
        <p className="text-xs text-[#6f6880]">
          Editing {LANGS.find((l) => l.code === lang)?.label} translations.
        </p>
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {rows.map((s) => {
            const draft = drafts[s.key] ?? s.value;
            const dirty = draft !== s.value;
            const keyLabel = s.key.slice(lang.length + 1).replace(/_/g, " ");
            return (
              <div key={s.key} className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-[#9b93ad]">
                  {keyLabel}
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={draft}
                    onChange={(e) => setDrafts((d) => ({ ...d, [s.key]: e.target.value }))}
                    className="border-[#2a2438] bg-[#0d0a17] text-white"
                  />
                  <Button
                    size="sm"
                    disabled={!dirty || mutation.isPending}
                    onClick={() => mutation.mutate({ key: s.key, value: draft })}
                    className="bg-[#ff3b9d] hover:bg-[#ff3b9d]/90"
                  >
                    Save
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}