import { useEffect, useState } from "react";
import { MapPin, X } from "lucide-react";

import DashboardLayout from "@/layouts/DashboardLayout";
import StatusRail from "@/components/StatusRail";
import { Card, Field, Input, Select, Button, Eyebrow, Money } from "@/components/kit";
import { previewCharge, createOrder, getMyOrders, getOrderTracking } from "@/services/orderService";

const emptyForm = {
  pickupAddress: "", deliveryAddress: "", orderType: "B2C", paymentType: "Prepaid",
  length: "", breadth: "", height: "", actualWeight: "",
};

export default function CustomerDashboard() {
  const [tab, setTab] = useState("new");
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [tracking, setTracking] = useState(null);

  useEffect(() => {
    if (tab === "orders") getMyOrders().then((r) => setOrders(r.data.orders));
  }, [tab]);

  const onChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setPreview(null); };

  const handlePreview = async (e) => {
    e.preventDefault(); setError(""); setBusy(true);
    try { setPreview((await previewCharge(form)).data); }
    catch (err) { setError(err.response?.data?.message || err.message); }
    finally { setBusy(false); }
  };

  const handleConfirm = async () => {
    setBusy(true); setError("");
    try { await createOrder(form); setForm(emptyForm); setPreview(null); setTab("orders"); }
    catch (err) { setError(err.response?.data?.message || err.message); }
    finally { setBusy(false); }
  };

  const openTracking = async (order) => {
    setTracking({ order, history: [] });
    const res = await getOrderTracking(order._id);
    setTracking({ order, history: res.data.history });
  };

  return (
    <DashboardLayout
      tabs={[{ key: "new", label: "New Order" }, { key: "orders", label: "My Orders" }]}
      activeTab={tab} onTabChange={setTab}
    >
      {tab === "new" && (
        <div className="max-w-xl">
          <Eyebrow>Book a pickup</Eyebrow>
          <h1 className="font-display text-2xl font-semibold mb-6">New shipment</h1>

          {error && <p className="mb-4 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p>}

          <Card as="form" onSubmit={handlePreview} className="space-y-4">
            <Field label="Pickup address">
              <Input name="pickupAddress" required value={form.pickupAddress} onChange={onChange} placeholder="12 Andheri East, Mumbai" />
            </Field>
            <Field label="Delivery address">
              <Input name="deliveryAddress" required value={form.deliveryAddress} onChange={onChange} placeholder="45 Koramangala, Bangalore" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Order type">
                <Select name="orderType" value={form.orderType} onChange={onChange}>
                  <option value="B2C">B2C</option><option value="B2B">B2B</option>
                </Select>
              </Field>
              <Field label="Payment type">
                <Select name="paymentType" value={form.paymentType} onChange={onChange}>
                  <option value="Prepaid">Prepaid</option><option value="COD">COD</option>
                </Select>
              </Field>
            </div>
            <Field label="Dimensions, cm (L × B × H)">
              <div className="grid grid-cols-3 gap-3">
                <Input type="number" step="0.1" min="0.1" required name="length" placeholder="L" value={form.length} onChange={onChange} />
                <Input type="number" step="0.1" min="0.1" required name="breadth" placeholder="B" value={form.breadth} onChange={onChange} />
                <Input type="number" step="0.1" min="0.1" required name="height" placeholder="H" value={form.height} onChange={onChange} />
              </div>
            </Field>
            <Field label="Actual weight (kg)">
              <Input type="number" step="0.01" min="0.01" required name="actualWeight" value={form.actualWeight} onChange={onChange} />
            </Field>
            <Button variant="primary" type="submit" disabled={busy} className="w-full">
              {busy ? "Calculating..." : "Calculate charge"}
            </Button>
          </Card>

          {preview && (
            <Card className="mt-6 border-accent/40">
              <p className="flex items-center gap-1.5 text-sm text-ink-soft"><MapPin size={13} />
                {preview.pickupZone} → {preview.deliveryZone} · {preview.zoneType}-zone
              </p>
              <div className="mt-4 space-y-2 text-sm font-mono">
                <Row label="Volumetric weight" value={`${preview.volumetricWeight} kg`} />
                <Row label="Chargeable weight" value={`${preview.chargeableWeight} kg`} />
                <Row label="Base charge" value={<Money>{preview.baseCharge}</Money>} />
                <Row label="Weight charge" value={<Money>{(preview.pricePerKg * preview.chargeableWeight).toFixed(2)}</Money>} />
                {preview.codSurcharge > 0 && <Row label="COD surcharge" value={<Money>{preview.codSurcharge}</Money>} />}
                <Row label="Est. delivery" value={`${preview.estimatedDays} day(s)`} />
                <div className="flex justify-between border-t border-line pt-3 mt-1 text-base font-semibold text-ink">
                  <span className="font-sans">Total</span><Money>{preview.deliveryCharge}</Money>
                </div>
              </div>
              <Button variant="accent" onClick={handleConfirm} disabled={busy} className="w-full mt-5">
                Confirm &amp; book
              </Button>
            </Card>
          )}
        </div>
      )}

      {tab === "orders" && (
        <div>
          <h1 className="font-display text-2xl font-semibold mb-6">My orders</h1>
          {orders.length === 0 ? (
            <p className="text-ink-soft">No orders yet — book your first shipment above.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <Card key={o._id} className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-medium">{o.orderNumber}</p>
                    <p className="text-xs text-ink-soft mt-0.5">
                      {o.pickupZone?.zoneName} → {o.deliveryZone?.zoneName} · <Money>{o.deliveryCharge}</Money>
                    </p>
                  </div>
                  <StatusRail status={o.orderStatus} compact />
                  <button onClick={() => openTracking(o)} className="text-accent text-xs font-medium hover:underline">Track</button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tracking && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-paper max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-sm font-medium">{tracking.order.orderNumber}</p>
              <button onClick={() => setTracking(null)}><X size={18} /></button>
            </div>
            <ol className="space-y-4 border-l border-line pl-4">
              {tracking.history.map((h) => (
                <li key={h._id} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-accent" />
                  <p className="text-sm font-medium capitalize">{h.status.replace(/_/g, " ")}</p>
                  <p className="text-xs text-ink-soft">{h.note}</p>
                  <p className="font-mono text-[11px] text-ink-soft/70">
                    {new Date(h.createdAt).toLocaleString()} · {h.updatedBy?.name}
                  </p>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}

function Row({ label, value }) {
  return <div className="flex justify-between"><span className="text-ink-soft font-sans">{label}</span><span>{value}</span></div>;
}
