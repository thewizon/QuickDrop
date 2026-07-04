import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Truck } from "lucide-react";

import { registerUser } from "@/services/authService";
import { Field, Input, Button, Eyebrow } from "@/components/kit";
import AuthShell from "@/components/AuthShell";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser({ ...form, role: "customer" });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed.");
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

      <Eyebrow>New account</Eyebrow>
      <h1 className="font-display text-3xl font-semibold">Create account</h1>
      <p className="mt-1 text-sm text-ink-soft">Book pickups and track deliveries.</p>

      {error && (
        <p className="mt-4 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field label="Full name">
          <Input name="name" required value={form.name} onChange={onChange} />
        </Field>
        <Field label="Email">
          <Input type="email" name="email" required value={form.email} onChange={onChange} />
        </Field>
        <Field label="Phone">
          <Input type="tel" name="phone" required value={form.phone} onChange={onChange} />
        </Field>
        <Field label="Password">
          <Input type="password" name="password" required minLength={6} value={form.password} onChange={onChange} />
        </Field>
        <Button variant="accent" type="submit" disabled={loading} className="w-full">
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Already registered? <Link to="/login" className="text-accent font-medium hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}
