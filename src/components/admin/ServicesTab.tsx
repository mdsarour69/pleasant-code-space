import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { saveService, deleteService } from "@/lib/admin.functions";
import { EntityDialog, Field, LangTabs, langField, type LangCode } from "./EntityDialog";
import type { Tables } from "@/integrations/supabase/types";

type Service = Tables<"services">;

const empty = {
  icon: "🚀",
  gradient: "pink",
  active: true,
  sort_order: 0,
  title: "",
  description: "",
};

export function ServicesTab({ services }: { services: Service[] }) {
  const qc = useQueryClient();
  const save = useServerFn(saveService);
  const remove = useServerFn(deleteService);
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<LangCode>("bn");
  const [form, setForm] = useState<Record<string, unknown>>({ ...empty });

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => save({ data: data as never }),
    onSuccess: () => {
      toast.success("Service saved");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-data"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Service deleted");
      qc.invalidateQueries({ queryKey: ["admin-data"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openNew() {
    setForm({ ...empty });
    setLang("bn");
    setOpen(true);
  }

  function openEdit(service: Service) {
    const { created_at: _created, ...rest } = service;
    const clean: Record<string, unknown> = {};
    Object.entries(rest).forEach(([k, v]) => {
      clean[k] = v ?? (typeof empty[k as keyof typeof empty] === "number" ? 0 : "");
    });
    clean["active"] = service.active ?? true;
    clean["sort_order"] = service.sort_order ?? 0;
    setForm(clean);
    setLang("bn");
    setOpen(true);
  }

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));
  const str = (key: string) => String(form[key] ?? "");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Services ({services.length})</h2>
        <Button onClick={openNew} className="bg-[#ff3b9d] hover:bg-[#ff3b9d]/90">
          Add service
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {services.map((s) => (
          <div key={s.id} className="rounded-xl border border-[#2a2438] bg-[#120e1e] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-2xl">{s.icon}</div>
                <h3 className="mt-1 font-medium text-white">{s.title}</h3>
                <p className="mt-1 text-xs text-[#9b93ad]">{s.description}</p>
                <p className="mt-2 text-[11px] text-[#6f6880]">
                  order {s.sort_order} · {s.active ? "visible" : "hidden"}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <Button size="sm" variant="secondary" onClick={() => openEdit(s)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-400"
                  onClick={() => deleteMutation.mutate(s.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <EntityDialog
        open={open}
        onOpenChange={setOpen}
        title={form["id"] ? "Edit service" : "New service"}
        saving={saveMutation.isPending}
        onSave={() =>
          saveMutation.mutate({
            ...form,
            sort_order: Number(form["sort_order"] ?? 0),
          })
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Icon (emoji)" value={str("icon")} onChange={(v) => set("icon", v)} />
          <Field label="Gradient" value={str("gradient")} onChange={(v) => set("gradient", v)} />
          <Field
            label="Sort order"
            type="number"
            value={str("sort_order")}
            onChange={(v) => set("sort_order", v)}
          />
          <div className="flex items-end gap-2 pb-1">
            <Switch
              checked={Boolean(form["active"])}
              onCheckedChange={(v) => set("active", v)}
              id="svc-active"
            />
            <Label htmlFor="svc-active" className="text-xs text-[#9b93ad]">
              Visible
            </Label>
          </div>
        </div>

        <LangTabs value={lang} onChange={setLang} />
        <Field
          label="Title"
          value={str(langField("title", lang))}
          onChange={(v) => set(langField("title", lang), v)}
        />
        <Field
          label="Description"
          textarea
          value={str(langField("description", lang))}
          onChange={(v) => set(langField("description", lang), v)}
        />
      </EntityDialog>
    </div>
  );
}