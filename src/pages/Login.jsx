import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/components/AuthLayout";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const script = document.getElementById("google-identity-script");
    if (!clientId || !script) return undefined;

    const initializeGoogleOneTap = async () => {
      if (!window.google?.accounts?.id) return;
      const rawNonce = crypto.randomUUID();
      const nonceBytes = new TextEncoder().encode(rawNonce);
      const nonceDigest = await crypto.subtle.digest("SHA-256", nonceBytes);
      const hashedNonce = Array.from(new Uint8Array(nonceDigest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
      window.google.accounts.id.initialize({
        client_id: clientId,
        nonce: hashedNonce,
        callback: async ({ credential }) => {
          setError("");
          setLoading(true);
          try {
            const result = await base44.auth.signInWithGoogleCredential(credential, rawNonce);
            if (result?.access_token) {
              const emailValue = (result?.user?.email || "").toLowerCase();
              const isAdmin = (result?.user?.role || "").toLowerCase() === "admin" || emailValue === "kalyan12.4st@gmail.com";
              window.location.href = isAdmin ? "/admin" : "/";
            }
          } catch (err) {
            setError(err?.message || "Google sign-in failed");
          } finally {
            setLoading(false);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      const buttonContainer = document.getElementById("google-one-tap-button");
      if (buttonContainer) {
        window.google.accounts.id.renderButton(buttonContainer, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: 368,
        });
      }
      window.google.accounts.id.prompt();
    };

    if (window.google?.accounts?.id) initializeGoogleOneTap();
    else script.addEventListener("load", initializeGoogleOneTap);

    return () => {
      script.removeEventListener("load", initializeGoogleOneTap);
      window.google?.accounts?.id?.cancel();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.signInWithEmail({ email, password });
      if (result?.access_token) {
        const emailValue = (result?.user?.email || '').toLowerCase();
        const isAdmin = (result?.user?.role || '').toLowerCase() === 'admin' || emailValue === 'kalyan12.4st@gmail.com';
        window.location.href = isAdmin ? '/admin' : '/';
      }
    } catch (err) {
      setError(err?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign in" subtitle="Sign in with your email and password">
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}
      <div id="google-one-tap-button" className="mb-6 flex justify-center" />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
      <p className="text-sm text-center text-muted-foreground mt-4">
        Don't have an account? <Link to="/register" className="text-primary font-medium">Create one</Link>
      </p>
    </AuthLayout>
  );
}