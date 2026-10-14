import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import PatientNav from "../../components/PatientNav.jsx";
import PageHero from "../../components/PageHero.jsx";
import Icon from "../../components/Icon.jsx";
import careImage from "../../assets/clinical-team.webp";
import { createHealthLog, deleteHealthLog, getHealthLogs, getPrescriptions } from "../../services/careService.js";

const tools = [
  { id: "vitals", label: "Vitals", icon: "heart" }, { id: "diary", label: "Health diary", icon: "records" },
  { id: "wellness", label: "Wellness", icon: "chart" }, { id: "vaccination", label: "Vaccines", icon: "shield" },
  { id: "prescriptions", label: "Prescriptions", icon: "pill" }, { id: "reminders", label: "Reminders", icon: "bell" },
];
const typesByTab = { vitals: ["blood_pressure", "blood_sugar", "weight", "bmi"], diary: ["diary", "mood"], wellness: ["water", "sleep"], vaccination: ["vaccination"] };
const labels = { blood_pressure: "Blood pressure", blood_sugar: "Blood sugar", weight: "Weight", bmi: "BMI", diary: "Diary entry", mood: "Mood", water: "Water intake", sleep: "Sleep", vaccination: "Vaccination" };
const units = { blood_pressure: "mmHg", blood_sugar: "mg/dL", weight: "kg", bmi: "kg/m²", water: "glasses", sleep: "hours", mood: "/10" };

export default function CareCenter() {
  const [tab, setTab] = useState("vitals");
  const [logs, setLogs] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [form, setForm] = useState({ type: "blood_pressure", value: "", secondaryValue: "", note: "" });
  const [loading, setLoading] = useState(true);
  const load = async () => {
    try { const [health, rx] = await Promise.all([getHealthLogs(), getPrescriptions()]); setLogs(health.data.logs); setPrescriptions(rx.data.prescriptions); }
    catch { toast.error("Could not load your health workspace"); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const visible = useMemo(() => logs.filter((log) => (typesByTab[tab] || []).includes(log.type)), [logs, tab]);
  const chooseTab = (id) => { setTab(id); const first = typesByTab[id]?.[0]; if (first) setForm({ type: first, value: "", secondaryValue: "", note: "" }); };
  const submit = async (e) => {
    e.preventDefault();
    try { const { data } = await createHealthLog({ ...form, value: form.value === "" ? undefined : Number(form.value), secondaryValue: form.secondaryValue === "" ? undefined : Number(form.secondaryValue), unit: units[form.type] }); setLogs((old) => [data.log, ...old]); setForm((old) => ({ ...old, value: "", secondaryValue: "", note: "" })); toast.success("Health entry saved"); }
    catch (error) { toast.error(error.response?.data?.message || "Could not save entry"); }
  };
  const remove = async (id) => { try { await deleteHealthLog(id); setLogs((old) => old.filter((x) => x._id !== id)); toast.success("Entry removed"); } catch { toast.error("Could not remove entry"); } };

  return <div className="min-h-screen bg-[#f4f9fa] dark:bg-gray-950"><PatientNav/><main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
    <PageHero image={careImage} eyebrow="Personal health hub" title="Your complete health workspace" description="Track everyday health, keep a care diary, review prescriptions and stay on top of reminders in one secure place."/>
    <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
      <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">{tools.map((item) => <button key={item.id} onClick={() => chooseTab(item.id)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${tab === item.id ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-gray-800"}`}><Icon name={item.icon} className="h-5 w-5"/>{item.label}</button>)}</aside>
      <section className="space-y-5">
        {tab === "prescriptions" ? <PrescriptionPanel items={prescriptions}/> : tab === "reminders" ? <ReminderPanel/> : <>
          <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-primary-700">New entry</p><h2 className="mt-1 text-xl font-extrabold">Record your {tools.find((x) => x.id === tab)?.label.toLowerCase()}</h2></div><Icon name={tools.find((x) => x.id === tab)?.icon}/></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Type<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">{typesByTab[tab].map((type) => <option key={type} value={type}>{labels[type]}</option>)}</select></label>
            {!['diary','vaccination'].includes(form.type) && <label className="text-sm font-bold">Value<input type="number" step="any" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800" placeholder={units[form.type]}/></label>}
            {form.type === "blood_pressure" && <label className="text-sm font-bold">Diastolic<input type="number" value={form.secondaryValue} onChange={(e) => setForm({ ...form, secondaryValue: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" placeholder="80"/></label>}
            <label className="text-sm font-bold sm:col-span-2">Note<textarea required={['diary','vaccination'].includes(form.type)} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800" placeholder="Add details, symptoms, observations or vaccine name"/></label></div>
            <button className="mt-4 rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white hover:bg-primary-700">Save entry</button></form>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"><h2 className="text-lg font-extrabold">Recent entries</h2>{loading ? <p className="mt-4 text-sm text-slate-500">Loading…</p> : visible.length === 0 ? <Empty text="No entries yet. Add your first entry above."/> : <div className="mt-4 divide-y divide-slate-100 dark:divide-gray-800">{visible.map((log) => <div key={log._id} className="flex items-start justify-between gap-4 py-4"><div><p className="font-bold">{labels[log.type]}</p><p className="mt-1 text-sm text-slate-500">{log.value ?? ""}{log.secondaryValue != null ? ` / ${log.secondaryValue}` : ""} {log.unit || ""} {log.note && `· ${log.note}`}</p><p className="mt-1 text-xs text-slate-400">{new Date(log.recordedAt).toLocaleString()}</p></div><button onClick={() => remove(log._id)} className="text-xs font-bold text-red-500">Remove</button></div>)}</div>}</div>
        </>}
      </section>
    </div>
  </main></div>;
}

function Empty({ text }) { return <div className="mt-5 rounded-2xl bg-slate-50 p-7 text-center text-sm text-slate-500 dark:bg-gray-800">{text}</div>; }
function PrescriptionPanel({ items }) { return <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"><p className="text-xs font-bold uppercase tracking-wider text-primary-700">Digital prescriptions</p><h2 className="mt-1 text-xl font-extrabold">Your medication plan</h2>{items.length === 0 ? <Empty text="No digital prescriptions have been issued yet."/> : <div className="mt-5 space-y-4">{items.map((rx) => <article key={rx._id} className="rounded-2xl border border-slate-200 p-5 dark:border-gray-700"><div className="flex justify-between"><div><h3 className="font-extrabold">{rx.diagnosis}</h3><p className="mt-1 text-xs text-slate-500">Dr. {rx.doctor?.name} · {new Date(rx.createdAt).toLocaleDateString()}</p></div><span className="h-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{rx.status}</span></div><ul className="mt-4 space-y-2">{rx.medicines.map((med, i) => <li key={i} className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-gray-800"><strong>{med.name}</strong> — {med.dosage} · {med.frequency} · {med.duration}</li>)}</ul>{rx.advice && <p className="mt-3 text-sm text-slate-500">Advice: {rx.advice}</p>}</article>)}</div>}</div>; }
function ReminderPanel() { const [items, setItems] = useState(() => JSON.parse(localStorage.getItem("mediai-reminders") || "[]")); const [text, setText] = useState(""); const save = (next) => { setItems(next); localStorage.setItem("mediai-reminders", JSON.stringify(next)); }; return <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"><p className="text-xs font-bold uppercase tracking-wider text-primary-700">Medication reminders</p><h2 className="mt-1 text-xl font-extrabold">Never miss a dose</h2><form onSubmit={(e) => { e.preventDefault(); if(text.trim()) { save([...items, { id: Date.now(), text, done: false }]); setText(""); } }} className="mt-5 flex gap-3"><input value={text} onChange={(e) => setText(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" placeholder="Metformin 500mg at 8:00 PM"/><button className="rounded-xl bg-primary-600 px-5 font-bold text-white">Add</button></form><div className="mt-5 space-y-3">{items.map((item) => <label key={item.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-gray-800"><input type="checkbox" checked={item.done} onChange={() => save(items.map((x) => x.id === item.id ? { ...x, done: !x.done } : x))}/><span className={item.done ? "text-slate-400 line-through" : "font-semibold"}>{item.text}</span><button onClick={() => save(items.filter((x) => x.id !== item.id))} className="ml-auto text-xs font-bold text-red-500">Delete</button></label>)}</div></div>; }
