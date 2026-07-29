import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Zap, Shield, UserCheck, Sparkles, Award, ArrowRight, Lock, Mail, User as UserIcon, KeyRound, CheckCircle2 } from "lucide-react";

export default function Auth({ onSuccess, defaultMode = "login" }) {
  const { login, register, verifyOTP, resendOTP, loading: authLoading } = useAuth();
  const [mode, setMode] = useState(defaultMode);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // OTP Verification State
  const [otpMode, setOtpMode] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "participant",
    bio: "",
    skills: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      if (mode === "login") {
        const res = await login(form.email, form.password);
        if (res.requiresOtp) {
          setOtpEmail(res.email);
          if (res.otpCode) {
            setOtpCode(res.otpCode);
          }
          setOtpMode(true);
          setSuccessMsg(res.message || "Enter the 6-digit OTP code below.");
        } else if (res.success) {
          onSuccess && onSuccess();
        } else {
          setError(res.message);
        }
      } else {
        const res = await register(form);
        if (res.requiresOtp) {
          setOtpEmail(res.email);
          if (res.otpCode) {
            setOtpCode(res.otpCode);
          }
          setOtpMode(true);
          setSuccessMsg(res.message || "Verification OTP code has been generated!");
        } else if (res.success) {
          onSuccess && onSuccess();
        } else {
          setError(res.message);
        }
      }
    } catch (err) {
      setError("An unexpected authentication error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setError("Please enter a valid 6-digit OTP code.");
      return;
    }

    setError("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      const res = await verifyOTP(otpEmail, otpCode);
      if (res.success) {
        onSuccess && onSuccess();
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Error verifying OTP code.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccessMsg("");
    setSubmitting(true);
    try {
      const res = await resendOTP(otpEmail);
      if (res.success) {
        if (res.otpCode) {
          setOtpCode(res.otpCode);
        }
        setSuccessMsg(res.message || "New OTP code generated!");
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Failed to resend OTP code.");
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = authLoading || submitting;

  return (
    <div className="auth-card-container">
      <div className="auth-card-glow"></div>
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-header text-center mb-6">
          <div className="brand-badge mx-auto mb-3">
            <Zap className="brand-badge-icon" />
          </div>
          <h2 className="auth-title">
            {otpMode ? "Verify Your Email" : mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="auth-subtitle">
            {otpMode
              ? `We sent a 6-digit verification code to ${otpEmail}`
              : mode === "login"
              ? "Access your HackSphere hackathons & workspace."
              : "Join the premier enterprise hackathon platform."}
          </p>
        </div>

        {/* Mode Toggle */}
        {!otpMode && (
          <div className="auth-tab-toggle">
            <button
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => setMode("login")}
              disabled={isLoading}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${mode === "register" ? "active" : ""}`}
              onClick={() => setMode("register")}
              disabled={isLoading}
            >
              Register
            </button>
          </div>
        )}

        {error && <div className="auth-error-alert">{error}</div>}
        {successMsg && <div className="auth-success-alert">{successMsg}</div>}

        {/* OTP Screen */}
        {otpMode ? (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <div className="form-group">
              <label><KeyRound className="input-icon" /> 6-Digit Email OTP Code</label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                style={{ textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.4em", fontWeight: 800 }}
                required
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="btn-primary-glow w-full lg mt-4" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="btn-spinner-sm"></span>
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify Email & Activate Account</span>
                  <CheckCircle2 className="btn-icon" />
                </>
              )}
            </button>

            <div className="flex justify-between items-center mt-4">
              <button
                type="button"
                className="btn-secondary-link"
                onClick={handleResendOtp}
                disabled={isLoading}
              >
                Resend OTP Email
              </button>
              <button
                type="button"
                className="btn-secondary-link text-cyan"
                onClick={() => setOtpMode(false)}
                disabled={isLoading}
              >
                Back to Sign In
              </button>
            </div>
          </form>
        ) : (
          /* Login / Register Forms */
          <form onSubmit={handleSubmit} className="auth-form">
            {mode === "register" && (
              <div className="form-group">
                <label><UserIcon className="input-icon" /> Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="form-group">
              <label><Mail className="input-icon" /> Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="developer@hackathon.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label><Lock className="input-icon" /> Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            {mode === "register" && (
              <>
                <div className="form-group">
                  <label><Sparkles className="input-icon" /> Select User Role</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="form-select"
                    disabled={isLoading}
                  >
                    <option value="participant">Participant (Student Developer)</option>
                    <option value="organizer">Organizer (Event Host)</option>
                    <option value="judge">Judge (Project Evaluator)</option>
                  </select>
                </div>

                {form.role === "participant" && (
                  <div className="form-group">
                    <label>Tech Skills (Comma-separated)</label>
                    <input
                      type="text"
                      name="skills"
                      value={form.skills}
                      onChange={handleChange}
                      placeholder="react,node,mongodb"
                      disabled={isLoading}
                    />
                  </div>
                )}
              </>
            )}

            <button type="submit" className="btn-primary-glow w-full lg mt-4" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="btn-spinner-sm"></span>
                  <span>Sending OTP Email...</span>
                </>
              ) : (
                <>
                  <span>{mode === "login" ? "Sign In to Workspace" : "Send OTP & Register"}</span>
                  <ArrowRight className="btn-icon" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
