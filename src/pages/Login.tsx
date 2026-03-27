// Login Page - User sign-in form
// Simulated auth — accepts any credentials

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    const ok = await login(email, password);
    setLoading(false);
    if (ok) navigate("/");
    else setError("Invalid credentials. Please try again.");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Simple logo header */}
      <div className="bg-amazon-navy px-4 py-3 flex justify-center">
        <Link to="/" className="text-primary-foreground text-2xl font-bold">
          shop<span className="text-amazon-orange">kart</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-sm">
          <div className="bg-card border border-border rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-4">Sign in</h1>

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded p-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email or mobile phone number
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-amazon"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-amazon pr-10"
                    placeholder="At least 6 characters"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-amazon-primary w-full disabled:opacity-70"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="text-xs text-muted-foreground mt-4">
              By signing in, you agree to ShopKart's{" "}
              <span className="amazon-link">Conditions of Use</span> and{" "}
              <span className="amazon-link">Privacy Notice</span>.
            </p>

            <div className="relative my-4">
              <div className="border-t border-border" />
              <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-xs text-muted-foreground">
                New to ShopKart?
              </span>
            </div>

            <Link
              to="/signup"
              className="btn-amazon-outline w-full block text-center"
            >
              Create your ShopKart account
            </Link>
          </div>
        </div>
      </div>

      <footer className="text-center py-4 text-xs text-muted-foreground">
        © 2026 ShopKart, Inc.
      </footer>
    </div>
  );
};

export default Login;
