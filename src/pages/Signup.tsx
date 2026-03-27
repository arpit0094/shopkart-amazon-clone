// Signup Page - New user registration form
// Simulated signup — creates a user in AuthContext and persists to localStorage

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = () => {
    if (password.length === 0) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score; // 0–5
  };

  const strength = passwordStrength();
  const strengthLabel = ["", "Very Weak", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = [
    "",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");
    const ok = await signup(name, email, password);
    setLoading(false);
    if (ok) {
      toast({ title: "Account Created!", description: `Welcome to ShopKart, ${name}!` });
      navigate("/");
    } else {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-amazon-navy px-4 py-3 flex justify-center">
        <Link to="/" className="text-primary-foreground text-2xl font-bold">
          shop<span className="text-amazon-orange">kart</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-sm">
          <div className="bg-card border border-border rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-4">Create account</h1>

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded p-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Your name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-amazon"
                  placeholder="First and last name"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
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
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password strength bar */}
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= strength ? strengthColor : "bg-border"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Password strength:{" "}
                      <span className="font-medium">{strengthLabel}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Benefits list */}
              <div className="text-xs text-muted-foreground space-y-1">
                {[
                  "Track your orders",
                  "Save items to your wishlist",
                  "Faster checkout",
                ].map((b) => (
                  <div key={b} className="flex items-center gap-1.5">
                    <Check size={12} className="text-amazon-teal" />
                    {b}
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-amazon-primary w-full disabled:opacity-70"
              >
                {loading ? "Creating account..." : "Create your ShopKart account"}
              </button>
            </form>

            <p className="text-xs text-muted-foreground mt-4">
              By creating an account, you agree to ShopKart's{" "}
              <span className="amazon-link">Conditions of Use</span> and{" "}
              <span className="amazon-link">Privacy Notice</span>.
            </p>

            <div className="relative my-4">
              <div className="border-t border-border" />
              <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-xs text-muted-foreground">
                Already have an account?
              </span>
            </div>

            <Link to="/login" className="btn-amazon-outline w-full block text-center">
              Sign in instead
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

export default Signup;
