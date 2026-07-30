import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Zap, ArrowRight, Lock, Mail, User as UserIcon, Sparkles, AlertCircle } from "lucide-react";

export default function Auth({ onSuccess, defaultMode = "login" }) {
  const { login, loginWithGoogle, register, loading: authLoading } = useAuth();
  const [mode, setMode] = useState(defaultMode);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  // Google Identity Services Official Native Button Initialization
  useEffect(() => {
    const initGoogleSDK = () => {
      if (window.google?.accounts?.id) {
        try {
          const clientId =
            import.meta.env.VITE_GOOGLE_CLIENT_ID ||
            "744869252198-m08d1ol7m9e2ru9vglg7jck9haucfkun.apps.googleusercontent.com";

          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
              if (response.credential) {
                if (mode === "register" && !form.role) {
                  setError("Mandatory: Please choose a role before registering with Google.");
                  return;
                }
                setSubmitting(true);
                setError("");
                try {
                  const res = await loginWithGoogle({
                    credential: response.credential,
                    role: form.role,
                  });
                  if (res.success) {
                    onSuccess && onSuccess();
                  } else {
                    setError(res.message || "Google Authentication failed");
                  }
                } catch (err) {
                  setError("Google sign-in error occurred.");
                } finally {
                  setSubmitting(false);
                }
              }
            },
          });

          // Render Official Google Native Sign-In Button
          const container = document.getElementById("googleBtnContainer");
          if (container) {
            container.innerHTML = "";
            window.google.accounts.id.renderButton(container, {
              theme: "filled_blue",
              size: "large",
              width: 320,
              text: mode === "register" ? "signup_with" : "continue_with",
              shape: "pill",
              logo_alignment: "left",
            });
          }
        } catch (err) {
          console.error("Google Identity initialization error:", err);
        }
      }
    };

    initGoogleSDK();
    const timer = setTimeout(initGoogleSDK, 600);
    return () => clearTimeout(timer);
  }, [mode, form.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (mode === "register" && !form.role) {
      setError("Role selection is mandatory for registration.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      if (mode === "login") {
        const res = await login(form.email, form.password, form.role);
        if (res.success) {
          onSuccess && onSuccess();
        } else {
          setError(res.message || "Invalid credentials");
        }
      } else {
        const res = await register(form);
        if (res.success) {
          onSuccess && onSuccess();
        } else {
          setError(res.message || "Registration failed");
        }
      }
    } catch (err) {
      setError("An unexpected authentication error occurred.");
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
        <div className="auth-header text-center mb-5">
          <div className="brand-badge mx-auto mb-3">
            <Zap className="brand-badge-icon" />
          </div>
          <h2 className="auth-title">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="auth-subtitle">
            {mode === "login"
              ? "Access your HackSphere hackathons & workspace."
              : "Join the premier enterprise hackathon platform."}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="auth-tab-toggle mb-5">
          <button
            type="button"
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => {
              setMode("login");
              setError("");
            }}
            disabled={isLoading}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => {
              setMode("register");
              setError("");
            }}
            disabled={isLoading}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="auth-error-alert mb-4 flex items-start gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Mandatory Role Selector for Registration */}
        {mode === "register" && (
          <div className="form-group mb-4 p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-xl">
            <label className="text-xs font-bold text-cyan-300 mb-1 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan" /> Mandatory Step 1: Select Your Role
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="form-select text-xs font-semibold text-center border-cyan-500/40"
              disabled={isLoading}
              required
            >
              <option value="participant">🚀 Participant (Student Developer)</option>
              <option value="organizer">🎪 Organizer (Event Host)</option>
              <option value="judge">⚖️ Judge (Project Evaluator)</option>
            </select>
          </div>
        )}

        {/* Official Real Google Native OAuth Button Container */}
        <div className="google-auth-section flex flex-col items-center mb-5">
          <div id="googleBtnContainer" className="my-1 min-h-[44px] flex justify-center"></div>

          <div className="auth-divider-row w-full mt-4">
            <span>OR CONTINUE WITH EMAIL</span>
          </div>
        </div>

        {/* Login / Register Form */}
        <form onSubmit={handleSubmit} className="auth-form space-y-4">
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

          {mode === "register" && form.role === "participant" && (
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

          <button
            type="submit"
            className="btn-primary-glow w-full lg mt-4 flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="btn-spinner-sm"></span>
                <span>{mode === "login" ? "Signing In..." : "Creating Account..."}</span>
              </>
            ) : (
              <>
                <span>{mode === "login" ? "Sign In to Workspace" : "Create Account & Get Started"}</span>
                <ArrowRight className="btn-icon" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
