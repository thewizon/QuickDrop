import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

import DashboardLayout from "@/layouts/DashboardLayout";
import StatusRail from "@/components/StatusRail";
import { Card, Field, Input, Select, Button, Eyebrow, Money } from "@/components/kit";
import { getAdminDashboard } from "@/services/dashboardService";
import { getZones, createZone, deleteZone } from "@/services/zoneService";
import { getRateCards, createRateCard, deleteRateCard, getCodConfigs, setCodConfig } from "@/services/rateCardService";
import { getAgents, createAgent, updateAgentZone } from "@/services/agentService";
import { getAllOrders, assignAgent, autoAssign, updateOrderStatus } from "@/services/orderService";

const STATUSES = ["created", "assigned", "picked_up", "in_transit", "out_for_delivery", "delivered", "failed", "rescheduled", "cancelled"];

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  return (
    <DashboardLayout
      tabs={["overview", "zones", "rates", "agents", "orders"].map((k) => ({ key: k, label: k[0].toUpperCase() + k.slice(1) }))}
      activeTab={tab} onTabChange={setTab}
    >
      {tab === "overview" && <Overview />}
      {tab === "zones" && <Zones />}
      {tab === "rates" && <Rates />}
      {tab === "agents" && <Agents />}
      {tab === "orders" && <Orders />}
    </DashboardLayout>
  );
}

function Stat({ label, value }) {
  return <Card><p className="font-mono text-2xl font-semibold">{value ?? "–"}</p><p className="text-xs text-ink-soft mt-1">{label}</p></Card>;
}

function Overview() {
  const [s, setS] = useState(null);
  useEffect(() => { getAdminDashboard().then((r) => setS(r.data)); }, []);

  const chartData = s && [
    { name: "Assigned", count: s.assignedOrders },
    { name: "Picked up", count: s.pickedUpOrders },
    { name: "Delivered", count: s.deliveredOrders },
    { name: "Failed", count: s.failedOrders },
    { name: "Cancelled", count: s.cancelledOrders },
  ];

  return (
    <div>
      <Eyebrow>Operations</Eyebrow>
      <h1 className="font-display text-2xl font-semibold mb-6">Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat label="Total orders" value={s?.totalOrders} />
        <Stat label="Customers" value={s?.totalCustomers} />
        <Stat label="Agents" value={s?.totalAgents} />
        <Stat label="Revenue" value={s ? <Money>{s.totalRevenue}</Money> : null} />
        <Stat label="Assigned" value={s?.assignedOrders} />
        <Stat label="Picked up" value={s?.pickedUpOrders} />
        <Stat label="Delivered" value={s?.deliveredOrders} />
        <Stat label="Failed" value={s?.failedOrders} />
      </div>

      {chartData && (
        <Card>
          <p className="text-xs font-mono uppercase tracking-widest text-ink-soft mb-4">Orders by status</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid stroke="var(--color-line)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--color-ink-soft)" }} axisLine={{ stroke: "var(--color-line)" }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--color-ink-soft)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--color-paper)", border: "1px solid var(--color-line)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}

function Zones() {
  const [zones, setZones] = useState([]);
  const [form, setForm] = useState({ zoneName: "", areas: "" });
  const load = () => getZones().then((r) => setZones(r.data.zones));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await createZone({ zoneName: form.zoneName, areas: form.areas.split(",").map((a) => a.trim()).filter(Boolean) });
    setForm({ zoneName: "", areas: "" }); load();
  };

  return (
    <div>
      <Eyebrow>Coverage map</Eyebrow>
      <h1 className="font-display text-2xl font-semibold mb-6">Zones</h1>

      <Card as="form" onSubmit={submit} className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input required placeholder="Zone name — e.g. Mumbai Metro" value={form.zoneName} onChange={(e) => setForm({ ...form, zoneName: e.target.value })} />
        <Input required placeholder="Areas, comma separated" value={form.areas} onChange={(e) => setForm({ ...form, areas: e.target.value })} className="flex-[2]" />
        <Button variant="accent" type="submit">Add zone</Button>
      </Card>

      <div className="space-y-2">
        {zones.map((z) => (
          <Card key={z._id} className="flex items-center justify-between">
            <div><p className="font-medium">{z.zoneName}</p><p className="text-sm text-ink-soft">{z.areas.join(", ")}</p></div>
            <button onClick={async () => { if (confirm("Delete zone?")) { await deleteZone(z._id); load(); } }} className="text-danger"><Trash2 size={16} /></button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Rates() {
  const [rateCards, setRateCards] = useState([]);
  const [cods, setCods] = useState([]);
  const [rc, setRc] = useState({ orderType: "B2C", zoneType: "intra", baseCharge: "", pricePerKg: "", estimatedDays: "" });
  const [cod, setCod] = useState({ orderType: "B2C", surchargeAmount: "" });

  const load = () => { getRateCards().then((r) => setRateCards(r.data.rateCards)); getCodConfigs().then((r) => setCods(r.data)); };
  useEffect(() => { load(); }, []);

  const submitRc = async (e) => { e.preventDefault(); await createRateCard(rc); setRc({ ...rc, baseCharge: "", pricePerKg: "", estimatedDays: "" }); load(); };
  const submitCod = async (e) => { e.preventDefault(); await setCodConfig(cod); setCod({ ...cod, surchargeAmount: "" }); load(); };

  return (
    <div className="space-y-10">
      <div>
        <Eyebrow>Pricing engine</Eyebrow>
        <h1 className="font-display text-2xl font-semibold mb-6">Rate cards</h1>

        <Card as="form" onSubmit={submitRc} className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end mb-6">
          <Field label="Order type"><Select value={rc.orderType} onChange={(e) => setRc({ ...rc, orderType: e.target.value })}><option>B2C</option><option>B2B</option></Select></Field>
          <Field label="Zone type"><Select value={rc.zoneType} onChange={(e) => setRc({ ...rc, zoneType: e.target.value })}><option value="intra">Intra-zone</option><option value="inter">Inter-zone</option></Select></Field>
          <Field label="Base ₹"><Input required type="number" min="0" value={rc.baseCharge} onChange={(e) => setRc({ ...rc, baseCharge: e.target.value })} /></Field>
          <Field label="₹/kg"><Input required type="number" min="0" value={rc.pricePerKg} onChange={(e) => setRc({ ...rc, pricePerKg: e.target.value })} /></Field>
          <Field label="Est. days"><Input required type="number" min="1" value={rc.estimatedDays} onChange={(e) => setRc({ ...rc, estimatedDays: e.target.value })} /></Field>
          <Button variant="accent" type="submit">Save</Button>
        </Card>

        <div className="space-y-2">
          {rateCards.map((r) => (
            <Card key={r._id} className="flex items-center justify-between font-mono text-sm">
              <span>{r.orderType} · {r.zoneType}-zone</span>
              <span className="flex items-center gap-4">
                <Money>{r.baseCharge}</Money> base + <Money>{r.pricePerKg}</Money>/kg · {r.estimatedDays}d
                <button onClick={async () => { await deleteRateCard(r._id); load(); }} className="text-danger"><Trash2 size={14} /></button>
              </span>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold mb-4">COD surcharge</h2>
        <Card as="form" onSubmit={submitCod} className="flex flex-wrap gap-3 items-end mb-4 max-w-md">
          <Field label="Order type"><Select value={cod.orderType} onChange={(e) => setCod({ ...cod, orderType: e.target.value })}><option>B2C</option><option>B2B</option></Select></Field>
          <Field label="Surcharge ₹"><Input required type="number" min="0" value={cod.surchargeAmount} onChange={(e) => setCod({ ...cod, surchargeAmount: e.target.value })} /></Field>
          <Button variant="accent" type="submit">Save</Button>
        </Card>
        <div className="space-y-2 max-w-md">
          {cods.map((c) => <Card key={c._id} className="flex justify-between font-mono text-sm py-3"><span>{c.orderType}</span><Money>{c.surchargeAmount}</Money></Card>)}
        </div>
      </div>
    </div>
  );
}

function Agents() {
  const [agents, setAgents] = useState([]);
  const [zones, setZones] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", zone: "" });

  const load = () => { getAgents().then((r) => setAgents(r.data.agents)); getZones().then((r) => setZones(r.data.zones)); };
  useEffect(() => { load(); }, []);

  const submit = async (e) => { e.preventDefault(); await createAgent(form); setForm({ name: "", email: "", password: "", phone: "", zone: "" }); load(); };

  return (
    <div>
      <Eyebrow>Field roster</Eyebrow>
      <h1 className="font-display text-2xl font-semibold mb-6">Delivery agents</h1>

      <Card as="form" onSubmit={submit} className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end mb-6">
        <Input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input required type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Input required placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Select value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })}>
          <option value="">No zone</option>{zones.map((z) => <option key={z._id} value={z._id}>{z.zoneName}</option>)}
        </Select>
        <Button variant="accent" type="submit" className="col-span-2 md:col-span-1">Add agent</Button>
      </Card>

      <div className="space-y-2">
        {agents.map((a) => (
          <Card key={a._id} className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="font-medium">{a.name}</p><p className="text-sm text-ink-soft">{a.email} · {a.phone}</p></div>
            <div className="flex items-center gap-3">
              <span className={`font-mono text-xs px-2 py-0.5 rounded-full ${a.isAvailable ? "bg-success/10 text-success" : "bg-ink-soft/10 text-ink-soft"}`}>
                {a.isAvailable ? "Available" : "Unavailable"}
              </span>
              <Select defaultValue={a.zone?._id || ""} onChange={async (e) => { await updateAgentZone(a._id, e.target.value || null); load(); }}>
                <option value="">No zone</option>{zones.map((z) => <option key={z._id} value={z._id}>{z.zoneName}</option>)}
              </Select>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [zones, setZones] = useState([]);
  const [filters, setFilters] = useState({ status: "", zone: "", agent: "" });

  const load = () => {
    const active = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    getAllOrders(active).then((r) => setOrders(r.data.orders));
    getAgents().then((r) => setAgents(r.data.agents));
    getZones().then((r) => setZones(r.data.zones));
  };
  useEffect(() => { load(); }, [filters]);

  const doAssign = async (id, agentId) => { if (!agentId) return; await assignAgent(id, agentId); load(); };
  const doAuto = async (id) => { try { await autoAssign(id); load(); } catch (err) { alert(err.response?.data?.message || err.message); } };
  const doOverride = async (id, status) => { await updateOrderStatus(id, status); load(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div><Eyebrow>Manifest log</Eyebrow><h1 className="font-display text-2xl font-semibold">All orders</h1></div>
        <div className="flex gap-2">
          <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select value={filters.zone} onChange={(e) => setFilters({ ...filters, zone: e.target.value })}>
            <option value="">All zones</option>{zones.map((z) => <option key={z._id} value={z._id}>{z.zoneName}</option>)}
          </Select>
          <Select value={filters.agent} onChange={(e) => setFilters({ ...filters, agent: e.target.value })}>
            <option value="">All agents</option>{agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {orders.map((o) => (
          <Card key={o._id}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-mono text-sm font-medium">{o.orderNumber} <span className="text-ink-soft">· {o.customer?.name}</span></p>
                <p className="text-xs text-ink-soft mt-0.5">{o.pickupZone?.zoneName} → {o.deliveryZone?.zoneName}</p>
              </div>
              <StatusRail status={o.orderStatus} compact />
              <div className="flex items-center gap-2 flex-wrap">
                <Select defaultValue="" onChange={(e) => doAssign(o._id, e.target.value)}>
                  <option value="">Assign to…</option>{agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
                </Select>
                <Button variant="ghost" onClick={() => doAuto(o._id)} className="text-xs py-1.5 px-3">Auto-assign</Button>
                <Select value={o.orderStatus} onChange={(e) => doOverride(o._id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
