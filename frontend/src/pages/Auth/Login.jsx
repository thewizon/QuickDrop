import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Truck } from "lucide-react";

import { loginUser } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { Field, Input, Button, Eyebrow } from "@/components/kit";
import AuthShell from "@/components/AuthShell";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data.token, res.data.user);
      navigate(`/${res.data.user.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="flex items-center gap-2 mb-8">
        <Truck className="text-accent" size={22} />
        <span className="font-display text-lg font-semibold">QuickDrop</span>
      </div>

      <Eyebrow>Manifest 001</Eyebrow>
      <h1 className="font-display text-3xl font-semibold">Sign in</h1>
      <p className="mt-1 text-sm text-ink-soft">Track and manage your shipments.</p>

      {error && (
        <p className="mt-4 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field label="Email">
          <Input type="email" name="email" required value={form.email} onChange={onChange} />
        </Field>
        <Field label="Password">
          <Input type="password" name="password" required value={form.password} onChange={onChange} />
        </Field>
        <Button variant="accent" type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        New here? <Link to="/register" className="text-accent font-medium hover:underline">Create an account</Link>
      </p>
    </AuthShell>
  );
}
