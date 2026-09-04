import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const idSchema = z.object({ id: z.string().uuid() });

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) return { isAdmin: false };
    return { isAdmin: Boolean(data) };
  });

export const adminListAll = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase;
    const [services, packages, orders, settings] = await Promise.all([
      supabase.from("services").select("*").order("sort_order"),
      supabase.from("packages").select("*").order("sort_order"),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("settings").select("*").order("key"),
    ]);
    const err = services.error ?? packages.error ?? orders.error ?? settings.error;
    if (err) throw err;
    return {
      services: services.data ?? [],
      packages: packages.data ?? [],
      orders: orders.data ?? [],
      settings: settings.data ?? [],
    };
  });

const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  icon: z.string().max(16).default(""),
  gradient: z.string().max(32).default("pink"),
  active: z.boolean().default(true),
  sort_order: z.number().int().min(0).max(999).default(0),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).default(""),
  title_en: z.string().max(200).default(""),
  title_ar: z.string().max(200).default(""),
  title_fr: z.string().max(200).default(""),
  title_pt: z.string().max(200).default(""),
  description_en: z.string().max(1000).default(""),
  description_ar: z.string().max(1000).default(""),
  description_fr: z.string().max(1000).default(""),
  description_pt: z.string().max(1000).default(""),
});

export const saveService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => serviceSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { id, ...values } = data;
    const { error } = id
      ? await context.supabase.from("services").update(values).eq("id", id)
      : await context.supabase.from("services").insert([values]);
    if (error) throw error;
    return { success: true };
  });

export const deleteService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => idSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("services").delete().eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });

const packageSchema = z.object({
  id: z.string().uuid().optional(),
  price: z.number().int().min(0).max(10_000_000),
  old_price: z.number().int().min(0).max(10_000_000).default(0),
  active: z.boolean().default(true),
  sort_order: z.number().int().min(0).max(999).default(0),
  name: z.string().min(1).max(200),
  duration: z.string().max(200).default(""),
  badge: z.string().max(100).default(""),
  type: z.string().max(100).default(""),
  description: z.string().max(1000).default(""),
  button: z.string().max(100).default("BUY NOW"),
  name_en: z.string().max(200).default(""),
  name_ar: z.string().max(200).default(""),
  name_fr: z.string().max(200).default(""),
  name_pt: z.string().max(200).default(""),
  duration_en: z.string().max(200).default(""),
  duration_ar: z.string().max(200).default(""),
  duration_fr: z.string().max(200).default(""),
  duration_pt: z.string().max(200).default(""),
  badge_en: z.string().max(100).default(""),
  badge_ar: z.string().max(100).default(""),
  badge_fr: z.string().max(100).default(""),
  badge_pt: z.string().max(100).default(""),
  type_en: z.string().max(100).default(""),
  type_ar: z.string().max(100).default(""),
  type_fr: z.string().max(100).default(""),
  type_pt: z.string().max(100).default(""),
  description_en: z.string().max(1000).default(""),
  description_ar: z.string().max(1000).default(""),
  description_fr: z.string().max(1000).default(""),
  description_pt: z.string().max(1000).default(""),
});

export const savePackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => packageSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { id, ...values } = data;
    const { error } = id
      ? await context.supabase.from("packages").update(values).eq("id", id)
      : await context.supabase.from("packages").insert([values]);
    if (error) throw error;
    return { success: true };
  });

export const deletePackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => idSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("packages").delete().eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({ id: z.string().uuid(), status: z.enum(["pending", "confirmed", "done", "cancelled"]) })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });

export const deleteOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => idSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("orders").delete().eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });

export const deleteAllOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) throw error;
    return { success: true };
  });

export const deleteAllServices = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase.from("services").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) throw error;
    return { success: true };
  });

export const deleteAllPackages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase.from("packages").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) throw error;
    return { success: true };
  });

export const saveSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ key: z.string().min(1).max(120), value: z.string().max(2000) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("settings").upsert(data, { onConflict: "key" });
    if (error) throw error;
    return { success: true };
  });

export const saveSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({
      settings: z.array(z.object({ key: z.string().min(1).max(120), value: z.string().max(2000) })).min(1).max(300),
    }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("settings").upsert(data.settings, { onConflict: "key" });
    if (error) throw error;
    return { success: true, count: data.settings.length };
  });

const ADMIN_EMAIL = "admin@itfair.app";

export const passwordLogin = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ password: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const fallback = process.env['ADMIN_PASSWORD_FALLBACK'];
    if (!fallback || data.password !== fallback) {
      throw new Error("Invalid password");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Ensure a dedicated, confirmed admin account exists whose password is the master password.
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const existing = list?.users?.find((u) => u.email === ADMIN_EMAIL);

    let userId: string;
    if (existing) {
      userId = existing.id;
      const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: fallback,
        email_confirm: true,
      });
      if (updateUserError) throw new Error("Could not update the admin account");
    } else {
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: fallback,
        email_confirm: true,
      });
      if (createErr || !created?.user) throw new Error("Could not prepare admin account");
      userId = created.user.id;
    }

    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
    if (roleError) throw new Error("Could not grant admin access");

    const supabaseUrl = process.env['SUPABASE_URL'];
    const publishableKey = process.env['SUPABASE_PUBLISHABLE_KEY'] ?? process.env['SUPABASE_ANON_KEY'];
    if (!supabaseUrl || !publishableKey) throw new Error("Authentication is not configured");

    const { createClient } = await import("@supabase/supabase-js");
    const authClient = createClient(supabaseUrl, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: signedIn, error: signInError } = await authClient.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: fallback,
    });
    if (signInError || !signedIn.session) throw new Error("Could not create the admin session");

    return {
      success: true,
      accessToken: signedIn.session.access_token,
      refreshToken: signedIn.session.refresh_token,
    };
  });

