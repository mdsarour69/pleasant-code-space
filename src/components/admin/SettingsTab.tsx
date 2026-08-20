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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Site text ({rows.length})</h2>
        <LangTabs value={lang} onChange={setLang} />
      </div>
      <p className="text-xs text-[#6f6880]">
        Editing {LANGS.find((l) => l.code === lang)?.label} translations.
      </p>
      <div className="space-y-2">
        {rows.map((s) => {
          const draft = drafts[s.key] ?? s.value;
          const dirty = draft !== s.value;
          return (
            <div key={s.key} className="flex flex-wrap items-center gap-2">
              <span className="w-56 shrink-0 truncate text-xs text-[#9b93ad]">
                {s.key.slice(lang.length + 1)}
              </span>
              <Input
                value={draft}
                onChange={(e) => setDrafts((d) => ({ ...d, [s.key]: e.target.value }))}
                className="min-w-0 flex-1 border-[#2a2438] bg-[#0d0a17] text-white"
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
          );
        })}
      </div>
    </div>
  );
}