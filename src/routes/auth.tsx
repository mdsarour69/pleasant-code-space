import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { passwordLogin } from "@/lib/admin.functions";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Sign In — ITFair" },
      { name: "description", content: "Sign in to the ITFair admin panel to manage services, packages and orders." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Sign In — ITFair" },
      { property: "og:description", content: "Secure sign in for the ITFair management panel." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const loginFn = useServerFn(passwordLogin);
  const [mode, setMode] = useState<"signin" | "signup" | "password">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "password") {
        const res = await loginFn({ data: { password } });
        if (res.success) {
          toast.info("Password correct. Please sign in with your admin email.");
          setMode("signin");
        }
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin", replace: true });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Account created. You can sign in now.");
        setMode("signin");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080512] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#2a2438] bg-[#120e1e] p-8">
        <h1 className="text-2xl font-bold text-white">ITFair Admin</h1>
        <p className="mt-1 text-sm text-[#9b93ad]">
          {mode === "signin" ? "Sign in to manage your site" : mode === "signup" ? "Create an admin account" : "Enter the admin password to continue"}
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode !== "password" && (
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#cfc9db]">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-[#2a2438] bg-[#0d0a17] text-white"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#cfc9db]">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-[#2a2438] bg-[#0d0a17] text-white"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-[#ff3b9d] hover:bg-[#ff3b9d]/90">
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Sign up" : "Verify Password"}
          </Button>
        </form>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="w-full text-sm text-[#9b93ad] underline-offset-4 hover:underline"
          >
            {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "password" ? "signin" : "password")}
            className="w-full text-[10px] text-[#6f6880] underline-offset-4 hover:underline"
          >
            {mode === "password" ? "Use email/password" : "Master password fallback"}
          </button>
        </div>
      </div>
    </main>
  );
}