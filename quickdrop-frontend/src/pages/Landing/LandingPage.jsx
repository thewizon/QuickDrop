import { Link } from "react-router-dom";
import { Truck, MapPinned, PackageCheck, ScanLine } from "lucide-react";

import { Button, Eyebrow } from "@/components/kit";
import StatusRail from "@/components/StatusRail";

const FEATURES = [
  { icon: ScanLine, title: "Auto-priced", body: "Volumetric weight, zone, and order type calculated the moment an address is entered." },
  { icon: MapPinned, title: "Zone-aware", body: "Pickup and drop zones are detected from the address — no manual zone picking." },
  { icon: PackageCheck, title: "Nearest agent", body: "Orders are auto-assigned to the closest available agent in the pickup zone." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper">
      <nav className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="text-accent" size={20} />
          <span className="font-display font-semibold">QuickDrop</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-ink-soft hover:text-ink">Sign in</Link>
          <Link to="/register"><Button variant="primary" className="text-sm py-2">Get started</Button></Link>
        </div>
      </nav>

      <header className="mx-auto max-w-6xl px-6 pt-16 pb-20 border-b border-line">
        <Eyebrow>Last-mile delivery, tracked end to end</Eyebrow>
        <h1 className="font-display text-5xl sm:text-6xl font-semibold leading-[1.05] max-w-2xl">
          Every parcel, stamped &amp; seen.
        </h1>
        <p className="mt-5 max-w-lg text-ink-soft">
          Book a pickup, watch the charge calculate itself, and follow the
          parcel stop by stop — from your dock to their door.
        </p>
        <div className="mt-8 flex gap-3">
          <Link to="/register"><Button variant="accent">Book a delivery</Button></Link>
          <Link to="/login"><Button variant="ghost">Sign in</Button></Link>
        </div>

        <div className="mt-14 max-w-md">
          <p className="font-mono text-xs text-ink-soft mb-2">QD-40213891 · Mumbai → Bangalore</p>
          <StatusRail status="out_for_delivery" />
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16 grid sm:grid-cols-3 gap-8">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title}>
            <Icon className="text-accent" size={22} />
            <h3 className="font-display font-semibold mt-3">{title}</h3>
            <p className="text-sm text-ink-soft mt-1.5">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
