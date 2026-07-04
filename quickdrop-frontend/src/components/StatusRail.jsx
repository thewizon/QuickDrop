// The Waybill Rail — the one signature element of this app.
// A stamped-stop tracker standing in for plain status badges everywhere
// an order's status is shown: table rows, agent cards, tracking modal.

const STEPS = [
  { key: "created", label: "Created" },
  { key: "assigned", label: "Assigned" },
  { key: "picked_up", label: "Picked Up" },
  { key: "in_transit", label: "In Transit" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

const FLAGS = {
  failed: { label: "Failed", color: "var(--color-danger)" },
  rescheduled: { label: "Rescheduled", color: "var(--color-accent)" },
  cancelled: { label: "Cancelled", color: "var(--color-ink-soft)" },
};

export default function StatusRail({ status, compact = false }) {
  const flag = FLAGS[status];
  const stepIndex = STEPS.findIndex((s) => s.key === status);
  const activeIndex = stepIndex >= 0 ? stepIndex : STEPS.length - 1; // flags render after the rail

  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done = !flag && i <= activeIndex;
        const isLast = i === STEPS.length - 1;
        return (
          <div key={step.key} className="flex items-center">
            <div
              className="h-2.5 w-2.5 rounded-full border-2 shrink-0"
              style={{
                borderColor: done ? "var(--color-ink)" : "var(--color-line)",
                background: done ? "var(--color-ink)" : "transparent",
              }}
              title={step.label}
            />
            {!isLast && (
              <div
                className="h-[2px] w-4 sm:w-6"
                style={{ background: done && i < activeIndex ? "var(--color-ink)" : "var(--color-line)" }}
              />
            )}
          </div>
        );
      })}

      {flag && (
        <span
          className="ml-2 rounded-full px-2 py-0.5 text-xs font-medium font-mono"
          style={{ background: `color-mix(in srgb, ${flag.color} 15%, white)`, color: flag.color }}
        >
          {flag.label}
        </span>
      )}

      {!compact && !flag && (
        <span className="ml-2 text-xs font-mono text-ink-soft">
          {STEPS[activeIndex]?.label}
        </span>
      )}
    </div>
  );
}
