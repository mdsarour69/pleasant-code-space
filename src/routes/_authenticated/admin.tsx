import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { BarChart3, Boxes, FileText, LayoutTemplate, LogOut, Package, Palette, Pencil, Plus, RefreshCw, Search, ShoppingCart, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  adminListAll, deleteAllOrders, deleteAllPackages, deleteAllServices, deleteOrder, deletePackage, deleteService,
  getMyRole, savePackage, saveService, saveSettings, updateOrderStatus,
} from "@/lib/admin.functions";
import { SITE_DEFAULTS } from "@/lib/site-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [
    { title: "Admin Panel — ITFair" },
    { name: "description", content: "Manage ITFair content, orders, structure and theme." },
    { property: "og:title", content: "Admin Panel — ITFair" },
    { property: "og:description", content: "Secure ITFair website management panel." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ]}),
  component: AdminPage,
});

type Order = Tables<"orders">;
type Service = Tables<"services">;
type Pkg = Tables<"packages">;
type Setting = Tables<"settings">;
type AdminData = { orders: Order[]; services: Service[]; packages: Pkg[]; settings: Setting[] };
type LangCode = "bn" | "en" | "ar" | "fr" | "pt";
const LANGS: { code: LangCode; label: string }[] = [
  { code: "bn", label: "বাংলা" }, { code: "en", label: "English" }, { code: "ar", label: "العربية" },
  { code: "fr", label: "Français" }, { code: "pt", label: "Português" },
];
const inputClass = "border-border bg-background text-foreground";
const panelClass = "rounded-md border border-border bg-surface p-4 sm:p-5";
const errorMessage = (error: unknown) => error instanceof Error ? error.message : "Request failed. Please try again.";
const fieldKey = (base: string, lang: LangCode) => lang === "bn" ? base : `${base}_${lang}`;

function AdminPage() {
  const navigate = useNavigate({ from: "/admin" });
  const qc = useQueryClient();
  const fetchRole = useServerFn(getMyRole);
  const fetchData = useServerFn(adminListAll);
  const [sessionReady, setSessionReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      setHasSession(!error && Boolean(data.user));
      setSessionReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setHasSession(false);
        setSessionReady(true);
        void navigate({ to: "/auth", replace: true });
        return;
      }
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        setHasSession(Boolean(session));
        setSessionReady(true);
      }
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [navigate]);

  const roleQuery = useQuery({ queryKey: ["my-role"], queryFn: () => fetchRole({}), enabled: sessionReady && hasSession, retry: 1, staleTime: 60_000 });
  const dataQuery = useQuery({ queryKey: ["admin-data"], queryFn: () => fetchData({}), enabled: roleQuery.data?.isAdmin === true, retry: 1, staleTime: 15_000 });

  const retry = async () => { await qc.invalidateQueries({ queryKey: ["my-role"] }); await qc.invalidateQueries({ queryKey: ["admin-data"] }); };
  if (!sessionReady || roleQuery.isPending || (roleQuery.data?.isAdmin && dataQuery.isPending)) return <StatusScreen title="Opening admin panel" detail="Checking your session and loading the latest website data…" />;
  if (!hasSession) return <StatusScreen title="Session expired" detail="Sign in again to continue." action={<Button asChild><Link to="/auth">Sign in</Link></Button>} />;
  if (roleQuery.isError || dataQuery.isError) return <StatusScreen title="Admin panel could not load" detail={errorMessage(roleQuery.error ?? dataQuery.error)} action={<div className="flex gap-2"><Button onClick={() => void retry()}><RefreshCw />Retry</Button><Button variant="outline" onClick={() => void supabase.auth.signOut()}>Sign in again</Button></div>} />;
  if (!roleQuery.data?.isAdmin) return <StatusScreen title="No admin access" detail="This account does not have permission to manage the website." action={<Button variant="outline" onClick={() => void supabase.auth.signOut()}>Sign out</Button>} />;
  if (!dataQuery.data) return <StatusScreen title="No website data" detail="Retry loading the management data." action={<Button onClick={() => void retry()}><RefreshCw />Retry</Button>} />;

  const data: AdminData = dataQuery.data;
  return (
    <main className="min-h-screen bg-background px-3 py-4 text-foreground sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div><p className="text-xs font-medium text-primary">WEBSITE CONTROL CENTER</p><h1 className="text-2xl font-bold">ITFair Admin</h1></div>
          <div className="flex gap-2"><Button variant="outline" asChild><Link to="/">View site</Link></Button><Button variant="ghost" onClick={() => void supabase.auth.signOut()}><LogOut />Sign out</Button></div>
        </header>
        <Tabs defaultValue="dashboard">
          <TabsList className="mb-5 flex h-auto w-full justify-start gap-1 overflow-x-auto bg-surface p-1.5">
            <AdminTab value="dashboard" icon={<BarChart3 />}>Dashboard</AdminTab><AdminTab value="orders" icon={<ShoppingCart />}>Orders</AdminTab>
            <AdminTab value="services" icon={<Boxes />}>Services</AdminTab><AdminTab value="packages" icon={<Package />}>Packages</AdminTab>
            <AdminTab value="content" icon={<FileText />}>Content</AdminTab><AdminTab value="structure" icon={<LayoutTemplate />}>Structure</AdminTab><AdminTab value="theme" icon={<Palette />}>Theme</AdminTab>
          </TabsList>
          <TabsContent value="dashboard"><Dashboard data={data} /></TabsContent>
          <TabsContent value="orders"><OrdersTab orders={data.orders} /></TabsContent>
          <TabsContent value="services"><ServicesTab services={data.services} /></TabsContent>
          <TabsContent value="packages"><PackagesTab packages={data.packages} /></TabsContent>
          <TabsContent value="content"><ContentTab settings={data.settings} /></TabsContent>
          <TabsContent value="structure"><StructureTab settings={data.settings} /></TabsContent>
          <TabsContent value="theme"><ThemeTab settings={data.settings} /></TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function AdminTab({ value, icon, children }: { value: string; icon: ReactNode; children: ReactNode }) { return <TabsTrigger value={value} className="gap-1.5 [&_svg]:size-3.5">{icon}{children}</TabsTrigger>; }
function StatusScreen({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) { return <main className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground"><div className="w-full max-w-md rounded-md border border-border bg-surface p-6"><h1 className="text-xl font-semibold">{title}</h1><p className="mt-2 text-sm text-muted-foreground">{detail}</p>{action ? <div className="mt-5">{action}</div> : <div className="mt-5 h-1 overflow-hidden rounded bg-border"><div className="h-full w-1/2 animate-pulse bg-primary" /></div>}</div></main>; }
function Dashboard({ data }: { data: AdminData }) { const stats = [["Orders", data.orders.length], ["Pending", data.orders.filter(o => o.status === "pending").length], ["Active services", data.services.filter(s => s.active).length], ["Active packages", data.packages.filter(p => p.active).length]]; return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value]) => <div className={panelClass} key={label}><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>)}</div>; }

function ConfirmAction({ title, description, children, onConfirm, disabled }: { title: string; description: string; children: ReactNode; onConfirm: () => void; disabled?: boolean }) { return <AlertDialog><AlertDialogTrigger asChild>{children}</AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{description}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction disabled={disabled} onClick={onConfirm}>Confirm</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>; }

function OrdersTab({ orders }: { orders: Order[] }) {
  const qc = useQueryClient(); const remove = useServerFn(deleteOrder); const removeAll = useServerFn(deleteAllOrders); const update = useServerFn(updateOrderStatus); const [filter, setFilter] = useState("all");
  const settle = () => qc.invalidateQueries({ queryKey: ["admin-data"] }); const fail = (e: unknown) => toast.error(errorMessage(e));
  const del = useMutation({ mutationFn: (id: string) => remove({ data: { id } }), onSuccess: () => { toast.success("Order deleted"); void settle(); }, onError: fail });
  const delAll = useMutation({ mutationFn: () => removeAll({}), onSuccess: () => { toast.success("All orders deleted"); void settle(); }, onError: fail });
  const status = useMutation({ mutationFn: ({ id, value }: { id: string; value: "pending" | "confirmed" | "done" | "cancelled" }) => update({ data: { id, status: value } }), onSuccess: () => { toast.success("Status updated"); void settle(); }, onError: fail });
  const visible = filter === "all" ? orders : orders.filter(o => o.status === filter);
  return <section className="space-y-4"><Toolbar title={`Orders (${orders.length})`}><Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent>{["all","pending","confirmed","done","cancelled"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select><ConfirmAction title="Delete all orders?" description="This cannot be undone." onConfirm={() => delAll.mutate()} disabled={delAll.isPending}><Button variant="destructive" disabled={!orders.length || delAll.isPending}><Trash2 />Delete all</Button></ConfirmAction></Toolbar>
    <div className="space-y-3">{visible.map(o => <article key={o.id} className={`${panelClass} flex flex-col justify-between gap-4 md:flex-row md:items-center`}><div><p className="font-semibold">{o.customer_name}</p><p className="text-sm text-muted-foreground">{o.phone}{o.note ? ` · ${o.note}` : ""}</p><p className="mt-1 text-xs text-muted-foreground">{o.created_at ? new Date(o.created_at).toLocaleString() : ""}</p></div><div className="flex items-center gap-2"><Select value={o.status ?? "pending"} onValueChange={value => status.mutate({ id: o.id, value: value as "pending" | "confirmed" | "done" | "cancelled" })}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent>{["pending","confirmed","done","cancelled"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select><ConfirmAction title="Delete this order?" description="This order will be permanently removed." onConfirm={() => del.mutate(o.id)}><Button size="icon" variant="ghost" aria-label="Delete order"><Trash2 /></Button></ConfirmAction></div></article>)}{!visible.length && <Empty text="No orders in this view." />}</div></section>;
}

function ServicesTab({ services }: { services: Service[] }) {
  const qc = useQueryClient(); const saveFn = useServerFn(saveService); const deleteFn = useServerFn(deleteService); const deleteAllFn = useServerFn(deleteAllServices); const [form, setForm] = useState<Partial<Service> | null>(null); const [lang, setLang] = useState<LangCode>("bn");
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-data"] }); const fail = (e: unknown) => toast.error(errorMessage(e));
  const save = useMutation({ mutationFn: (value: Record<string, unknown>) => saveFn({ data: value as never }), onSuccess: () => { toast.success("Service saved"); setForm(null); void refresh(); }, onError: fail });
  const del = useMutation({ mutationFn: (id: string) => deleteFn({ data: { id } }), onSuccess: () => { toast.success("Service deleted"); void refresh(); }, onError: fail });
  const delAll = useMutation({ mutationFn: () => deleteAllFn({}), onSuccess: () => { toast.success("All services deleted"); void refresh(); }, onError: fail });
  const submit = () => { if (!form?.title?.trim()) { toast.error("Bengali/default title is required"); return; } save.mutate({ id: form.id, icon: form.icon ?? "", gradient: form.gradient ?? "pink", active: form.active ?? true, sort_order: form.sort_order ?? 0, title: form.title, description: form.description ?? "", title_en: form.title_en ?? "", title_ar: form.title_ar ?? "", title_fr: form.title_fr ?? "", title_pt: form.title_pt ?? "", description_en: form.description_en ?? "", description_ar: form.description_ar ?? "", description_fr: form.description_fr ?? "", description_pt: form.description_pt ?? "" }); };
  return <section className="space-y-4"><Toolbar title={`Services (${services.length})`}><Button onClick={() => setForm({ icon: "🚀", gradient: "pink", active: true, sort_order: services.length, title: "" })}><Plus />Add service</Button><ConfirmAction title="Delete all services?" description="Every service will be removed." onConfirm={() => delAll.mutate()}><Button variant="destructive" disabled={!services.length}><Trash2 />Delete all</Button></ConfirmAction></Toolbar><div className="grid gap-3 sm:grid-cols-2">{services.map(s => <EntityCard key={s.id} title={`${s.icon ?? ""} ${s.title}`} subtitle={`${s.active ? "Active" : "Hidden"} · Order ${s.sort_order ?? 0}`} onEdit={() => setForm(s)} onDelete={() => del.mutate(s.id)} />)}</div>{!services.length && <Empty text="No services yet." />}
    <EntityDialog open={Boolean(form)} title={form?.id ? "Edit service" : "Add service"} onClose={() => setForm(null)} onSave={submit} saving={save.isPending}>{form && <><LangPicker value={lang} onChange={setLang} /><Field label="Title" value={String(form[fieldKey("title", lang) as keyof Service] ?? "")} onChange={v => setForm({ ...form, [fieldKey("title", lang)]: v })} /><Field label="Description" textarea value={String(form[fieldKey("description", lang) as keyof Service] ?? "")} onChange={v => setForm({ ...form, [fieldKey("description", lang)]: v })} /><div className="grid grid-cols-2 gap-3"><Field label="Icon" value={form.icon ?? ""} onChange={v => setForm({ ...form, icon: v })} /><Field label="Display order" type="number" value={String(form.sort_order ?? 0)} onChange={v => setForm({ ...form, sort_order: Number(v) })} /></div><Choice label="Gradient" value={form.gradient ?? "pink"} onChange={v => setForm({ ...form, gradient: v })} options={["pink","purple","blue"]} /><Toggle label="Visible on website" checked={form.active ?? true} onChange={active => setForm({ ...form, active })} /></>}</EntityDialog>
  </section>;
}

function PackagesTab({ packages }: { packages: Pkg[] }) {
  const qc = useQueryClient(); const saveFn = useServerFn(savePackage); const deleteFn = useServerFn(deletePackage); const deleteAllFn = useServerFn(deleteAllPackages); const [form, setForm] = useState<Partial<Pkg> | null>(null); const [lang, setLang] = useState<LangCode>("bn");
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-data"] }); const fail = (e: unknown) => toast.error(errorMessage(e));
  const save = useMutation({ mutationFn: (value: Record<string, unknown>) => saveFn({ data: value as never }), onSuccess: () => { toast.success("Package saved"); setForm(null); void refresh(); }, onError: fail });
  const del = useMutation({ mutationFn: (id: string) => deleteFn({ data: { id } }), onSuccess: () => { toast.success("Package deleted"); void refresh(); }, onError: fail }); const delAll = useMutation({ mutationFn: () => deleteAllFn({}), onSuccess: () => { toast.success("All packages deleted"); void refresh(); }, onError: fail });
  const submit = () => { if (!form?.name?.trim()) { toast.error("Bengali/default name is required"); return; } save.mutate({ id: form.id, price: form.price ?? 0, old_price: form.old_price ?? 0, active: form.active ?? true, sort_order: form.sort_order ?? 0, name: form.name, duration: form.duration ?? "", badge: form.badge ?? "", type: form.type ?? "", description: form.description ?? "", button: form.button ?? "BUY NOW", name_en: form.name_en ?? "", name_ar: form.name_ar ?? "", name_fr: form.name_fr ?? "", name_pt: form.name_pt ?? "", duration_en: form.duration_en ?? "", duration_ar: form.duration_ar ?? "", duration_fr: form.duration_fr ?? "", duration_pt: form.duration_pt ?? "", badge_en: form.badge_en ?? "", badge_ar: form.badge_ar ?? "", badge_fr: form.badge_fr ?? "", badge_pt: form.badge_pt ?? "", type_en: form.type_en ?? "", type_ar: form.type_ar ?? "", type_fr: form.type_fr ?? "", type_pt: form.type_pt ?? "", description_en: form.description_en ?? "", description_ar: form.description_ar ?? "", description_fr: form.description_fr ?? "", description_pt: form.description_pt ?? "" }); };
  return <section className="space-y-4"><Toolbar title={`Packages (${packages.length})`}><Button onClick={() => setForm({ name: "", price: 0, old_price: 0, active: true, sort_order: packages.length, button: "BUY NOW" })}><Plus />Add package</Button><ConfirmAction title="Delete all packages?" description="Every package will be removed." onConfirm={() => delAll.mutate()}><Button variant="destructive" disabled={!packages.length}><Trash2 />Delete all</Button></ConfirmAction></Toolbar><div className="grid gap-3 sm:grid-cols-2">{packages.map(p => <EntityCard key={p.id} title={p.name} subtitle={`${p.price} · ${p.active ? "Active" : "Hidden"} · Order ${p.sort_order ?? 0}`} onEdit={() => setForm(p)} onDelete={() => del.mutate(p.id)} />)}</div>{!packages.length && <Empty text="No packages yet." />}
    <EntityDialog open={Boolean(form)} title={form?.id ? "Edit package" : "Add package"} onClose={() => setForm(null)} onSave={submit} saving={save.isPending}>{form && <><LangPicker value={lang} onChange={setLang} />{["name","duration","badge","type","description"].map(base => <Field key={base} label={base} textarea={base === "description"} value={String(form[fieldKey(base, lang) as keyof Pkg] ?? "")} onChange={v => setForm({ ...form, [fieldKey(base, lang)]: v })} />)}<div className="grid grid-cols-2 gap-3"><Field label="Price" type="number" value={String(form.price ?? 0)} onChange={v => setForm({ ...form, price: Number(v) })} /><Field label="Old price" type="number" value={String(form.old_price ?? 0)} onChange={v => setForm({ ...form, old_price: Number(v) })} /></div><div className="grid grid-cols-2 gap-3"><Field label="Button text" value={form.button ?? ""} onChange={v => setForm({ ...form, button: v })} /><Field label="Display order" type="number" value={String(form.sort_order ?? 0)} onChange={v => setForm({ ...form, sort_order: Number(v) })} /></div><Toggle label="Visible on website" checked={form.active ?? true} onChange={active => setForm({ ...form, active })} /></>}</EntityDialog>
  </section>;
}

function ContentTab({ settings }: { settings: Setting[] }) {
  const [lang, setLang] = useState<LangCode>("bn"); const [search, setSearch] = useState("");
  const rows = settings.filter(s => s.key.startsWith(`${lang}.`) && s.key.toLowerCase().includes(search.toLowerCase())); const globals = settings.filter(s => !s.key.includes(".") && !s.key.startsWith("theme_") && !s.key.startsWith("show_") && !["layout_sections","service_grid","package_grid","content_width","spacing_density","corner_style","font_preset","button_style"].includes(s.key) && s.key.toLowerCase().includes(search.toLowerCase()));
  return <section className="space-y-4"><Toolbar title="Website content"><div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground"/><Input className={`${inputClass} pl-9`} placeholder="Search settings" value={search} onChange={e => setSearch(e.target.value)} /></div></Toolbar><SettingsEditor title="Brand, links & global values" rows={globals} /><div className={panelClass}><LangPicker value={lang} onChange={setLang} /></div><SettingsEditor title={`${LANGS.find(l => l.code === lang)?.label} content`} rows={rows} labelPrefix={`${lang}.`} /></section>;
}

const STRUCTURE_FIELDS = [
  { key: "layout_sections", label: "Section order", options: ["services,trial,packages,contact","services,packages,trial,contact","services,packages,contact,trial"] },
  { key: "service_grid", label: "Service columns", options: ["2","3","4"] }, { key: "package_grid", label: "Package columns", options: ["2","3","4"] },
  { key: "content_width", label: "Content width", options: ["compact","wide"] }, { key: "spacing_density", label: "Spacing", options: ["compact","comfortable"] },
  { key: "corner_style", label: "Corners", options: ["square","soft"] }, { key: "font_preset", label: "Font", options: ["regional","system"] }, { key: "button_style", label: "Buttons", options: ["square","pill"] },
];
function StructureTab({ settings }: { settings: Setting[] }) { const current = useMemo(() => Object.fromEntries(settings.map(s => [s.key, s.value])), [settings]); const initial = Object.fromEntries(Object.entries(SITE_DEFAULTS).filter(([k]) => k.startsWith("show_") || STRUCTURE_FIELDS.some(f => f.key === k)).map(([k,v]) => [k,current[k] ?? v])); const [draft, setDraft] = useState<Record<string,string>>(initial); return <SettingsBatch title="Safe website structure" values={draft} setValues={setDraft} reset={initial}><p className="text-sm text-muted-foreground">Show, hide and reorder sections using safe presets.</p><div className="grid gap-3 sm:grid-cols-2">{["services","trial","packages","contact"].map(name => <Toggle key={name} label={`Show ${name}`} checked={draft[`show_${name}`] !== "false"} onChange={v => setDraft({...draft,[`show_${name}`]:String(v)})} />)}{STRUCTURE_FIELDS.map(field => <Choice key={field.key} label={field.label} value={draft[field.key] ?? ""} options={field.options} onChange={v => setDraft({...draft,[field.key]:v})} />)}</div></SettingsBatch>; }
const COLORS = [{key:"theme_primary",label:"Primary"},{key:"theme_background",label:"Background"},{key:"theme_surface",label:"Surface"},{key:"theme_foreground",label:"Text"},{key:"theme_muted",label:"Muted text"},{key:"theme_border",label:"Border"}];
function ThemeTab({ settings }: { settings: Setting[] }) { const current = useMemo(() => Object.fromEntries(settings.map(s => [s.key, s.value])), [settings]); const initial = Object.fromEntries(COLORS.map(({key}) => [key,current[key] ?? SITE_DEFAULTS[key as keyof typeof SITE_DEFAULTS]])); const defaults = Object.fromEntries(COLORS.map(({key}) => [key,SITE_DEFAULTS[key as keyof typeof SITE_DEFAULTS]])); const [draft,setDraft] = useState<Record<string,string>>(initial); return <SettingsBatch title="Global theme" values={draft} setValues={setDraft} reset={defaults}><p className="text-sm text-muted-foreground">One theme updates the whole public website.</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{COLORS.map(c => <label key={c.key} className="space-y-2"><span className="text-sm font-medium">{c.label}</span><div className="flex gap-2"><Input type="color" className="h-10 w-14 border-border bg-background p-1" value={draft[c.key]} onChange={e => setDraft({...draft,[c.key]:e.target.value})}/><Input className={inputClass} value={draft[c.key]} onChange={e => setDraft({...draft,[c.key]:e.target.value})}/></div></label>)}</div></SettingsBatch>; }

function SettingsEditor({ title, rows, labelPrefix = "" }: { title: string; rows: Setting[]; labelPrefix?: string }) { const [draft,setDraft] = useState<Record<string,string>>({}); const values = Object.fromEntries(rows.map(s => [s.key,draft[s.key] ?? s.value])); return <SettingsBatch title={title} values={values} setValues={next => setDraft({...draft,...next})} reset={Object.fromEntries(rows.map(s => [s.key,s.value]))}><div className="grid gap-3 sm:grid-cols-2">{rows.map(s => <Field key={s.key} label={s.key.slice(labelPrefix.length).replaceAll("_"," ")} value={draft[s.key] ?? s.value} onChange={v => setDraft({...draft,[s.key]:v})} />)}</div>{!rows.length && <Empty text="No matching settings." />}</SettingsBatch>; }
function SettingsBatch({ title, values, setValues, reset, children }: { title: string; values: Record<string,string>; setValues: (v: Record<string,string>) => void; reset: Record<string,string>; children: ReactNode }) { const qc = useQueryClient(); const saveFn = useServerFn(saveSettings); const save = useMutation({ mutationFn: () => saveFn({data:{settings:Object.entries(values).map(([key,value]) => ({key,value}))}}), onSuccess: () => { toast.success("Settings saved"); void qc.invalidateQueries({queryKey:["admin-data"]}); void qc.invalidateQueries({queryKey:["translations"]}); }, onError: e => toast.error(errorMessage(e)) }); return <section className={panelClass}><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">{title}</h2><div className="flex gap-2"><Button variant="outline" onClick={() => setValues(reset)}>Reset</Button><Button disabled={save.isPending || !Object.keys(values).length} onClick={() => save.mutate()}>{save.isPending ? "Saving…" : "Save all"}</Button></div></div><div className="space-y-4">{children}</div></section>; }

function Toolbar({ title, children }: { title: string; children: ReactNode }) { return <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">{title}</h2><div className="flex flex-wrap gap-2">{children}</div></div>; }
function EntityCard({ title, subtitle, onEdit, onDelete }: { title: string; subtitle: string; onEdit: () => void; onDelete: () => void }) { return <article className={`${panelClass} flex items-center justify-between gap-3`}><div><p className="font-semibold">{title}</p><p className="mt-1 text-xs text-muted-foreground">{subtitle}</p></div><div className="flex gap-1"><Button variant="ghost" size="icon" aria-label="Edit" onClick={onEdit}><Pencil /></Button><ConfirmAction title="Delete this item?" description="This cannot be undone." onConfirm={onDelete}><Button variant="ghost" size="icon" aria-label="Delete"><Trash2 /></Button></ConfirmAction></div></article>; }
function EntityDialog({ open,title,onClose,onSave,saving,children }: { open:boolean; title:string; onClose:()=>void; onSave:()=>void; saving:boolean; children:ReactNode }) { return <Dialog open={open} onOpenChange={v => { if(!v) onClose(); }}><DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-surface text-foreground sm:max-w-xl"><DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader><div className="space-y-4">{children}<Button className="w-full" disabled={saving} onClick={onSave}>{saving ? "Saving…" : "Save changes"}</Button></div></DialogContent></Dialog>; }
function Field({ label,value,onChange,textarea=false,type="text" }: { label:string; value:string; onChange:(v:string)=>void; textarea?:boolean; type?:string }) { return <div className="space-y-1.5"><Label>{label}</Label>{textarea ? <Textarea className={inputClass} value={value} onChange={e=>onChange(e.target.value)} /> : <Input className={inputClass} type={type} value={value} onChange={e=>onChange(e.target.value)} />}</div>; }
function Toggle({ label,checked,onChange }: { label:string; checked:boolean; onChange:(v:boolean)=>void }) { return <div className="flex min-h-11 items-center justify-between rounded-md border border-border bg-background px-3"><Label>{label}</Label><Switch checked={checked} onCheckedChange={onChange}/></div>; }
function Choice({ label,value,onChange,options }: { label:string; value:string; onChange:(v:string)=>void; options:string[] }) { return <div className="space-y-1.5"><Label>{label}</Label><Select value={value} onValueChange={onChange}><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger><SelectContent>{options.map(o=><SelectItem key={o} value={o}>{o.replaceAll(",", " → ")}</SelectItem>)}</SelectContent></Select></div>; }
function LangPicker({ value,onChange }: { value:LangCode; onChange:(v:LangCode)=>void }) { return <div className="flex flex-wrap gap-1.5">{LANGS.map(l=><Button key={l.code} type="button" size="sm" variant={value===l.code?"default":"outline"} onClick={()=>onChange(l.code)}>{l.label}</Button>)}</div>; }
function Empty({ text }: { text:string }) { return <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{text}</div>; }
