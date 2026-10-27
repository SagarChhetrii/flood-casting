import React, { useEffect, useState } from 'react';
import { estimateHealthRisk, fetchHealthStatus } from '../services/api';
import { Activity, Database, GitBranch, Cpu, RefreshCw, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export default function HealthCheck() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskResult, setRiskResult] = useState(null);
  const [riskError, setRiskError] = useState(null);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const data = await fetchHealthStatus();
      setHealth(data);
    } catch (error) {
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  const runSampleHealthBaseline = async () => {
    setRiskLoading(true);
    setRiskError(null);
    try {
      const result = await estimateHealthRisk({
        rainfall_mm: 180,
        flood_duration_hours: 48,
        sanitation_disruption: 0.6,
        water_quality_concern: 0.5,
        displaced_population_ratio: 0.2,
      });
      setRiskResult(result);
    } catch (error) {
      setRiskError(error.message);
    } finally {
      setRiskLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (isOk) => {
    if (isOk) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" /> Ready
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <XCircle className="w-3.5 h-3.5" /> Offline
      </span>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sky-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Backend System Status</h2>
            <p className="text-xs text-slate-400">FastAPI REST Health Monitor</p>
          </div>
        </div>

        <button
          onClick={checkHealth}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-200 rounded-lg text-xs font-medium transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {health ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <span className="text-sm font-medium text-slate-300">API Connection</span>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${health.status === 'healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-sm font-semibold capitalize text-slate-200">{health.status}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-950/40 rounded-lg border border-slate-800/80 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-amber-400" /> SQLite Storage
                </span>
                {getStatusBadge(health.modules?.sqlite_connected)}
              </div>
              <p className="text-xs text-slate-500">Local Relational DB</p>
            </div>

            <div className="p-4 bg-slate-950/40 rounded-lg border border-slate-800/80 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <GitBranch className="w-4 h-4 text-cyan-400" /> NetworkX Routing
                </span>
                {getStatusBadge(health.modules?.networkx_available)}
              </div>
              <p className="text-xs text-slate-500">Graph Algorithmic Engine</p>
            </div>

            <div className="p-4 bg-slate-950/40 rounded-lg border border-slate-800/80 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-purple-400" /> scikit-learn ML
                </span>
                {getStatusBadge(health.modules?.scikit_learn_available)}
              </div>
              <p className="text-xs text-slate-500">Predictive Route ML</p>
            </div>
          </div>

          {health.timestamp && (
            <p className="text-[11px] text-slate-500 text-right pt-1">
              Last checked: {new Date(health.timestamp).toLocaleTimeString()}
            </p>
          )}

          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-sm font-semibold text-amber-200">Post-flood health baseline</h3>
                <p className="mt-1 text-xs text-slate-400">Transparent screening aid using documented sample inputs.</p>
              </div>
              <button
                onClick={runSampleHealthBaseline}
                disabled={riskLoading}
                className="rounded-lg bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/25 disabled:opacity-50"
              >
                {riskLoading ? 'Calculating...' : 'Run sample baseline'}
              </button>
            </div>
            {riskResult && (
              <div className="mt-4 grid gap-3 sm:grid-cols-[auto_1fr]">
                <div className="rounded-lg bg-slate-950/50 p-3 text-center">
                  <div className="text-2xl font-extrabold text-amber-300">{riskResult.score}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{riskResult.priority} priority</div>
                </div>
                <div className="text-xs leading-5 text-slate-300">
                  <p><span className="font-semibold text-slate-100">Indicator:</span> {riskResult.indicator} ({riskResult.horizon})</p>
                  <p><span className="font-semibold text-slate-100">Factors:</span> {riskResult.supporting_factors.join(', ')}</p>
                  <p className="mt-1 text-amber-300">{riskResult.limitations[0]}</p>
                </div>
              </div>
            )}
            {riskError && <p className="mt-3 text-xs text-rose-300">{riskError}</p>}
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-slate-400 text-sm">
          Checking backend health...
        </div>
      )}
    </div>
  );
}
