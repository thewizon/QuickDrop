import { useEffect, useState } from "react";

import DashboardLayout from "@/layouts/DashboardLayout";
import StatusRail from "@/components/StatusRail";
import { Card, Button, Eyebrow, Money } from "@/components/kit";
import { getMyOrders, updateOrderStatus } from "@/services/orderService";
import { updateMyAgentStatus } from "@/services/agentService";

const NEXT = {
  assigned: ["picked_up", "failed"],
  picked_up: ["in_transit", "failed"],
  in_transit: ["out_for_delivery", "failed"],
  out_for_delivery: ["delivered", "failed"],
  rescheduled: ["picked_up", "failed"],
};

export default function AgentDashboard() {
  const [orders, setOrders] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [available, setAvailable] = useState(true);

  const load = () => getMyOrders().then((r) => setOrders(r.data.orders));
  useEffect(() => { load(); }, []);

  const advance = async (order, status) => {
    const failureReason = status === "failed" ? window.prompt("Reason for failed delivery?") || "Customer unavailable" : undefined;
    setBusyId(order._id);
    try { await updateOrderStatus(order._id, status, failureReason); await load(); }
    catch (err) { alert(err.response?.data?.message || err.message); }
    finally { setBusyId(null); }
  };

  const toggleAvailable = () => {
    const next = !available;
    setAvailable(next);
    updateMyAgentStatus({ isAvailable: next }).catch(console.error);
  };

  const active = orders.filter((o) => !["delivered", "cancelled"].includes(o.orderStatus));
  const done = orders.filter((o) => ["delivered", "cancelled"].includes(o.orderStatus));

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Eyebrow>Field ops</Eyebrow>
          <h1 className="font-display text-2xl font-semibold">My deliveries</h1>
        </div>
        <Button variant={available ? "accent" : "ghost"} onClick={toggleAvailable}>
          <span className={`h-1.5 w-1.5 rounded-full ${available ? "bg-white" : "bg-ink-soft"}`} />
          {available ? "Available" : "Unavailable"}
        </Button>
      </div>

      <p className="text-xs font-mono uppercase tracking-widest text-ink-soft mb-3">Active ({active.length})</p>
      {active.length === 0 ? (
        <p className="text-ink-soft mb-8">No active deliveries assigned right now.</p>
      ) : (
        <div className="space-y-3 mb-10">
          {active.map((o) => (
            <Card key={o._id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-sm font-medium">{o.orderNumber}</p>
                  <p className="text-sm text-ink-soft mt-1">Pickup: {o.pickupAddress}</p>
                  <p className="text-sm text-ink-soft">Deliver: {o.deliveryAddress}</p>
                  <p className="text-xs text-ink-soft mt-1 font-mono">
                    {o.paymentType === "COD" ? <>Collect <Money>{o.deliveryCharge}</Money> on delivery</> : "Prepaid"} · {o.orderType}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <StatusRail status={o.orderStatus} compact />
                  <div className="flex gap-2">
                    {(NEXT[o.orderStatus] || []).map((status) => (
                      <Button
                        key={status}
                        variant={status === "failed" ? "danger" : "primary"}
                        disabled={busyId === o._id}
                        onClick={() => advance(o, status)}
                        className="text-xs py-1.5 px-3"
                      >
                        {status.replace(/_/g, " ")}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs font-mono uppercase tracking-widest text-ink-soft mb-3">Completed ({done.length})</p>
      <div className="space-y-2">
        {done.map((o) => (
          <Card key={o._id} className="flex items-center justify-between py-3">
            <span className="font-mono text-sm">{o.orderNumber}</span>
            <StatusRail status={o.orderStatus} compact />
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
