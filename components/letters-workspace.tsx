'use client'

import { useMemo, useRef, useState } from 'react'
import {
  Archive,
  ArrowDownToLine,
  Bell,
  Check,
  ChevronDown,
  ClipboardCheck,
  FileCheck2,
  FilePenLine,
  FilePlus2,
  FileSignature,
  FileText,
  Filter,
  History,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  PackageCheck,
  Pencil,
  Printer,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Stamp,
  Tag,
  UserRound,
  X,
} from 'lucide-react'

const navItems = [
  { label: 'Overview', amharic: 'አጠቃላይ እይታ', icon: LayoutDashboard },
  { label: 'Requisitions', amharic: 'የደብዳቤ ጥያቄዎች', icon: FilePlus2, count: 12 },
  { label: 'Approvals', amharic: 'ማጽደቂያ', icon: ClipboardCheck, count: 4 },
  { label: 'Templates', amharic: 'አብነቶች', icon: FilePenLine },
  { label: 'Letter editor', amharic: 'የደብዳቤ አርታዒ', icon: Pencil },
  { label: 'Issued letters', amharic: 'የተሰጡ ደብዳቤዎች', icon: Stamp },
  { label: 'Verification', amharic: 'ማረጋገጫ', icon: ShieldCheck },
  { label: 'Archive', amharic: 'ማህደር', icon: Archive },
  { label: 'Print audit', amharic: 'የህትመት ኦዲት', icon: History },
]

const templates = [
  { name: 'Employment confirmation', lang: 'English', org: 'FCSC', version: 'v3', status: 'Active', uses: 182 },
  { name: 'የሥራ ማረጋገጫ', lang: 'Amharic', org: 'FCSC', version: 'v4', status: 'Active', uses: 96 },
  { name: 'Salary confirmation', lang: 'English', org: 'All organisations', version: 'v2', status: 'Active', uses: 74 },
  { name: 'Employment letter', lang: 'Afaan Oromoo', org: 'FCSC', version: 'v1', status: 'Draft', uses: 0 },
]

const initialRequests = [
  { id: 'LET-2026-00125', title: 'Employment confirmation', employee: 'Mekdes Abebe', org: 'FCSC', date: '25 Sep 2026', status: 'Ready to issue' },
  { id: 'LET-2026-00124', title: 'Salary confirmation', employee: 'Samuel Tadesse', org: 'FCSC', date: '24 Sep 2026', status: 'Pending review' },
  { id: 'LET-2026-00123', title: 'Service letter', employee: 'Hana Bekele', org: 'Ministry of Finance', date: '23 Sep 2026', status: 'Generated' },
  { id: 'LET-2026-00122', title: 'Employment confirmation', employee: 'Dawit Girma', org: 'FCSC', date: '22 Sep 2026', status: 'Returned' },
]

const auditEvents = [
  { event: 'Letter generated', actor: 'System · template v3', time: '25 Sep 2026 · 10:15', icon: Sparkles, tone: 'bg-primary/10 text-primary' },
  { event: 'Preview opened', actor: 'Mekdes Abebe', time: '25 Sep 2026 · 10:17', icon: FileCheck2, tone: 'bg-sky-100 text-sky-700' },
  { event: 'Downloaded', actor: 'Amanuel Tesfaye', time: '25 Sep 2026 · 10:20', icon: ArrowDownToLine, tone: 'bg-violet-100 text-violet-700' },
  { event: 'Printed', actor: 'Amanuel Tesfaye · Printer 02', time: '25 Sep 2026 · 10:25', icon: Printer, tone: 'bg-amber-100 text-amber-700' },
]

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Ready to issue': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Pending review': 'bg-amber-50 text-amber-700 border-amber-200',
    Generated: 'bg-sky-50 text-sky-700 border-sky-200',
    Returned: 'bg-rose-50 text-rose-700 border-rose-200',
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Draft: 'bg-muted text-muted-foreground border-border',
  }
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status] ?? 'bg-muted text-muted-foreground border-border'}`}><span className="size-1.5 rounded-full bg-current" />{status}</span>
}

function SectionHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="mb-6 flex items-end justify-between gap-4"><div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p><h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>{action}</div>
}

export default function LettersWorkspace() {
  const [activeNav, setActiveNav] = useState('Overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [query, setQuery] = useState('')
  const [language, setLanguage] = useState('All languages')
  const [showRequest, setShowRequest] = useState(false)
  const [requests, setRequests] = useState(initialRequests)
  const [selectedLetter, setSelectedLetter] = useState(initialRequests[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [requestForm, setRequestForm] = useState({ employee: 'Mekdes Abebe', organisation: 'FCSC', category: 'Employment confirmation', requiredDate: '', title: 'Employment confirmation for bank application', notes: '' })

  function saveRequest() {
    const next = { id: editingId ?? `LET-2026-${String(requests.length + 126).padStart(5, '0')}`, title: requestForm.title || requestForm.category, employee: requestForm.employee, org: requestForm.organisation, date: requestForm.requiredDate || '28 Sep 2026', status: 'Pending review' }
    setRequests((current) => editingId ? current.map((item) => item.id === editingId ? next : item) : [next, ...current])
    setSelectedLetter(next)
    setEditingId(null)
    setShowRequest(false)
  }

  function editRequest(request: typeof initialRequests[number]) {
    setEditingId(request.id)
    setRequestForm({ employee: request.employee, organisation: request.org, category: request.title, requiredDate: '', title: request.title, notes: '' })
    setShowRequest(true)
  }

  function deleteRequest(id: string) {
    setRequests((current) => current.filter((item) => item.id !== id))
    if (selectedLetter.id === id) setSelectedLetter(requests.find((item) => item.id !== id) ?? initialRequests[0])
  }
  const [draftInstruction, setDraftInstruction] = useState('Write a professional employment confirmation with a warm but formal tone.')
  const [draftText, setDraftText] = useState('')
  const [isDrafting, setIsDrafting] = useState(false)
  const [draftError, setDraftError] = useState('')
  const [saveState, setSaveState] = useState('Autosaved 10:26')
  const editorRef = useRef<HTMLDivElement>(null)

  function formatDocument(command: string, value?: string) {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    saveLetterDraft()
  }

  function saveLetterDraft() {
    setSaveState('Saved just now')
    window.setTimeout(() => setSaveState('Autosaved'), 1800)
  }

  async function draftLetter() {
    setIsDrafting(true)
    setDraftError('')
    try {
      const response = await fetch('/api/draft-letter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ instruction: draftInstruction, letterType: 'Employment confirmation', employee: 'Mekdes Abebe', language: 'English', reference: 'LET-2026-00125' }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to draft letter.')
      setDraftText(data.text)
    } catch (error) {
      setDraftError(error instanceof Error ? error.message : 'Unable to draft letter.')
    } finally {
      setIsDrafting(false)
    }
  }

  const filteredRequests = useMemo(() => requests.filter((request) => `${request.title} ${request.employee} ${request.id}`.toLowerCase().includes(query.toLowerCase())), [query, requests])

  return <div className="min-h-screen bg-[#f7f8f6] text-foreground">
    <aside className={`fixed inset-y-0 left-0 z-30 flex w-[272px] flex-col border-r border-border bg-white transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-[76px] items-center gap-3 border-b border-border px-6"><div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"><FileSignature className="size-5" /></div><div><p className="text-sm font-semibold tracking-tight">ICS Management</p><p className="text-[11px] text-muted-foreground">Official correspondence</p></div><button className="ml-auto rounded-md p-1 text-muted-foreground hover:bg-muted lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X className="size-4" /></button></div>
      <div className="border-b border-border px-4 py-5"><div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3"><div className="grid size-9 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">AT</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">Amanuel Tesfaye</p><p className="truncate text-xs text-muted-foreground">HR Supervisor</p></div><ChevronDown className="size-4 text-muted-foreground" /></div></div>
      <nav className="flex-1 space-y-1 p-4"><p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Letters management</p>{navItems.map((item) => { const Icon = item.icon; const active = activeNav === item.label; return <button key={item.label} onClick={() => setActiveNav(item.label)} className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><Icon className="size-[17px]" /><span className="flex-1"><span className="block text-sm font-medium">{item.label}</span><span className={`block text-[10px] ${active ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`}>{item.amharic}</span></span>{item.count && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${active ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>{item.count}</span>}</button> })}</nav>
      <div className="border-t border-border p-4"><div className="rounded-xl border border-primary/15 bg-primary/[0.04] p-3"><div className="mb-2 flex items-center gap-2 text-primary"><ShieldCheck className="size-4" /><span className="text-xs font-semibold">Controlled workspace</span></div><p className="text-[11px] leading-relaxed text-muted-foreground">Every generated, downloaded and printed letter is recorded in an immutable audit trail.</p></div></div>
    </aside>
    <div className={`min-h-screen transition-[padding] duration-300 ${sidebarOpen ? 'lg:pl-[272px]' : ''}`}>
      <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-border bg-white/90 px-5 backdrop-blur md:px-8"><div className="flex items-center gap-4"><button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Toggle navigation"><Menu className="size-5" /></button><div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex"><span>Workspace</span><span>/</span><span className="font-medium text-foreground">{activeNav}</span></div></div><div className="flex items-center gap-2 md:gap-4"><button className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Notifications"><Bell className="size-[18px]" /><span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-rose-500" /></button><div className="hidden h-6 w-px bg-border md:block" /><div className="flex items-center gap-2"><div className="grid size-8 place-items-center rounded-full bg-[#e8eee5] text-xs font-bold text-primary">AT</div><div className="hidden text-left md:block"><p className="text-xs font-medium">Amanuel Tesfaye</p><p className="text-[10px] text-muted-foreground">HR Supervisor</p></div><ChevronDown className="size-3.5 text-muted-foreground" /></div></div></header>
      <main className="mx-auto max-w-[1500px] p-5 md:p-8">
        {activeNav === 'Overview' && <>
          <SectionHeader eyebrow="E-documentation / የኢ-ሰነድ" title="Letters workspace" description="Create, approve, issue and trace official correspondence from one controlled workspace." action={<button onClick={() => setShowRequest(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"><FilePlus2 className="size-4" /> New requisition</button>} />
          <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[['Pending review','04','Needs supervisor attention',ClipboardCheck,'text-amber-700 bg-amber-50'],['Generated this month','182','Across 8 organisations',Sparkles,'text-sky-700 bg-sky-50'],['Ready to issue','12','Awaiting final action',PackageCheck,'text-emerald-700 bg-emerald-50'],['Prints this month','347','Immutable audit records',Printer,'text-violet-700 bg-violet-50']].map(([label,value,caption,Icon,tone]) => <div key={label as string} className="rounded-xl border border-border bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,.02)]"><div className="mb-4 flex items-start justify-between"><p className="text-sm font-medium text-muted-foreground">{label as string}</p><div className={`grid size-9 place-items-center rounded-lg ${tone as string}`}><Icon className="size-4" /></div></div><p className="text-3xl font-semibold tracking-tight">{value as string}</p><p className="mt-1 text-xs text-muted-foreground">{caption as string}</p></div>)}</div>
          <div className="mb-7 grid gap-5 xl:grid-cols-[1.4fr_.8fr]"><div className="rounded-xl border border-border bg-white p-5"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold">Letter lifecycle</h2><p className="mt-1 text-xs text-muted-foreground">A controlled path from request to archive</p></div><button className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="More lifecycle options"><MoreHorizontal className="size-4" /></button></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">{[['1','Request',FilePlus2,'bg-muted'],['2','Validate',ClipboardCheck,'bg-muted'],['3','Approve',Check,'bg-muted'],['4','Generate',Sparkles,'bg-primary/10'],['5','Preview',FileCheck2,'bg-primary/10'],['6','Sign',FileSignature,'bg-primary/10'],['7','Issue',Stamp,'bg-primary/10'],['8','Archive',Archive,'bg-primary/10']].map(([step,label,Icon,tone], index) => <div key={label as string} className="relative flex flex-col items-center text-center"><div className={`mb-2 grid size-10 place-items-center rounded-full ${tone as string} ${index > 2 ? 'text-primary' : 'text-muted-foreground'}`}><Icon className="size-4" /></div><span className="text-xs font-medium">{label as string}</span><span className="mt-0.5 text-[10px] text-muted-foreground">0{step as string}</span>{index < 7 && <span className="absolute left-[calc(50%+25px)] top-5 hidden h-px w-[calc(100%-10px)] bg-border xl:block" />}</div>)}</div></div><div className="rounded-xl border border-border bg-white p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold">Recent activity</h2><p className="mt-1 text-xs text-muted-foreground">Latest immutable events</p></div><History className="size-4 text-muted-foreground" /></div><div className="space-y-4">{auditEvents.slice(0,3).map((event) => { const Icon = event.icon; return <div key={event.event} className="flex gap-3"><div className={`grid size-8 shrink-0 place-items-center rounded-lg ${event.tone}`}><Icon className="size-3.5" /></div><div className="min-w-0"><p className="text-sm font-medium">{event.event}</p><p className="truncate text-xs text-muted-foreground">{event.actor}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{event.time}</p></div></div> })}</div></div></div>
          <div className="rounded-xl border border-border bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5"><div><h2 className="font-semibold">Recent requisitions</h2><p className="mt-1 text-xs text-muted-foreground">Track requests across their approval and generation states</p></div><button onClick={() => setActiveNav('Requisitions')} className="text-sm font-medium text-primary hover:underline">View all requisitions</button></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-muted/40 text-xs text-muted-foreground"><tr><th className="px-5 py-3 font-medium">Reference</th><th className="px-5 py-3 font-medium">Letter</th><th className="px-5 py-3 font-medium">Employee</th><th className="px-5 py-3 font-medium">Date</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3" /></tr></thead><tbody>{requests.map((request) => <tr key={request.id} className="border-t border-border hover:bg-muted/30"><td className="px-5 py-4 font-mono text-xs text-muted-foreground">{request.id}</td><td className="px-5 py-4 font-medium">{request.title}</td><td className="px-5 py-4">{request.employee}<span className="ml-2 text-xs text-muted-foreground">· {request.org}</span></td><td className="px-5 py-4 text-muted-foreground">{request.date}</td><td className="px-5 py-4"><StatusBadge status={request.status} /></td><td className="px-5 py-4 text-right"><div className="flex justify-end gap-1"><button onClick={() => editRequest(request)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted" aria-label={`Edit ${request.id}`}><Pencil className="size-4" /></button><button onClick={() => deleteRequest(request.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted" aria-label={`Delete ${request.id}`}><X className="size-4" /></button></div></td></tr>)}</tbody></table></div></div>
        </>}

        {activeNav === 'Requisitions' && <><SectionHeader eyebrow="Workflow / የጥያቄ ሂደት" title="Letter requisitions" description="Validate, submit and move requests through supervisor review." action={<button onClick={() => setShowRequest(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"><FilePlus2 className="size-4" /> New requisition</button>} /><div className="mb-5 flex flex-wrap gap-3"><div className="relative min-w-[250px] flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search reference, employee or letter type" className="h-10 w-full rounded-lg border border-input bg-white pl-9 pr-3 text-sm outline-none ring-primary/20 focus:ring-4" /></div><button className="inline-flex items-center gap-2 rounded-lg border border-input bg-white px-3 text-sm text-muted-foreground"><Filter className="size-4" /> Filters</button></div><div className="rounded-xl border border-border bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="bg-muted/40 text-xs text-muted-foreground"><tr><th className="px-5 py-3 font-medium">Reference</th><th className="px-5 py-3 font-medium">Letter title</th><th className="px-5 py-3 font-medium">Employee / organisation</th><th className="px-5 py-3 font-medium">Required date</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3" /></tr></thead><tbody>{filteredRequests.map((request) => <tr key={request.id} onClick={() => setSelectedLetter(request)} className="cursor-pointer border-t border-border hover:bg-primary/[0.03]"><td className="px-5 py-4 font-mono text-xs text-muted-foreground">{request.id}</td><td className="px-5 py-4 font-medium">{request.title}</td><td className="px-5 py-4"><p>{request.employee}</p><p className="text-xs text-muted-foreground">{request.org}</p></td><td className="px-5 py-4 text-muted-foreground">{request.date}</td><td className="px-5 py-4"><StatusBadge status={request.status} /></td><td className="px-5 py-4 text-right"><button className="rounded-md p-2 text-muted-foreground hover:bg-muted" aria-label="Edit requisition"><Pencil className="size-4" /></button></td></tr>)}</tbody></table></div>{filteredRequests.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">No requisitions match your search.</div>}</div><div className="mt-5 rounded-xl border border-primary/15 bg-primary/[0.04] p-4 text-sm"><div className="flex gap-3"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" /><p><span className="font-semibold text-foreground">Selected requisition: {selectedLetter.id}</span><span className="mt-1 block text-muted-foreground">The review trail includes validation, supervisor decision, comments, generation metadata and final issuance.</span></p></div></div></>}

        {activeNav === 'Templates' && <><SectionHeader eyebrow="Configuration / አብነት" title="Template library" description="Maintain controlled, multilingual templates with traceable versions." action={<button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"><FilePlus2 className="size-4" /> New template</button>} /><div className="mb-5 flex flex-wrap gap-2"><button onClick={() => setLanguage('All languages')} className={`rounded-full px-3 py-1.5 text-xs font-medium ${language === 'All languages' ? 'bg-primary text-primary-foreground' : 'bg-white text-muted-foreground ring-1 ring-border'}`}>All languages</button>{['English','Amharic','Afaan Oromoo'].map((lang) => <button key={lang} onClick={() => setLanguage(lang)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${language === lang ? 'bg-primary text-primary-foreground' : 'bg-white text-muted-foreground ring-1 ring-border'}`}>{lang}</button>)}</div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{templates.filter((template) => language === 'All languages' || template.lang === language).map((template) => <div key={template.name} className="rounded-xl border border-border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"><div className="mb-6 flex items-start justify-between"><div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"><FileText className="size-5" /></div><button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted" aria-label="Template options"><MoreHorizontal className="size-4" /></button></div><h3 className="font-semibold">{template.name}</h3><div className="mt-2 flex flex-wrap gap-2"><span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground"><Tag className="size-3" />{template.lang}</span><span className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">{template.org}</span></div><div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs"><span className="text-muted-foreground">Version <span className="font-semibold text-foreground">{template.version}</span> · {template.uses} uses</span><StatusBadge status={template.status} /></div></div>)}</div><div className="mt-6 rounded-xl border border-dashed border-primary/30 bg-primary/[0.03] p-5"><div className="flex gap-3"><Sparkles className="mt-0.5 size-5 text-primary" /><div><h3 className="font-semibold">Controlled merge fields</h3><p className="mt-1 text-sm text-muted-foreground">Templates can safely use authorised fields such as <code className="rounded bg-white px-1.5 py-0.5 text-xs text-primary">{'{{employee.full_name}}'}</code>, salary, position, grade, organisation and employment date. Every generation stores the exact template version and input snapshot.</p></div></div></div></>}

        {activeNav === 'Letter editor' && <><SectionHeader eyebrow="Authoring / የሰነድ አዘጋጅ" title="Letter editor" description="Prepare the official document with controlled fields, formatting tools and a live paper preview." action={<div className="flex gap-2"><button onClick={saveLetterDraft} className="rounded-lg border border-input bg-white px-3 py-2 text-sm font-medium">Save draft</button><button className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"><Send className="mr-2 inline size-4" />Submit for review</button></div>} /><div className="mb-5 rounded-xl border border-border bg-white p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold">Letter context</h2><p className="mt-1 text-xs text-muted-foreground">Select the source record before editing the document.</p></div><StatusBadge status="Generated" /></div><div className="grid gap-4 md:grid-cols-4"><label className="text-xs font-semibold text-muted-foreground">Letter type<select className="mt-2 h-10 w-full rounded-lg border border-input bg-white px-3 text-sm font-normal"><option>Employment confirmation</option><option>Salary confirmation</option><option>Service letter</option></select></label><label className="text-xs font-semibold text-muted-foreground">Employee<input defaultValue="Mekdes Abebe" className="mt-2 h-10 w-full rounded-lg border border-input px-3 text-sm font-normal" /></label><label className="text-xs font-semibold text-muted-foreground">Reference number<input defaultValue="LET-2026-00125" className="mt-2 h-10 w-full rounded-lg border border-input px-3 text-sm font-normal" /></label><label className="text-xs font-semibold text-muted-foreground">Language<select className="mt-2 h-10 w-full rounded-lg border border-input bg-white px-3 text-sm font-normal"><option>English</option><option>Amharic</option><option>Afaan Oromoo</option></select></label></div><div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground"><span className="rounded-md bg-muted px-2.5 py-1.5">Template: Employment confirmation · v3</span><span className="rounded-md bg-muted px-2.5 py-1.5">Organisation: FCSC</span><span className="rounded-md bg-muted px-2.5 py-1.5">Merge fields locked</span></div></div><div className="overflow-hidden rounded-xl border border-border bg-white"><div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 p-3"><span className="mr-3 text-xs font-semibold text-muted-foreground">EDIT</span>{[['Undo','undo'],['Redo','redo'],['B','bold'],['I','italic'],['U','underline'],['Align','justifyCenter'],['Bullets','insertUnorderedList']].map(([tool, command]) => <button key={tool} type="button" onMouseDown={(event) => { event.preventDefault(); formatDocument(command) }} className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-border hover:bg-muted">{tool}</button>)}<button type="button" onMouseDown={(event) => { event.preventDefault(); formatDocument('insertText', ' {{employee_name}} ') }} className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">Insert field</button><button onClick={draftLetter} disabled={isDrafting} className="ml-2 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-60"><Sparkles className="size-3.5" />{isDrafting ? 'Writing…' : 'Write with AI'}</button><span className="ml-auto text-xs text-muted-foreground">{saveState}</span></div><div className="border-b border-border bg-primary/[0.04] p-4"><div className="flex flex-col gap-3 md:flex-row md:items-end"><label className="flex-1 text-xs font-semibold text-muted-foreground">Tell the assistant what to write<textarea value={draftInstruction} onChange={(event) => setDraftInstruction(event.target.value)} rows={2} className="mt-1.5 w-full resize-none rounded-lg border border-input bg-white px-3 py-2 text-sm font-normal" placeholder="Describe the purpose, tone and details…" /></label><button onClick={draftLetter} disabled={isDrafting || !draftInstruction.trim()} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60"><Sparkles className="size-4" />{isDrafting ? 'Writing…' : 'Draft letter'}</button></div>{draftError && <p className="mt-2 text-xs text-destructive">{draftError}</p>}{draftText && <div className="mt-3 rounded-lg border border-primary/20 bg-white p-3 text-sm leading-6"><div className="mb-1 flex items-center justify-between"><span className="text-xs font-semibold text-primary">AI draft ready for review</span><button onClick={() => setDraftText('')} className="text-xs text-muted-foreground hover:text-foreground">Dismiss</button></div><p className="whitespace-pre-wrap">{draftText}</p></div>}</div><div className="grid min-h-[560px] lg:grid-cols-[1fr_280px]"><div className="bg-muted/30 p-5 md:p-8"><div className="mx-auto min-h-[640px] max-w-[760px] bg-white px-10 py-12 shadow-sm ring-1 ring-border md:px-16"><div className="border-b-2 border-primary pb-5 text-center"><div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-primary text-primary-foreground"><FileSignature className="size-6" /></div><p className="text-xs font-semibold tracking-[0.18em] text-primary">FEDERAL CIVIL SERVICE COMMISSION</p><p className="mt-1 text-[10px] text-muted-foreground">የፌዴራል ሲቪል ሰርቪስ ኮሚሽን</p></div><div className="mt-10 flex justify-between text-xs"><span>Ref: LET-2026-00125</span><span>25 September 2026</span></div><h3 className="mt-10 text-center text-lg font-semibold uppercase tracking-wide">Employment confirmation</h3><div ref={editorRef} role="textbox" aria-label="Letter document body" contentEditable suppressContentEditableWarning onInput={(event) => setDraftText(event.currentTarget.innerText)} className="mt-8 min-h-[430px] w-full rounded-sm border-0 bg-transparent text-sm leading-7 outline-none focus:ring-0 empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]" data-placeholder="Start writing your letter here…">{draftText || `To whom it may concern,\n\nThis is to confirm that Mekdes Abebe is employed by the Federal Civil Service Commission.\n\nThis letter has been generated from the approved template and is ready for supervisor review.\n\nYours faithfully,\n\nAmanuel Tesfaye\nHR Supervisor`}</div></div><aside className="border-t border-border p-5 lg:border-l lg:border-t-0"><h3 className="font-semibold">Document controls</h3><div className="mt-4 flex flex-col gap-3 text-sm"><label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Include official header</label><label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Lock merge fields</label><label className="flex items-center gap-2"><input type="checkbox" /> Require signature</label><label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Add verification QR</label></div><div className="my-5 h-px bg-border" /><h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Available fields</h4><div className="mt-3 flex flex-wrap gap-2">{['Employee name','Organisation','Job title','Start date','Reference no.','Issue date'].map((field) => <button key={field} className="rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">{field}</button>)}</div><div className="mt-6 rounded-lg border border-primary/15 bg-primary/[0.04] p-3 text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="mr-1 inline size-3.5 text-primary" /> Sensitive fields are protected. Changes are recorded in the audit trail.</div></aside></div></div></div></>}

        {['Approvals','Issued letters','Verification','Archive','Print audit'].includes(activeNav) && <><SectionHeader eyebrow={`Letters / ${activeNav}`} title={activeNav} description="A focused view of the official correspondence lifecycle, with traceability at every step." action={<button onClick={() => setActiveNav('Overview')} className="rounded-lg border border-input bg-white px-4 py-2.5 text-sm font-medium">Back to overview</button>} /><div className="grid gap-5 lg:grid-cols-[1fr_360px]"><div className="rounded-xl border border-border bg-white p-6"><div className="mb-6 flex items-center gap-4"><div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary"><ShieldCheck className="size-6" /></div><div><h2 className="text-lg font-semibold">{activeNav === 'Verification' ? 'Public verification controls' : activeNav}</h2><p className="text-sm text-muted-foreground">{activeNav === 'Verification' ? 'Verify a letter without exposing sensitive employee data.' : 'Manage this stage with role-based controls and a complete audit history.'}</p></div></div>{activeNav === 'Verification' ? <div className="flex max-w-xl gap-2"><input placeholder="Enter verification code" className="h-10 flex-1 rounded-lg border border-input px-3 text-sm outline-none focus:ring-4 focus:ring-primary/15" /><button className="rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Verify</button></div> : <div className="rounded-lg border border-dashed border-border p-8 text-center"><FileCheck2 className="mx-auto size-8 text-primary" /><p className="mt-3 font-medium">No items require action here</p><p className="mt-1 text-sm text-muted-foreground">New records will appear as they move through the controlled lifecycle.</p></div>}</div><div className="rounded-xl border border-border bg-white p-5"><h3 className="font-semibold">Controls & policy</h3><div className="mt-4 space-y-3 text-sm text-muted-foreground"><p className="flex gap-2"><Check className="size-4 shrink-0 text-primary" />Role-based access enforced</p><p className="flex gap-2"><Check className="size-4 shrink-0 text-primary" />Immutable event records</p><p className="flex gap-2"><Check className="size-4 shrink-0 text-primary" />Voided letters fail verification</p><p className="flex gap-2"><Check className="size-4 shrink-0 text-primary" />Archive metadata retained</p></div></div></div></>}
      </main>
    </div>
    {showRequest && <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/25 p-4 backdrop-blur-sm"><div className="w-full max-w-2xl rounded-2xl border border-border bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-border p-5"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{editingId ? 'Edit requisition' : 'New requisition'}</p><h2 className="mt-1 text-lg font-semibold">{editingId ? 'Update letter request' : 'Create letter request'} <span className="font-normal text-muted-foreground">/ የደብዳቤ ጥያቄ</span></h2></div><button onClick={() => { setShowRequest(false); setEditingId(null) }} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Close requisition dialog"><X className="size-5" /></button></div><div className="grid gap-4 p-5 sm:grid-cols-2"><label className="text-sm font-medium">Employee<input value={requestForm.employee} onChange={(event) => setRequestForm({ ...requestForm, employee: event.target.value })} className="mt-2 h-10 w-full rounded-lg border border-input px-3 text-sm font-normal outline-none focus:ring-4 focus:ring-primary/15" /></label><label className="text-sm font-medium">Organisation<select value={requestForm.organisation} onChange={(event) => setRequestForm({ ...requestForm, organisation: event.target.value })} className="mt-2 h-10 w-full rounded-lg border border-input bg-white px-3 text-sm font-normal outline-none"><option>FCSC</option><option>Ministry of Finance</option></select></label><label className="text-sm font-medium">Letter category<select className="mt-2 h-10 w-full rounded-lg border border-input bg-white px-3 text-sm font-normal outline-none"><option>Employment confirmation</option><option>Salary confirmation</option><option>Service letter</option></select></label><label className="text-sm font-medium">Required date<input type="date" value={requestForm.requiredDate} onChange={(event) => setRequestForm({ ...requestForm, requiredDate: event.target.value })} className="mt-2 h-10 w-full rounded-lg border border-input px-3 text-sm font-normal outline-none focus:ring-4 focus:ring-primary/15" /></label><label className="text-sm font-medium sm:col-span-2">Request title<input value={requestForm.title} onChange={(event) => setRequestForm({ ...requestForm, title: event.target.value })} placeholder="e.g. Employment confirmation for bank application" className="mt-2 h-10 w-full rounded-lg border border-input px-3 text-sm font-normal outline-none focus:ring-4 focus:ring-primary/15" /></label><div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground sm:col-span-2"><div className="flex gap-2"><ShieldCheck className="size-4 shrink-0 text-primary" />The request will be validated before it can be submitted for HR Supervisor approval.</div></div></div><div className="flex justify-end gap-2 border-t border-border p-5"><button onClick={() => setShowRequest(false)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted">Save draft</button><button onClick={() => setShowRequest(false)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"><Send className="size-4" /> Submit for review</button></div></div></div>}
  </div>
}

function UserIcon() { return <UserRound className="size-4" /> }

void UserIcon
void ArrowDownToLine
void MoreHorizontal
void Send
void PackageCheck
void FileCheck2
void Stamp
void LayoutDashboard
void UserRound
