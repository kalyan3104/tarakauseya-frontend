import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { isAdminUser } from "@/lib/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Dev admin quick-login (only shown on localhost)
  const DEV_ADMIN_EMAIL = "kalyannchowdaryy@gmail.com";
  const DEV_ADMIN_PWD = "Kalyan@8899";
  const isDev = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await doLogin(email, password);
  };

  const redirectAfterLogin = async () => {
    try {
      const authenticatedUser = await base44.auth.me();
      const destination = isAdminUser(authenticatedUser) ? '/admin' : '/';
      window.location.href = destination;
    } catch {
      window.location.href = '/';
    }
  };

  const doLogin = async (emailToUse, passwordToUse) => {
    setError("");

    setLoading(true);
    try {
      const result = await base44.auth.loginViaEmailPassword(emailToUse, passwordToUse);
      if (result?.access_token) {
        await redirectAfterLogin();
      } else {
        throw new Error('Login failed');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", "/");
  };

  const ensureDevAdminAndLogin = async (emailToUse, passwordToUse) => {
    setError("");
    setLoading(true);

    try {
      const result = await base44.auth.loginViaEmailPassword(emailToUse, passwordToUse);
      if (result?.access_token) {
        await redirectAfterLogin();
        return;
      }
    } catch (err) {
      const message = err.message || '';
      if (!message.includes('Invalid email or password') && !message.includes('verified')) {
        setError(message);
        setLoading(false);
        return;
      }
    }

    let verificationCode = '000000';
    try {
      await base44.auth.register({ email: emailToUse, password: passwordToUse });
    } catch (err) {
      const message = err.message || '';
      if (!message.includes('An account already exists')) {
        setError(message);
        setLoading(false);
        return;
      }
    }

    try {
      const resendResult = await base44.auth.resendOtp(emailToUse);
      if (resendResult?.development_verification_code) {
        verificationCode = resendResult.development_verification_code;
      }
    } catch (_) {
      // If resend fails, we still try default dev code.
    }

    try {
      await base44.auth.verifyOtp({ email: emailToUse, otp_code: verificationCode });
    } catch (err) {
      const message = err.message || '';
      if (!message.includes('Invalid verification code')) {
        setError(message);
        setLoading(false);
        return;
      }
    }

    try {
      const result = await base44.auth.loginViaEmailPassword(emailToUse, passwordToUse);
      if (result?.access_token) {
        window.location.href = '/';
        return;
      }
      throw new Error('Dev admin login failed');
    } catch (err) {
      setError(err.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="Welcome back"
      subtitle="Log in to your account"
      footer={
        <>
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-primary font-medium hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Create one
          </Link>
        </>
      }
    >
      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-6"
        onClick={handleGoogle}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>

      {isDev && (
        <Button
          variant="ghost"
          className="w-full h-12 text-sm font-medium mb-4"
          onClick={() => ensureDevAdminAndLogin(DEV_ADMIN_EMAIL, DEV_ADMIN_PWD)}
        >
          Login as Admin (dev)
        </Button>
      )}

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">or</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging in...
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
