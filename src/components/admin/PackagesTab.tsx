import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { savePackage, deletePackage } from "@/lib/admin.functions";
import { EntityDialog, Field, LangTabs, langField, type LangCode } from "./EntityDialog";
import type { Tables } from "@/integrations/supabase/types";

type Package = Tables<"packages">;

const empty = {
  price: 0,
  old_price: 0,
  active: true,
  sort_order: 0,
  name: "",
  duration: "",
  badge: "",
  type: "",
  description: "",
  button: "BUY NOW",
};

export function PackagesTab({ packages }: { packages: Package[] }) {
  const qc = useQueryClient();
  const save = useServerFn(savePackage);
  const remove = useServerFn(deletePackage);
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<LangCode>("bn");
  const [form, setForm] = useState<Record<string, unknown>>({ ...empty });

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => save({ data: data as never }),
    onSuccess: () => {
      toast.success("Package saved");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-data"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Package deleted");
      qc.invalidateQueries({ queryKey: ["admin-data"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openNew() {
    setForm({ ...empty });
    setLang("bn");
    setOpen(true);
  }

  function openEdit(pkg: Package) {
    const { created_at: _created, ...rest } = pkg;
    const clean: Record<string, unknown> = {};
    Object.entries(rest).forEach(([k, v]) => {
      clean[k] = v ?? (["price", "old_price", "sort_order"].includes(k) ? 0 : "");
    });
    clean["active"] = pkg.active ?? true;
    setForm(clean);
    setLang("bn");
    setOpen(true);
  }

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));
  const str = (key: string) => String(form[key] ?? "");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Packages ({packages.length})</h2>
        <Button onClick={openNew} className="bg-[#ff3b9d] hover:bg-[#ff3b9d]/90">
          Add package
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {packages.map((p) => (
          <div key={p.id} className="rounded-xl border border-[#2a2438] bg-[#120e1e] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-medium text-white">{p.name}</h3>
                <p className="text-xs text-[#9b93ad]">{p.duration}</p>
                <p className="mt-1 text-sm text-[#ff3b9d]">
                  ৳{p.price}
                  {p.old_price ? <span className="ml-2 text-[#6f6880] line-through">৳{p.old_price}</span> : null}
                </p>
                <p className="mt-2 text-[11px] text-[#6f6880]">
                  {p.type || "—"} · order {p.sort_order} · {p.active ? "visible" : "hidden"}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <Button size="sm" variant="secondary" onClick={() => openEdit(p)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-400"
                  onClick={() => deleteMutation.mutate(p.id)}
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
        title={form["id"] ? "Edit package" : "New package"}
        saving={saveMutation.isPending}
        onSave={() =>
          saveMutation.mutate({
            ...form,
            price: Number(form["price"] ?? 0),
            old_price: Number(form["old_price"] ?? 0),
            sort_order: Number(form["sort_order"] ?? 0),
          })
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price" type="number" value={str("price")} onChange={(v) => set("price", v)} />
          <Field
            label="Old price"
            type="number"
            value={str("old_price")}
            onChange={(v) => set("old_price", v)}
          />
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
              id="pkg-active"
            />
            <Label htmlFor="pkg-active" className="text-xs text-[#9b93ad]">
              Visible
            </Label>
          </div>
        </div>

        <LangTabs value={lang} onChange={setLang} />
        <Field
          label="Name"
          value={str(langField("name", lang))}
          onChange={(v) => set(langField("name", lang), v)}
        />
        <Field
          label="Duration"
          value={str(langField("duration", lang))}
          onChange={(v) => set(langField("duration", lang), v)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Badge"
            value={str(langField("badge", lang))}
            onChange={(v) => set(langField("badge", lang), v)}
          />
          <Field
            label="Type"
            value={str(langField("type", lang))}
            onChange={(v) => set(langField("type", lang), v)}
          />
        </div>
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