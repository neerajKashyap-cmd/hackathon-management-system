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
          setOtpMode(true);
          setSuccessMsg(res.message || "Enter the 6-digit OTP sent to your email.");
        } else if (res.success) {
          onSuccess && onSuccess();
        } else {
          setError(res.message);
        }
      } else {
        const res = await register(form);
        if (res.requiresOtp) {
          setOtpEmail(res.email);
          setOtpMode(true);
          setSuccessMsg("Verification OTP code has been sent to your email!");
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
      const res = await verifyOTP(otpEmail, otpCode.trim());
      if (res.success) {
        onSuccess && onSuccess();
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("OTP verification failed. Please try again.");
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
        setSuccessMsg(res.message || "A new 6-digit OTP code has been sent to your email!");
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Failed to resend OTP code.");
    } finally {
      setSubmitting(false);
    }
  };

  // Demo Login Quick Fill for Evaluation
  const fillDemoUser = (role) => {
    setOtpMode(false);
    switch (role) {
      case "admin":
        setForm({ ...form, email: "admin@hackathon.com", password: "adminpassword123" });
        break;
      case "organizer":
        setForm({ ...form, email: "organizer@hackathon.com", password: "organizerpassword123" });
        break;
      case "judge":
        setForm({ ...form, email: "judge1@hackathon.com", password: "judgepassword123" });
        break;
      case "participant":
        setForm({ ...form, email: "participant1@hackathon.com", password: "participantpassword123" });
        break;
      default:
        break;
    }
    setMode("login");
  };

  const isLoading = submitting || authLoading;

  return (
    <div className="auth-page-container">
      <div className="auth-card-wrapper">
        <div className="auth-card-header">
          <div className="auth-brand">
            <Zap className="brand-icon" />
            <span>HACK<span className="brand-highlight">SPHERE</span></span>
          </div>
          <h2 className="auth-title">
            {otpMode
              ? "Verify Email Address"
              : mode === "login"
              ? "Welcome Back to HackSphere"
              : "Create Your Developer Account"}
          </h2>
          <p className="auth-subtitle">
            {otpMode
              ? `Enter the 6-digit OTP verification code sent to ${otpEmail}`
              : mode === "login"
              ? "Access your dashboard, manage teams, submit projects & score."
              : "Register to participate in top hackathons & build global projects."}
          </p>
        </div>

        {/* Demo Account Switcher Bar */}
        {!otpMode && (
          <div className="demo-switcher-bar">
            <span className="demo-label">⚡ Evaluation Demo Quick-Fill:</span>
            <div className="demo-buttons">
              <button type="button" className="demo-pill admin" onClick={() => fillDemoUser("admin")}>
                Admin
              </button>
              <button type="button" className="demo-pill organizer" onClick={() => fillDemoUser("organizer")}>
                Organizer
              </button>
              <button type="button" className="demo-pill judge" onClick={() => fillDemoUser("judge")}>
                Judge
              </button>
              <button type="button" className="demo-pill participant" onClick={() => fillDemoUser("participant")}>
                Participant
              </button>
            </div>
          </div>
        )}

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
          <form onSubmit={handleSubmit} className="auth-form">
            {mode === "register" && (
              <div className="form-group">
                <label><UserIcon className="input-icon" /> Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Neeraj Kashyap"
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
                placeholder="name@example.com"
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
                minLength={6}
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
                    <option value="organizer">Organizer (Host Hackathons)</option>
                    <option value="judge">Judge (Project Evaluator)</option>
                    <option value="admin">Platform Administrator</option>
                  </select>
                </div>

                {/* Only ask for Tech Skills if role is participant */}
                {form.role === "participant" && (
                  <div className="form-group">
                    <label>Tech Skills (Comma-separated)</label>
                    <input
                      type="text"
                      name="skills"
                      value={form.skills}
                      onChange={handleChange}
                      placeholder="React, Node.js, Python, AI, MongoDB"
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
                  <span>{mode === "login" ? "Authenticating..." : "Sending OTP Email..."}</span>
                </>
              ) : (
                <>
                  <span>{mode === "login" ? "Sign In to Platform" : "Create Account & Send OTP"}</span>
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
