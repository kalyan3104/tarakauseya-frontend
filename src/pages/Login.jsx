import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timerId = window.setInterval(() => {
      setResendTimer((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [resendTimer]);

  const startResendCooldown = () => setResendTimer(60);

  const redirectAfterLogin = async () => {
    try {
      await base44.auth.me();
      navigate('/');
    } catch {
      navigate('/');
    }
  };

  useEffect(() => {
    const handleGoogleRedirect = async () => {
      if (!window.location.href.includes('access_token') && !window.location.href.includes('provider=google')) {
        return;
      }
      setLoading(true);
      const { data, error } = await supabase.auth.getSessionFromUrl();
      if (error) {
        setError(error.message || 'Google login failed');
        setLoading(false);
        return;
      }
      const accessToken = data?.session?.access_token;
      if (accessToken) {
        try {
          const result = await base44.auth.exchangeSupabaseToken(accessToken);
          if (result?.access_token) {
            base44.auth.setToken(result.access_token);
            window.history.replaceState(null, '', '/login');
            await redirectAfterLogin();
          }
        } catch (exchangeError) {
          setError(exchangeError?.message || 'Google login failed');
        }
      }
      setLoading(false);
    };
    handleGoogleRedirect();
  }, []);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.requestPhoneOtp(phone);
      setIsOtpSent(true);
      startResendCooldown();
    } catch (err) {
      setError(err?.message || 'Unable to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyPhoneOtp({ phone, otpCode });
      if (result?.access_token) {
        await redirectAfterLogin();
      }
    } catch (err) {
      setError(err?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setLoading(true);
    try {
      await base44.auth.resendPhoneOtp(phone);
      startResendCooldown();
    } catch (err) {
      setError(err?.message || 'Unable to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={Phone}
      title="Sign in with your phone"
      subtitle="Enter your Indian mobile number to receive a one-time code"
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {!isOtpSent ? (
        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full h-12 font-medium flex items-center justify-center gap-2"
            onClick={async () => {
              try {
                await base44.auth.signInWithGoogle();
              } catch (err) {
                setError(err?.message || 'Unable to sign in with Google');
              }
            }}
            disabled={loading}
          >
            <GoogleIcon className="w-5 h-5" />
            Continue with Google
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            Or continue with phone
            <span className="h-px flex-1 bg-border" />
          </div>
          <form onSubmit={handleSendCode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <div className="relative flex items-center gap-2">
              <span className="inline-flex items-center justify-center rounded-l-md border border-input bg-muted px-3 text-sm text-foreground">
                +91
              </span>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                autoFocus
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 rounded-l-none"
                required
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending code...
              </>
            ) : (
              "Send verification code"
            )}
          </Button>
        </form>
      </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              A verification code has been sent to {phone}.
            </p>
          </div>
          <div className="flex justify-center mb-4">
            <InputOTP
              maxLength={6}
              value={otpCode}
              onChange={setOtpCode}
              autoFocus
              autoComplete="one-time-code"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button
            className="w-full h-12 font-medium"
            onClick={handleVerify}
            disabled={loading || otpCode.length < 6}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify code"
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Didn't receive the code?{' '}
            <button
              onClick={handleResend}
              className="text-primary font-medium hover:underline"
              disabled={resendTimer > 0 || loading}
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend'}
            </button>
          </p>
        </div>
      )}
    </AuthLayout>
  );
}
