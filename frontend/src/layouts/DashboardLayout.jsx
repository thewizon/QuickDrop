import { Truck, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ROLE_LABEL = { admin: "Admin", agent: "Delivery Agent", customer: "Customer" };

export default function DashboardLayout({ children, tabs, activeTab, onTabChange }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-10 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Truck className="text-accent" size={20} />
            <span className="font-display font-semibold">QuickDrop</span>
            <span className="ml-2 rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-xs text-accent">
              {ROLE_LABEL[user?.role]}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-ink-soft">{user?.name}</span>
            <button
              onClick={() => { logout(); navigate("/login"); }}
              className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-ink-soft hover:bg-paper-dim"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>

        {tabs && (
          <div className="mx-auto max-w-6xl px-6 flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => onTabChange(t.key)}
                className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                  activeTab === t.key ? "border-accent text-ink" : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
