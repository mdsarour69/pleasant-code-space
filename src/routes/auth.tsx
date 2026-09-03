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
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginFn({ data: { password } });
      if (!res.success || !res.email) throw new Error("Invalid password");
      const { error } = await supabase.auth.signInWithPassword({
        email: res.email,
        password,
      });
      if (error) throw error;
      const { data: verified, error: verificationError } = await supabase.auth.getUser();
      if (verificationError || !verified.user) throw new Error("Login session could not be verified");
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080512] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#2a2438] bg-[#120e1e] p-8">
        <h1 className="text-2xl font-bold text-white">ITFair Admin</h1>
        <p className="mt-1 text-sm text-[#9b93ad]">Enter the admin password to continue.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#cfc9db]">Password</Label>
            <Input
              id="password"
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-[#2a2438] bg-[#0d0a17] text-white"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-[#ff3b9d] hover:bg-[#ff3b9d]/90">
            {loading ? "Please wait…" : "Login"}
          </Button>
        </form>
      </div>
    </main>
  );
}
