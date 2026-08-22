import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { 
  adminListAll, getMyRole, 
  saveService, deleteService, 
  savePackage, deletePackage, 
  updateOrderStatus, deleteOrder, deleteAllOrders,
  saveSetting
} from "@/lib/admin.functions";
import { LayoutDashboard, ShoppingCart, Package, Settings, Star, Link2, Globe } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Tables } from "@/integrations/supabase/types";

// Types
type Order = Tables<"orders">;
type Service = Tables<"services">;
type Pkg = Tables<"packages">;
type Setting = Tables<"settings">;

// Constants & Helpers
const LANGS = [
  { code: "bn", label: "বাংলা" },
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
] as const;
type LangCode = (typeof LANGS)[number]["code"];
function langField(base: string, lang: LangCode) { return lang === "bn" ? base : `${base}_${lang}`; }

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — ITFair" },
      { name: "description", content: "Manage ITFair services, packages, orders and translations." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function Field({ label, value, onChange, textarea, type = "text" }: any) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-[#9b93ad]">{label}</Label>
      {textarea ? (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} className="border-[#2a2438] bg-[#0d0a17] text-white" />
      ) : (
        <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="border-[#2a2438] bg-[#0d0a17] text-white" />
      )}
    </div>
  );
}

function LangTabs({ value, onChange }: { value: LangCode; onChange: (l: LangCode) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {LANGS.map((l) => (
        <button key={l.code} type="button" onClick={() => onChange(l.code)} className={`rounded-full px-3 py-1 text-xs transition-colors ${value === l.code ? "bg-[#ff3b9d] text-white" : "border border-[#2a2438] text-[#9b93ad] hover:text-white"}`}>
          {l.label}
        </button>
      ))}
    </div>
  );
}

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchRole = useServerFn(getMyRole);
  const fetchData = useServerFn(adminListAll);
  
  const roleQuery = useQuery({ queryKey: ["my-role"], queryFn: () => fetchRole({}) });
  const dataQuery = useQuery({
    queryKey: ["admin-data"],
    queryFn: () => fetchData({}),
    enabled: roleQuery.data?.isAdmin === true,
  });

  if (roleQuery.isLoading || (roleQuery.data?.isAdmin && !dataQuery.data)) return <main className="min-h-screen bg-[#080512] px-4 py-8"><p className="text-sm text-[#9b93ad]">Loading...</p></main>;

  if (!roleQuery.data?.isAdmin) return (
    <main className="min-h-screen bg-[#080512] px-4 py-8">
      <div className="rounded-xl border border-[#2a2438] bg-[#120e1e] p-6 text-white">
        <h2 className="font-semibold">No admin access</h2>
      </div>
    </main>
  );

  const { orders, services, packages, settings } = dataQuery.data!;

  return (
    <main className="min-h-screen bg-[#080512] px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">ITFair Admin</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate({ to: "/" })}>View site</Button>
            <Button variant="ghost" onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/auth" }))}>Sign out</Button>
          </div>
        </header>

        <Tabs defaultValue="dashboard">
          <TabsList className="mb-6 bg-[#120e1e]">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="settings">Site text</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard"><DashboardTab orders={orders} services={services} packages={packages} /></TabsContent>
          <TabsContent value="orders"><OrdersTab orders={orders} /></TabsContent>
          <TabsContent value="services"><ServicesTab services={services} /></TabsContent>
          <TabsContent value="packages"><PackagesTab packages={packages} /></TabsContent>
          <TabsContent value="settings"><SettingsTab settings={settings} /></TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function DashboardTab({ orders, services, packages }: any) {
  const stats = [
    { label: "Total Orders", value: orders.length, icon: ShoppingCart, color: "text-blue-400" },
    { label: "Pending", value: orders.filter((o:any) => o.status === "pending").length, icon: Star, color: "text-yellow-400" },
    { label: "Active Services", value: services.filter((s:any) => s.active).length, icon: LayoutDashboard, color: "text-pink-400" },
    { label: "Active Packages", value: packages.filter((p:any) => p.active).length, icon: Package, color: "text-purple-400" },
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-[#2a2438] bg-[#120e1e] p-4 text-white">
            <div className="flex items-center gap-3">
              <s.icon size={20} className={s.color} />
              <div><p className="text-xs text-[#9b93ad]">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersTab({ orders }: { orders: Order[] }) {
  const qc = useQueryClient();
  const deleteOrderFn = useServerFn(deleteOrder);
  const deleteAllFn = useServerFn(deleteAllOrders);
  
  const delMutation = useMutation({ mutationFn: (id:string) => deleteOrderFn({data:{id}}), onSuccess: () => qc.invalidateQueries({queryKey:["admin-data"]}) });
  const delAllMutation = useMutation({ mutationFn: () => deleteAllFn({}), onSuccess: () => qc.invalidateQueries({queryKey:["admin-data"]}) });

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-white font-semibold">Orders ({orders.length})</h2>
        <Button variant="destructive" size="sm" onClick={() => delAllMutation.mutate()}>Delete All</Button>
      </div>
      {orders.map((o) => (
        <div key={o.id} className="rounded-lg border border-[#2a2438] bg-[#120e1e] p-4 text-white flex justify-between">
          <div><p className="font-bold">{o.customer_name}</p><p className="text-sm text-[#9b93ad]">{o.phone}</p></div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => delMutation.mutate(o.id)}>Delete</Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ServicesTab({ services }: { services: Service[] }) {
  const qc = useQueryClient();
  const save = useServerFn(saveService);
  const remove = useServerFn(deleteService);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ icon: "🚀", active: true, title: "" });
  const [lang, setLang] = useState<LangCode>("bn");

  const saveMut = useMutation({ mutationFn: (d:any) => save({data:d}), onSuccess: () => { setOpen(false); qc.invalidateQueries({queryKey:["admin-data"]}); } });
  const delMut = useMutation({ mutationFn: (id:string) => remove({data:{id}}), onSuccess: () => qc.invalidateQueries({queryKey:["admin-data"]}) });

  return (
    <div className="space-y-4">
      <Button onClick={() => setOpen(true)}>Add service</Button>
      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((s) => (
          <div key={s.id} className="rounded-xl border border-[#2a2438] bg-[#120e1e] p-4 text-white flex justify-between">
             <p>{s.title}</p>
             <Button variant="ghost" onClick={() => delMut.mutate(s.id)}>Delete</Button>
          </div>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#120e1e] border-[#2a2438] text-white">
          <DialogHeader><DialogTitle>Edit Service</DialogTitle></DialogHeader>
          <LangTabs value={lang} onChange={setLang} />
          <Field label="Title" value={form[langField("title", lang)]} onChange={(v:any) => setForm({...form, [langField("title", lang)]: v})} />
          <Button onClick={() => saveMut.mutate(form)}>Save</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PackagesTab({ packages }: { packages: Pkg[] }) {
  const qc = useQueryClient();
  const save = useServerFn(savePackage);
  const remove = useServerFn(deletePackage);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ price: 0, active: true, name: "" });
  const [lang, setLang] = useState<LangCode>("bn");
  
  const saveMut = useMutation({ mutationFn: (d:any) => save({data:d}), onSuccess: () => { setOpen(false); qc.invalidateQueries({queryKey:["admin-data"]}); } });
  const delMut = useMutation({ mutationFn: (id:string) => remove({data:{id}}), onSuccess: () => qc.invalidateQueries({queryKey:["admin-data"]}) });

  return (
    <div className="space-y-4">
      <Button onClick={() => setOpen(true)}>Add package</Button>
      <div className="grid gap-4 sm:grid-cols-2">
        {packages.map((p) => (
          <div key={p.id} className="rounded-xl border border-[#2a2438] bg-[#120e1e] p-4 text-white flex justify-between">
            <p>{p.name}</p>
            <Button variant="ghost" onClick={() => delMut.mutate(p.id)}>Delete</Button>
          </div>
        ))}
      </div>
       <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#120e1e] border-[#2a2438] text-white">
          <DialogHeader><DialogTitle>Edit Package</DialogTitle></DialogHeader>
          <LangTabs value={lang} onChange={setLang} />
          <Field label="Name" value={form[langField("name", lang)]} onChange={(v:any) => setForm({...form, [langField("name", lang)]: v})} />
          <Field label="Price" type="number" value={form.price} onChange={(v:any) => setForm({...form, price: Number(v)})} />
          <Button onClick={() => saveMut.mutate(form)}>Save</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SettingsTab({ settings }: { settings: Setting[] }) {
  const qc = useQueryClient();
  const save = useServerFn(saveSetting);
  const [lang, setLang] = useState<LangCode>("bn");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const mutation = useMutation({ mutationFn: (v:any) => save({data:v}), onSuccess: () => qc.invalidateQueries({queryKey:["admin-data"]}) });
  
  const rows = settings.filter((s) => s.key.startsWith(`${lang}.`));
  const globalLinks = settings.filter((s) => !s.key.includes("."));
  
  return (
    <div className="space-y-8 text-white">
      <section className="p-6 border border-[#2a2438] bg-[#120e1e] rounded-xl">
        <h2 className="text-lg font-semibold mb-4">Global Links</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {globalLinks.map((s) => (
             <div key={s.key} className="flex gap-2">
               <Input value={drafts[s.key] ?? s.value} onChange={(e) => setDrafts({...drafts, [s.key]: e.target.value})} className="bg-[#0d0a17]" />
               <Button onClick={() => mutation.mutate({key: s.key, value: drafts[s.key] ?? s.value})}>Save</Button>
             </div>
          ))}
        </div>
      </section>
      <section className="p-6 border border-[#2a2438] bg-[#120e1e] rounded-xl">
        <LangTabs value={lang} onChange={setLang} />
        <div className="grid gap-4 mt-4 sm:grid-cols-2">
           {rows.map((s) => (
             <div key={s.key} className="flex gap-2">
               <Input value={drafts[s.key] ?? s.value} onChange={(e) => setDrafts({...drafts, [s.key]: e.target.value})} className="bg-[#0d0a17]" />
               <Button onClick={() => mutation.mutate({key: s.key, value: drafts[s.key] ?? s.value})}>Save</Button>
             </div>
           ))}
        </div>
      </section>
    </div>
  );
}