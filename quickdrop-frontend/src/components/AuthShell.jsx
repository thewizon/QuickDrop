import StatusRail from "@/components/StatusRail";

// Shared shell for auth pages: a manifest-style hero panel + the form slot.
export default function AuthShell({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-paper">
      <div className="hidden lg:flex flex-col justify-center px-16 border-r border-line bg-paper-dim/60">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Last-mile delivery, tracked end to end</p>
        <h1 className="mt-3 font-display text-6xl font-semibold leading-[1.05] text-ink">
          Every parcel,
          <br />
          stamped &amp; seen.
        </h1>
        <p className="mt-6 max-w-md text-ink-soft">
          From pickup to doorstep — auto-priced by zone and weight, tracked
          stop by stop, with a record for every hand it passes through.
        </p>

        <div className="mt-14 max-w-sm">
          <StatusRail status="in_transit" />
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
