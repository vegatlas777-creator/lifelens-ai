import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Ruler } from 'lucide-react';
import { getTodayStr, formatDate } from '@/lib/dateUtils';

const inputCls = "w-full rounded-xl bg-[#F2F2F2] border border-[#E0E0E0] px-3 py-2.5 text-sm focus:outline-none focus:border-[#0A0A0A] text-[#0A0A0A]";

export default function MeasurementsTracker() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ chest_cm: '', waist_cm: '', hips_cm: '', arm_cm: '', thigh_cm: '' });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = await base44.entities.BodyMeasurement.list('-entry_date', 20);
      setEntries(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function addEntry() {
    const hasValue = Object.values(form).some((v) => v);
    if (!hasValue) return;
    setAdding(true);
    try {
      const payload = { entry_date: getTodayStr() };
      Object.keys(form).forEach((k) => { if (form[k]) payload[k] = parseFloat(form[k]); });
      await base44.entities.BodyMeasurement.create(payload);
      setForm({ chest_cm: '', waist_cm: '', hips_cm: '', arm_cm: '', thigh_cm: '' });
      await load();
    } catch (e) { console.error(e); }
    setAdding(false);
  }

  if (loading) return <div className="flex justify-center py-8"><Loader2 size={28} className="text-[#0A0A0A] animate-spin" /></div>;

  return (
    <div className="px-5 space-y-4">
      <div className="rounded-3xl bg-white border border-[#E0E0E0] shadow-sm shadow-black/5 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Ruler size={16} className="text-[#0A0A0A]" />
          <h3 className="text-sm font-bold text-[#0A0A0A] font-heading">Log Body Measurements (cm)</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Chest"><input type="number" step="0.1" value={form.chest_cm} onChange={(e) => setForm({ ...form, chest_cm: e.target.value })} placeholder="0" className={inputCls} /></Field>
          <Field label="Waist"><input type="number" step="0.1" value={form.waist_cm} onChange={(e) => setForm({ ...form, waist_cm: e.target.value })} placeholder="0" className={inputCls} /></Field>
          <Field label="Hips"><input type="number" step="0.1" value={form.hips_cm} onChange={(e) => setForm({ ...form, hips_cm: e.target.value })} placeholder="0" className={inputCls} /></Field>
          <Field label="Arm"><input type="number" step="0.1" value={form.arm_cm} onChange={(e) => setForm({ ...form, arm_cm: e.target.value })} placeholder="0" className={inputCls} /></Field>
          <Field label="Thigh"><input type="number" step="0.1" value={form.thigh_cm} onChange={(e) => setForm({ ...form, thigh_cm: e.target.value })} placeholder="0" className={inputCls} /></Field>
        </div>
        <button onClick={addEntry} disabled={adding} className="w-full mt-3 rounded-full bg-gradient-to-r from-[#171717] to-[#0A0A0A] text-white py-3 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-black/10">
          {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Save Measurements
        </button>
      </div>

      {entries.length > 0 ? (
        <div className="rounded-3xl bg-white border border-[#E0E0E0] shadow-sm shadow-black/5 p-5">
          <h3 className="text-sm font-bold text-[#0A0A0A] mb-3 font-heading">Measurement History</h3>
          <div className="space-y-3">
            {entries.map((e, i) => (
              <div key={e.id || i} className="rounded-xl bg-[#F2F2F2] p-3">
                <p className="text-xs font-medium text-[#737373] mb-2">{formatDate(e.entry_date)}</p>
                <div className="grid grid-cols-5 gap-1 text-center">
                  {['chest_cm', 'waist_cm', 'hips_cm', 'arm_cm', 'thigh_cm'].map((k) => (
                    <div key={k}>
                      <p className="text-[9px] text-[#A3A3A3] uppercase">{k.replace('_cm', '')}</p>
                      <p className="text-sm font-medium text-[#0A0A0A]">{e[k] ? `${e[k]}` : '—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#E0E0E0] p-8 text-center">
          <p className="text-sm text-[#737373]">No measurements logged yet.</p>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (<div><label className="text-[10px] font-medium text-[#737373] mb-1 block">{label}</label>{children}</div>);
}