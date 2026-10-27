import React from 'react';
import { Activity, AlertTriangle, BrainCircuit, CheckCircle2, Map, ShieldCheck } from 'lucide-react';

function StatusPill({ children, tone = 'emerald' }) {
  const tones = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    slate: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  };
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-bold ${tones[tone]}`}>{children}</span>;
}

export default function PravahaOverview({
  roads = [],
  shelters = [],
  disasters = [],
  apiConnected = false,
  activeRoute = null,
}) {
  const activeDisasters = disasters.filter((item) => item.status === 'APPROVED');
  const blockedRoads = roads.filter((road) => road.status?.toUpperCase() === 'BLOCKED').length;
  const highRiskRoads = roads.filter((road) => Number(road.blockage_probability) >= 0.5).length;

  const stages = [
    { label: 'Observe', detail: 'Road, shelter and incident feeds', icon: Activity, tone: apiConnected ? 'emerald' : 'amber' },
    { label: 'Predict', detail: 'Risk-weighted route scoring', icon: BrainCircuit, tone: roads.length ? 'emerald' : 'amber' },
    { label: 'Map', detail: 'Chennai network context', icon: Map, tone: roads.length ? 'emerald' : 'slate' },
    { label: 'Decide', detail: 'Admin review before alerts', icon: ShieldCheck, tone: disasters.length ? 'emerald' : 'slate' },
    { label: 'Alert', detail: 'Structured delivery workflow', icon: AlertTriangle, tone: activeDisasters.length ? 'amber' : 'slate' },
  ];

  return (
    <div className="space-y-md">
      <section className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 p-6 shadow-xl">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-md bg-sky-500/15 px-2 py-1 text-[10px] font-extrabold tracking-[0.2em] text-sky-300">PRAVAHA-X</span>
              <StatusPill tone={apiConnected ? 'emerald' : 'amber'}>{apiConnected ? 'LIVE DATA PATH' : 'DEMO / OFFLINE'}</StatusPill>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Urban flood intelligence for Chennai</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Observe → Predict → Map → Decide → Alert → Respond. This command view keeps model outputs,
              routing decisions, approvals, and limitations visible in one traceable workflow.
            </p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-4 text-sm text-slate-300">
            <div className="flex items-center gap-2 font-semibold text-slate-100"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Demonstration readiness</div>
            <p className="mt-1 text-xs text-slate-400">Use the other tabs to inspect each operational surface.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-md sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Active incidents', activeDisasters.length, 'Approved hazards', 'text-rose-400'],
          ['Blocked roads', blockedRoads, 'Confirmed closures', 'text-amber-300'],
          ['High-risk segments', highRiskRoads, 'Risk score ≥ 0.50', 'text-orange-300'],
          ['Shelters in registry', shelters.length, 'Check capacity before dispatch', 'text-emerald-400'],
        ].map(([label, value, detail, color]) => (
          <div key={label} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
            <p className={`mt-2 text-3xl font-extrabold ${color}`}>{value}</p>
            <p className="mt-1 text-xs text-slate-500">{detail}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-100">Decision trace</h3>
            <p className="text-xs text-slate-400">Every stage is labelled by what is implemented today.</p>
          </div>
          {activeRoute && <StatusPill>Route calculated</StatusPill>}
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          {stages.map(({ label, detail, icon: Icon, tone }) => (
            <div key={label} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
              <div className="mb-3 flex items-center justify-between">
                <Icon className="h-5 w-5 text-sky-300" />
                <StatusPill tone={tone}>{tone === 'emerald' ? 'READY' : tone === 'amber' ? 'REVIEW' : 'PLANNED'}</StatusPill>
              </div>
              <p className="text-sm font-bold text-slate-100">{label}</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-md lg:grid-cols-2">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <h3 className="font-bold text-amber-200">Post-flood health baseline</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            A transparent screening-priority indicator is available from the System Health view.
            It combines rainfall, flood duration, sanitation, water quality, and displacement inputs.
          </p>
          <p className="mt-3 text-xs font-semibold text-amber-300">Not a diagnosis, outbreak confirmation, or validated epidemic forecast.</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h3 className="font-bold text-slate-100">Evidence labels</h3>
          <ul className="mt-2 space-y-2 text-sm text-slate-300">
            <li><span className="font-semibold text-emerald-400">Implemented:</span> routing, incidents, road closures, shelter registry, alert review.</li>
            <li><span className="font-semibold text-amber-300">Baseline:</span> rule-based health-risk screening.</li>
            <li><span className="font-semibold text-slate-400">Future:</span> live weather, validated disease labels, external DNO simulation.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
