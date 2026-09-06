import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { getTodayStr, formatDate } from '@/lib/dateUtils';

export default function WeightTracker() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = await base44.entities.WeightEntry.list('-entry_date', 30);
      setEntries(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function addEntry() {
    if (!weight) return;
    setAdding(true);
    try {
      await base44.entities.WeightEntry.create({ weight_kg: parseFloat(weight), entry_date: getTodayStr(), notes });
      setWeight(''); setNotes('');
      await load();
    } catch (e) { console.error(e); }
    setAdding(false);
  }

  const chartData = [...entries].reverse().map((e) => ({ date: formatDate(e.entry_date), weight: e.weight_kg }));
  const latest = entries[0];
  const first = entries[entries.length - 1];
  const diff = latest && first ? +(latest.weight_kg - first.weight_kg).toFixed(1) : 0;
  const DiffIcon = diff < 0 ? TrendingDown : diff > 0 ? TrendingUp : Minus;
  const diffColor = diff < 0 ? 'text-emerald-500' : diff > 0 ? 'text-rose-500' : 'text-[#8A6A6A]';

  if (loading) return <div className="flex justify-center py-8"><Loader2 size={28} className="text-[#C87883] animate-spin" /></div>;

  return (
    <div className="px-5 space-y-4">
      {/* Add weight */}
      <div className="rounded-3xl bg-white border border-[#F0D5D5] shadow-sm shadow-rose-200/50 p-5">
        <h3 className="text-sm font-bold text-[#2D1E1E] mb-3 font-heading">Log New Weight</h3>
        <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Weight in kg" className="w-full rounded-xl bg-[#FDF2F2] border border-[#F0D5D5] px-3 py-2.5 text-sm focus:outline-none focus:border-[#C87883] text-[#2D1E1E] mb-2" />
        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" className="w-full rounded-xl bg-[#FDF2F2] border border-[#F0D5D5] px-3 py-2.5 text-sm focus:outline-none focus:border-[#C87883] text-[#2D1E1E] mb-3" />
        <button onClick={addEntry} disabled={adding || !weight} className="w-full rounded-full bg-gradient-to-r from-[#E89AA4] to-[#C87883] text-white py-3 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-rose-300/50">
          {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add Weight Entry
        </button>
      </div>

      {/* Summary */}
      {latest && first && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Current" value={`${latest.weight_kg} kg`} />
          <StatCard label="Starting" value={`${first.weight_kg} kg`} />
          <StatCard label="Change" value={`${diff > 0 ? '+' : ''}${diff} kg`} icon={DiffIcon} color={diffColor} />
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="rounded-3xl bg-white border border-[#F0D5D5] shadow-sm shadow-rose-200/50 p-5">
          <h3 className="text-sm font-bold text-[#2D1E1E] mb-3 font-heading">Weight Progress</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#B59A9A' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9, fill: '#B59A9A' }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F0D5D5', fontSize: 12 }} />
                <Line type="monotone" dataKey="weight" stroke="#C87883" strokeWidth={2.5} dot={{ r: 3, fill: '#C87883' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* History */}
      {entries.length > 0 && (
        <div className="rounded-3xl bg-white border border-[#F0D5D5] shadow-sm shadow-rose-200/50 p-5">
          <h3 className="text-sm font-bold text-[#2D1E1E] mb-3 font-heading">History</h3>
          <div className="space-y-2">
            {entries.map((e, i) => (
              <div key={e.id || i} className="flex items-center justify-between py-2 border-b border-[#F0D5D5] last:border-0">
                <div>
                  <p className="text-sm font-medium text-[#2D1E1E]">{e.weight_kg} kg</p>
                  <p className="text-xs text-[#8A6A6A]">{formatDate(e.entry_date)}{e.notes ? ` · ${e.notes}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#F0D5D5] p-8 text-center">
          <p className="text-sm text-[#8A6A6A]">No weight entries yet. Add your first entry above!</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl bg-white border border-[#F0D5D5] shadow-sm shadow-rose-200/50 p-3 text-center">
      <p className="text-[10px] text-[#8A6A6A] mb-1">{label}</p>
      <p className={`text-base font-bold ${color || 'text-[#2D1E1E]'} flex items-center justify-center gap-1`}>
        {Icon && <Icon size={12} />} {value}
      </p>
    </div>
  );
}