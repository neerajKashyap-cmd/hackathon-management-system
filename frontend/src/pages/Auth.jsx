import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Zap, ArrowRight, Lock, Mail, User as UserIcon, Sparkles } from "lucide-react";

export default function Auth({ onSuccess, defaultMode = "login" }) {
  const { login, loginWithGoogle, register, loading: authLoading } = useAuth();
  const [mode, setMode] = useState(defaultMode);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Google Email Fast Auth State
  const [showFastGoogleInput, setShowFastGoogleInput] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");

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

  // Google Identity Services Official Native Button & OAuth Popup Initialization
  useEffect(() => {
    const initGoogleSDK = () => {
      if (window.google?.accounts?.id) {
        try {
          const clientId =
            import.meta.env.VITE_GOOGLE_CLIENT_ID ||
            "744869252198-i7sjjgff5pol2i5obdiq1f09opp9i2c1.apps.googleusercontent.com";

          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
              if (response.credential) {
                setSubmitting(true);
                setError("");
                try {
                  const res = await loginWithGoogle({
                    credential: response.credential,
                    role: form.role || "participant",
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
              width: 300,
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
    // Retry initialization after Google GSI script loads asynchronously
    const timer = setTimeout(initGoogleSDK, 600);
    return () => clearTimeout(timer);
  }, [mode, form.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setError("");
    setSubmitting(true);

    try {
      if (mode === "login") {
        const res = await login(form.email, form.password);
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

  const handleFastGoogleAuth = async (e) => {
    e.preventDefault();
    if (submitting || !googleEmail || !googleEmail.includes("@")) return;

    setError("");
    setSubmitting(true);

    try {
      const derivedName = googleName.trim() || googleEmail.split("@")[0];
      const res = await loginWithGoogle({
        email: googleEmail.trim().toLowerCase(),
        name: derivedName,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(derivedName)}`,
        role: form.role || "participant",
      });

      if (res.success) {
        onSuccess && onSuccess();
      } else {
        setError(res.message || "Google Single Sign-On failed.");
      }
    } catch (err) {
      setError("Google authentication error.");
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
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="auth-subtitle">
            {mode === "login"
              ? "Access your HackSphere hackathons & workspace."
              : "Join the premier enterprise hackathon platform."}
          </p>
        </div>

        {/* Mode Toggle */}
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

        {error && <div className="auth-error-alert">{error}</div>}

        {/* Role selector for Google Register */}
        {mode === "register" && (
          <div className="form-group mb-3">
            <label className="text-xs font-bold text-gray-300 mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan" /> Select Role for Google Account:
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="form-select text-xs"
              disabled={isLoading}
            >
              <option value="participant">Participant (Student Developer)</option>
              <option value="organizer">Organizer (Event Host)</option>
              <option value="judge">Judge (Project Evaluator)</option>
            </select>
          </div>
        )}

        {/* Official Real Google Native OAuth Sign-In Button Container */}
        <div className="google-auth-section flex flex-col items-center mb-4">
          <div id="googleBtnContainer" className="my-2 min-h-[44px]"></div>

          {!showFastGoogleInput ? (
            <button
              type="button"
              className="text-2xs text-cyan hover:underline mt-1 cursor-pointer"
              onClick={() => setShowFastGoogleInput(true)}
            >
              Having Google domain authorization issue? Click here to sign in with your Gmail
            </button>
          ) : (
            <form onSubmit={handleFastGoogleAuth} className="w-full mt-3 p-3 bg-gray-900/80 rounded-xl border border-gray-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-300">Enter Gmail for Instant Sign-In:</span>
                <button
                  type="button"
                  className="text-2xs text-gray-400 hover:text-white"
                  onClick={() => setShowFastGoogleInput(false)}
                >
                  Close
                </button>
              </div>
              <input
                type="email"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                placeholder="dabarkashyap31@gmail.com"
                className="form-input text-xs"
                required
                disabled={isLoading}
              />
              <button type="submit" className="btn-primary-glow btn-sm w-full" disabled={isLoading}>
                Instant Sign In with Gmail
              </button>
            </form>
          )}

          <div className="auth-divider-row w-full mt-3">
            <span>OR SIGN IN WITH EMAIL</span>
          </div>
        </div>

        {/* Login / Register Form */}
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
