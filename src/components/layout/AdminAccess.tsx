import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { passwordLogin } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AdminAccess() {
  const navigate = useNavigate();
  const loginFn = useServerFn(passwordLogin);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginFn({ data: { password } });
      if (!res.success || !res.accessToken || !res.refreshToken) {
        throw new Error("Invalid password");
      }
      const { data: restored, error } = await supabase.auth.setSession({
        access_token: res.accessToken,
        refresh_token: res.refreshToken,
      });
      if (error) throw error;
      if (!restored.session) throw new Error("Login session could not be created");
      let persisted = null;
      for (let attempt = 0; attempt < 12 && !persisted; attempt += 1) {
        const { data: current } = await supabase.auth.getSession();
        persisted = current.session;
        if (!persisted) await new Promise((r) => setTimeout(r, 150));
      }
      if (!persisted) throw new Error("Login session could not be saved in this browser");
      setOpen(false);
      setPassword("");
      await navigate({ to: "/admin", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Admin login"
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#312747] px-3 py-1.5 text-[11px] text-[#8d86a0] transition-colors hover:text-white"
        >
          🔒 Admin
        </button>
      </DialogTrigger>
      <DialogContent className="border-[#2a2438] bg-[#120e1e] sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white">Admin Login</DialogTitle>
          <DialogDescription className="text-[#9b93ad]">
            Enter the admin password to open the panel.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-access-password" className="text-[#cfc9db]">Password</Label>
            <Input
              id="admin-access-password"
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
      </DialogContent>
    </Dialog>
  );
}
