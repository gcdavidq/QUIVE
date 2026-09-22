import { useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Boxes,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Crosshair,
  FileText,
  Gauge,
  Home as HomeIcon,
  LayoutDashboard,
  MapPinned,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Navigation,
  Package,
  PanelLeft,
  PencilRuler,
  Plus,
  ReceiptText,
  Search,
  Settings2,
  ShieldCheck,
  Star,
  Truck,
  UserRound,
  UsersRound,
  WalletCards,
  X,
  Zap,
} from "lucide-react";

type ModuleKey = "overview" | "mudanzas" | "cubicaje" | "rutas" | "transportistas" | "pagos" | "incidencias";

type IconType = typeof LayoutDashboard;
type NavItem = { key: string; label: string; icon: IconType; badge?: string; live?: boolean; warm?: boolean };

const navGroups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Workspace",
    items: [
      { key: "overview", label: "Resumen", icon: LayoutDashboard },
      { key: "mudanzas", label: "Mis mudanzas", icon: HomeIcon, badge: "12" },
      { key: "cubicaje", label: "Cubicaje", icon: Boxes },
      { key: "rutas", label: "Rutas & GPS", icon: MapPinned, live: true },
    ],
  },
  {
    label: "Operación",
    items: [
      { key: "transportistas", label: "Transportistas", icon: Truck },
      { key: "pagos", label: "Pagos", icon: WalletCards },
      { key: "incidencias", label: "Incidencias", icon: AlertCircle, badge: "2", warm: true },
    ],
  },
];

const moduleMeta: Record<ModuleKey, { eyebrow: string; title: string; description: string; icon: IconType }> = {
  overview: { eyebrow: "Centro de control", title: "Resumen operativo", description: "Una vista clara de todo lo que se está moviendo hoy.", icon: LayoutDashboard },
  mudanzas: { eyebrow: "Operación", title: "Mis mudanzas", description: "Cotiza, organiza y acompaña cada servicio de principio a fin.", icon: HomeIcon },
  cubicaje: { eyebrow: "Planificación", title: "Cubicaje inteligente", description: "Desglosa objetos, calcula volumen y evita viajes innecesarios.", icon: Boxes },
  rutas: { eyebrow: "Geointeligencia", title: "Rutas & GPS en vivo", description: "Monitorea la flota sobre rutas viales y anticipa retrasos.", icon: MapPinned },
  transportistas: { eyebrow: "Red logística", title: "Transportistas", description: "Compara disponibilidad, tarifa, vehículo y reputación.", icon: Truck },
  pagos: { eyebrow: "Finanzas", title: "Pagos y comprobantes", description: "Simula cobros y controla el estado de cada transacción.", icon: WalletCards },
  incidencias: { eyebrow: "Calidad", title: "Incidencias", description: "Resuelve alertas, califica servicios y mantén a todos informados.", icon: AlertCircle },
};

const upcomingMoves = [
  { id: "MV-1048", client: "Lucía Fernández", route: "Miraflores → Surco", date: "Hoy, 10:30", volume: "18.4 m³", status: "En ruta", statusTone: "blue", avatar: "LF", accent: "#8eb8ff" },
  { id: "MV-1047", client: "Diego Salazar", route: "Barranco → La Molina", date: "Hoy, 14:00", volume: "11.8 m³", status: "Confirmada", statusTone: "green", avatar: "DS", accent: "#ffd2a6" },
  { id: "MV-1046", client: "Micaela Torres", route: "San Isidro → Magdalena", date: "Mañana, 09:00", volume: "24.2 m³", status: "Por asignar", statusTone: "violet", avatar: "MT", accent: "#d3c4ff" },
];

const carriers = [
  { name: "Andes Cargo", vehicle: "Furgón · 20 m³", score: "4.9", distance: "1.8 km", price: "S/ 380", initials: "AC", tone: "blue", verified: true },
  { name: "Mudanzas Lima", vehicle: "Camión · 35 m³", score: "4.8", distance: "3.2 km", price: "S/ 520", initials: "ML", tone: "orange", verified: true },
  { name: "Norte Express", vehicle: "Camioneta · 12 m³", score: "4.6", distance: "4.7 km", price: "S/ 290", initials: "NE", tone: "green", verified: false },
];

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cx("flex items-center", compact ? "justify-center" : "gap-3")}>
      <div className="brand-mark"><span className="brand-mark-shape" /><span className="brand-mark-dot" /></div>
      {!compact && <div className="leading-none"><span className="block text-[17px] font-bold tracking-[-0.04em] text-[#102c53]">move<span className="text-[#4b94ff]">flow</span></span><span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8ea6c5]">logística simple</span></div>}
    </div>
  );
}

function SideNav({ active, onChange }: { active: ModuleKey; onChange: (key: ModuleKey) => void }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-[#e3edf8] bg-white px-5 py-6 lg:flex">
      <div className="px-2"><Logo /></div>
      <div className="mt-12 flex-1 space-y-8 overflow-y-auto pr-1">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a7b8ce]">{group.label}</div>
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => onChange(item.key as ModuleKey)}
                    className={cx("nav-item", isActive && "nav-item-active")}
                  >
                    <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                    <span>{item.label}</span>
                    {item.live && <span className="ml-auto flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#45bba2]"><span className="live-dot" /> LIVE</span>}
                    {item.badge && <span className={cx("ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold", item.warm ? "bg-[#fff0de] text-[#d8892f]" : isActive ? "bg-white/80 text-[#4d91f5]" : "bg-[#edf4fd] text-[#7f9cc0]")}>{item.badge}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-[#f4f8fc] p-3.5">
        <div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9aafc9]">Tu plan</span><span className="rounded-full bg-[#e2f5f1] px-2 py-0.5 text-[9px] font-bold text-[#32a38e]">PRO</span></div>
        <p className="text-xs font-semibold text-[#183458]">13 de 20 mudanzas</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e1eaf3]"><div className="h-full w-[65%] rounded-full bg-[#6aa4fa]" /></div>
        <button onClick={() => onChange("pagos")} className="mt-3 text-[11px] font-bold text-[#4c8eed] hover:text-[#276cc6]">Ver detalles <span className="ml-1">→</span></button>
      </div>
      <div className="mt-5 flex items-center gap-3 border-t border-[#edf2f7] px-2 pt-5">
        <div className="avatar avatar-small bg-[#173a69] text-white">MG</div>
        <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-[#183458]">Mariana Gómez</p><p className="mt-0.5 truncate text-[10px] text-[#93a8c2]">Admin · MoveHouse</p></div>
        <button aria-label="Configuración" onClick={() => onChange("overview")} className="text-[#9bb0c9] transition hover:text-[#4d91f5]"><Settings2 size={16} /></button>
      </div>
    </aside>
  );
}

function MobileBar({ onMenu, onBell }: { onMenu: () => void; onBell: () => void }) {
  return <div className="flex items-center justify-between border-b border-[#e5edf6] bg-white px-5 py-4 lg:hidden"><button onClick={onMenu} className="icon-button" aria-label="Abrir menú"><Menu size={19} /></button><Logo compact /><button onClick={onBell} className="icon-button relative" aria-label="Notificaciones"><Bell size={18} /><span className="notification-dot" /></button></div>;
}

function Header({ active, onBell, onAction }: { active: ModuleKey; onBell: () => void; onAction: (message: string) => void }) {
  const current = moduleMeta[active];
  return (
    <header className="flex flex-col gap-5 border-b border-[#e7eef7] bg-[#fbfdff] px-5 py-6 sm:px-8 lg:px-10 xl:flex-row xl:items-center xl:justify-between xl:py-7">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-[#91a7c2]"><span>Workspace</span><span className="text-[#cad6e4]">/</span><span className="text-[#507ba8]">{current.eyebrow}</span></div>
        <h1 className="font-display text-[27px] font-bold tracking-[-0.04em] text-[#102c53] sm:text-[30px]">{active === "overview" ? "Hola, Mariana" : current.title}<span className="text-[#79b3ff]">.</span></h1>
        <p className="mt-1.5 text-[13px] text-[#8197b1]">{active === "overview" ? "Coordina tus mudanzas sin sorpresas." : current.description}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden h-10 items-center gap-2 rounded-xl border border-[#dce8f5] bg-white px-3.5 shadow-[0_3px_10px_rgba(50,101,160,0.04)] md:flex"><Search size={15} className="text-[#a1b4ca]" /><input className="w-32 bg-transparent text-xs text-[#345273] outline-none placeholder:text-[#a1b4ca]" placeholder="Buscar..." /><kbd className="rounded-md bg-[#f2f6fa] px-1.5 py-0.5 text-[10px] font-semibold text-[#a8b9cd]">⌘ K</kbd></div>
        <button onClick={onBell} className="icon-button relative h-10 w-10 bg-white shadow-[0_3px_10px_rgba(50,101,160,0.04)]"><Bell size={17} /><span className="notification-dot" /></button>
        <button onClick={() => onAction("Nueva mudanza iniciada")} className="primary-button"><Plus size={16} strokeWidth={2.5} /><span className="hidden sm:inline">Nueva mudanza</span></button>
      </div>
    </header>
  );
}

function StatCard({ icon: Icon, label, value, detail, direction, tone }: { icon: IconType; label: string; value: string; detail: string; direction: "up" | "down" | "neutral"; tone: string }) {
  return <div className="stat-card group"><div className="flex items-start justify-between"><div className={cx("stat-icon", tone)}><Icon size={17} /></div><button className="text-[#b5c5d8] transition hover:text-[#618ab7]"><MoreHorizontal size={17} /></button></div><div className="mt-4 text-[11px] font-semibold text-[#8da2bb]">{label}</div><div className="mt-1 flex items-end gap-2"><span className="font-display text-[27px] font-bold tracking-[-0.04em] text-[#16365f]">{value}</span><span className={cx("mb-1 flex items-center gap-0.5 text-[10px] font-bold", direction === "down" ? "text-[#e09a5c]" : direction === "up" ? "text-[#40ab94]" : "text-[#8da2bb]")}>{direction === "up" && <ArrowUpRight size={11} />}{direction === "down" && <ArrowDownRight size={11} />}{detail}</span></div></div>;
}

function MapPanel({ onAction }: { onAction: (message: string) => void }) {
  return <div className="surface-card overflow-hidden lg:col-span-7">
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#edf2f7] px-5 py-5 sm:px-6"><div><div className="flex items-center gap-2"><span className="section-kicker">MONITOREO EN TIEMPO REAL</span><span className="live-pill"><span className="live-dot" /> 8 activos</span></div><h2 className="mt-2 font-display text-[18px] font-bold tracking-[-0.03em] text-[#17375f]">Flota en movimiento</h2></div><button onClick={() => onAction("Vista de mapa expandida") } className="subtle-button">Abrir mapa <Navigation size={13} /></button></div>
    <div className="relative h-[295px] map-surface" aria-label="Mapa interactivo simulado con ruta Lima a Surco">
      <div className="map-label label-top">SAN ISIDRO</div><div className="map-label label-right">SURCO</div><div className="map-label label-bottom">MIRAFLORES</div>
      <div className="map-road road-1" /><div className="map-road road-2" /><div className="map-road road-3" /><div className="map-road road-4" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 760 295" preserveAspectRatio="none"><path d="M 132 226 C 212 195, 211 112, 329 141 S 475 201, 552 116 S 630 92, 690 64" fill="none" stroke="#ffffff" strokeLinecap="round" strokeWidth="9" opacity=".9" /><path d="M 132 226 C 212 195, 211 112, 329 141 S 475 201, 552 116 S 630 92, 690 64" fill="none" stroke="#4c96f5" strokeDasharray="1 0" strokeLinecap="round" strokeWidth="4" /></svg>
      <div className="map-marker marker-a"><span className="marker-pulse" /><Truck size={14} /></div><div className="map-marker marker-b"><span className="marker-pulse" /><Truck size={14} /></div><div className="map-marker marker-c"><span className="marker-pulse" /><Truck size={14} /></div><div className="map-pin pin-start"><HomeIcon size={14} /></div><div className="map-pin pin-end"><MapPinned size={14} /></div>
      <div className="absolute left-4 top-4 flex gap-2"><span className="map-source-chip"><span className="source-square">◎</span> OpenStreetMap</span><span className="map-source-chip">OpenRouteService <span className="source-status" /></span></div>
      <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-xl border border-white/80 bg-white/90 px-3 py-2 shadow-[0_8px_20px_rgba(31,73,119,0.12)] backdrop-blur"><div className="relative h-7 w-7 rounded-lg bg-[#e8f2ff] text-[#4b91ef]"><Crosshair className="absolute inset-1.5" size={16} /></div><div><p className="text-[10px] font-bold text-[#24466f]">Ruta seleccionada</p><p className="text-[10px] text-[#87a0ba]">Miraflores → Surco · 12.6 km</p></div></div>
      <button onClick={() => onAction("Ubicación centrada en la flota")} className="absolute bottom-4 right-4 rounded-lg border border-white/80 bg-white/90 p-2.5 text-[#5b83ad] shadow-[0_8px_20px_rgba(31,73,119,0.12)] backdrop-blur transition hover:bg-white"><Crosshair size={16} /></button>
    </div>
    <div className="grid grid-cols-3 divide-x divide-[#edf2f7] border-t border-[#edf2f7] bg-[#fcfdff]"><div className="px-5 py-4"><p className="text-[10px] font-semibold text-[#9aadc3]">EN RUTA</p><p className="mt-1 text-[16px] font-bold text-[#1d416c]">08 <span className="text-[11px] font-medium text-[#8fa5bf]">vehículos</span></p></div><div className="px-5 py-4"><p className="text-[10px] font-semibold text-[#9aadc3]">TIEMPO PROMEDIO</p><p className="mt-1 text-[16px] font-bold text-[#1d416c]">42 <span className="text-[11px] font-medium text-[#8fa5bf]">min</span></p></div><div className="px-5 py-4"><p className="text-[10px] font-semibold text-[#9aadc3]">A TIEMPO</p><p className="mt-1 text-[16px] font-bold text-[#3ea88f]">96<span className="text-[11px] font-medium">%</span></p></div></div>
  </div>;
}

function ActivityPanel({ onAction }: { onAction: (message: string) => void }) {
  return <div className="surface-card p-5 sm:p-6 lg:col-span-5"><div className="flex items-start justify-between"><div><span className="section-kicker">AGENDA DE HOY</span><h2 className="mt-2 font-display text-[18px] font-bold tracking-[-0.03em] text-[#17375f]">Próximas mudanzas</h2></div><button onClick={() => onAction("Mostrando todas las mudanzas")} className="text-[11px] font-bold text-[#5b95e8]">Ver todas</button></div><div className="mt-5 space-y-1">{upcomingMoves.map((move, index) => <div key={move.id} className="group flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-[#f7faff]"><div className="avatar" style={{ background: move.accent, color: "#1e4877" }}>{move.avatar}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate text-[12px] font-bold text-[#244568]">{move.client}</p><span className={cx("status-pill", `status-${move.statusTone}`)}>{move.status}</span></div><p className="mt-1 truncate text-[10px] text-[#8da3bc]">{move.route}</p><div className="mt-1.5 flex items-center gap-3 text-[10px] text-[#a0b1c4]"><span className="flex items-center gap-1"><CalendarDays size={11} /> {move.date}</span><span className="flex items-center gap-1"><Boxes size={11} /> {move.volume}</span></div></div>{index < 2 && <button onClick={() => onAction(`Detalle de ${move.id}`)} className="text-[#c0cede] opacity-0 transition group-hover:opacity-100 hover:text-[#5c8fca]"><ChevronDown size={15} className="-rotate-90" /></button>}</div>)}</div><div className="mt-4 flex items-center gap-3 rounded-xl bg-[#eff7ff] px-3.5 py-3"><div className="rounded-lg bg-white p-2 text-[#6ea8f4]"><Zap size={15} fill="currentColor" /></div><p className="text-[10px] leading-relaxed text-[#6685a8]">Tienes <b className="text-[#3d6999]">3 servicios</b> que requieren asignación de transportista.</p><button onClick={() => onAction("Abriendo sugerencias de asignación")} className="ml-auto shrink-0 text-[10px] font-bold text-[#498ce4]">Revisar</button></div></div>;
}

function LowerInsights({ onAction }: { onAction: (message: string) => void }) {
  return <div className="grid gap-5 xl:grid-cols-12"><div className="surface-card p-5 sm:p-6 xl:col-span-7"><div className="flex items-center justify-between"><div><span className="section-kicker">CAPACIDAD DE FLOTA</span><h2 className="mt-2 font-display text-[18px] font-bold tracking-[-0.03em] text-[#17375f]">Volumen utilizado este mes</h2></div><button onClick={() => onAction("Abriendo reporte de capacidad")} className="icon-button"><MoreHorizontal size={17} /></button></div><div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center"><div className="relative mx-auto h-36 w-36 shrink-0 sm:mx-0"><div className="donut-ring" /><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="font-display text-[28px] font-bold tracking-[-0.06em] text-[#17395f]">248</span><span className="text-[10px] font-semibold text-[#94a9c1]">m³ de 320</span></div></div><div className="min-w-0 flex-1 space-y-4"><div><div className="mb-2 flex items-center justify-between text-[11px]"><span className="flex items-center gap-2 font-semibold text-[#506f94]"><span className="h-2 w-2 rounded-full bg-[#5b9df7]" />Furgones</span><b className="text-[#244568]">128 m³</b></div><div className="progress-track"><div className="h-full w-[82%] rounded-full bg-[#5b9df7]" /></div></div><div><div className="mb-2 flex items-center justify-between text-[11px]"><span className="flex items-center gap-2 font-semibold text-[#506f94]"><span className="h-2 w-2 rounded-full bg-[#7ad9c4]" />Camionetas</span><b className="text-[#244568]">74 m³</b></div><div className="progress-track"><div className="h-full w-[54%] rounded-full bg-[#7ad9c4]" /></div></div><div><div className="mb-2 flex items-center justify-between text-[11px]"><span className="flex items-center gap-2 font-semibold text-[#506f94]"><span className="h-2 w-2 rounded-full bg-[#ffc77d]" />Camiones</span><b className="text-[#244568]">46 m³</b></div><div className="progress-track"><div className="h-full w-[35%] rounded-full bg-[#ffc77d]" /></div></div></div></div></div><div className="surface-card p-5 sm:p-6 xl:col-span-5"><div className="flex items-start justify-between"><div><span className="section-kicker">ACTIVIDAD RECIENTE</span><h2 className="mt-2 font-display text-[18px] font-bold tracking-[-0.03em] text-[#17375f]">Alertas operativas</h2></div><span className="rounded-full bg-[#fff1e3] px-2 py-1 text-[10px] font-bold text-[#d9944d]">2 pendientes</span></div><div className="mt-5 space-y-4"><div className="flex gap-3"><div className="alert-icon alert-icon-orange"><AlertCircle size={15} /></div><div className="min-w-0 flex-1"><p className="text-[11px] font-bold text-[#3a5877]">Acceso restringido reportado</p><p className="mt-1 text-[10px] leading-relaxed text-[#93a7bd]">MV-1048 · hace 8 minutos</p></div><button onClick={() => onAction("Incidencia MV-1048 abierta")} className="text-[10px] font-bold text-[#6d9dde]">Abrir</button></div><div className="flex gap-3"><div className="alert-icon alert-icon-blue"><CreditCard size={15} /></div><div className="min-w-0 flex-1"><p className="text-[11px] font-bold text-[#3a5877]">Pago pendiente de confirmación</p><p className="mt-1 text-[10px] leading-relaxed text-[#93a7bd]">MV-1046 · hace 24 minutos</p></div><button onClick={() => onAction("Pago MV-1046 abierto")} className="text-[10px] font-bold text-[#6d9dde]">Abrir</button></div><div className="flex items-center gap-2 border-t border-[#edf2f7] pt-4"><ShieldCheck size={15} className="text-[#48b59e]" /><span className="text-[10px] font-semibold text-[#82a0b8]">Todo lo demás está funcionando bien</span></div></div></div></div>;
}

function Overview({ onAction }: { onAction: (message: string) => void }) {
  return <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={HomeIcon} label="Mudanzas activas" value="12" detail="8.4%" direction="up" tone="stat-blue" /><StatCard icon={Boxes} label="Volumen gestionado" value="248 m³" detail="12.1%" direction="up" tone="stat-lilac" /><StatCard icon={Navigation} label="Servicios en ruta" value="05" detail="En tiempo real" direction="neutral" tone="stat-mint" /><StatCard icon={AlertCircle} label="Incidencias abiertas" value="02" detail="1 nueva" direction="down" tone="stat-peach" /></div><div className="mt-5 grid gap-5 lg:grid-cols-12"><MapPanel onAction={onAction} /><ActivityPanel onAction={onAction} /></div><div className="mt-5"><LowerInsights onAction={onAction} /></div></>;
}

function ModuleView({ active, onAction }: { active: ModuleKey; onAction: (message: string) => void }) {
  if (active === "rutas") return <><div className="grid gap-4 sm:grid-cols-3"><StatCard icon={Navigation} label="Vehículos activos" value="08" detail="+2 hoy" direction="up" tone="stat-blue" /><StatCard icon={Clock3} label="ETA promedio" value="42 min" detail="-8 min" direction="up" tone="stat-mint" /><StatCard icon={Gauge} label="Rutas a tiempo" value="96%" detail="Excelente" direction="neutral" tone="stat-lilac" /></div><div className="mt-5"><MapPanel onAction={onAction} /></div></>;
  if (active === "transportistas") return <div className="surface-card overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf2f7] p-5 sm:p-6"><div><span className="section-kicker">RANKING AUTOMÁTICO</span><h2 className="mt-2 font-display text-[19px] font-bold text-[#17375f]">Mejores opciones para MV-1046</h2></div><button onClick={() => onAction("Filtros de transportistas abiertos")} className="subtle-button"><Settings2 size={14} /> Filtrar</button></div><div className="grid gap-3 p-4 sm:p-6">{carriers.map((carrier, index) => <div key={carrier.name} className="carrier-row"><div className="rank-badge">{index + 1}</div><div className={cx("avatar", `carrier-${carrier.tone}`)}>{carrier.initials}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="text-[13px] font-bold text-[#244568]">{carrier.name}</p>{carrier.verified && <ShieldCheck size={13} className="text-[#45b59e]" />}</div><p className="mt-1 text-[10px] text-[#8ca2bb]">{carrier.vehicle} · a {carrier.distance}</p></div><div className="hidden items-center gap-1 sm:flex"><Star size={13} className="fill-[#ffc46f] text-[#ffc46f]" /><span className="text-xs font-bold text-[#476685]">{carrier.score}</span></div><div className="text-right"><p className="text-[13px] font-bold text-[#244568]">{carrier.price}</p><p className="mt-1 text-[10px] text-[#9aadc2]">tarifa estimada</p></div><button onClick={() => onAction(`${carrier.name} seleccionado`)} className="secondary-button">Asignar</button></div>)}</div></div>;
  if (active === "cubicaje") return <div className="grid gap-5 xl:grid-cols-5"><div className="surface-card p-5 sm:p-6 xl:col-span-3"><div className="flex items-center justify-between"><div><span className="section-kicker">DESGLOSE VOLUMÉTRICO</span><h2 className="mt-2 font-display text-[19px] font-bold text-[#17375f]">Casa de Lucía Fernández</h2></div><button onClick={() => onAction("Objeto agregado al cubicaje")} className="primary-button"><Plus size={15} /> Agregar objeto</button></div><div className="mt-6 space-y-2">{[{name:"Sofá 3 cuerpos", details:"220 × 90 × 85 cm", volume:"1.68 m³", count:"01", icon:HomeIcon},{name:"Cajas medianas", details:"60 × 40 × 40 cm", volume:"1.44 m³", count:"10", icon:Package},{name:"Refrigeradora", details:"70 × 72 × 180 cm", volume:"0.91 m³", count:"01", icon:Boxes},{name:"Cama queen", details:"200 × 160 × 35 cm", volume:"1.12 m³", count:"01", icon:HomeIcon}].map((item) => {const Icon=item.icon; return <div key={item.name} className="item-row"><div className="item-icon"><Icon size={16} /></div><div className="min-w-0 flex-1"><p className="text-[12px] font-bold text-[#365779]">{item.name}</p><p className="mt-1 text-[10px] text-[#9aafc5]">{item.details}</p></div><span className="rounded-lg bg-[#f3f7fb] px-2.5 py-1 text-[10px] font-bold text-[#7590ad]">× {item.count}</span><span className="w-16 text-right text-[12px] font-bold text-[#41688e]">{item.volume}</span><button className="text-[#bdccdc] hover:text-[#648dbb]"><MoreHorizontal size={16} /></button></div>})}</div><div className="mt-5 rounded-xl bg-[#eef7ff] p-4"><div className="flex items-center justify-between"><span className="text-[11px] font-bold text-[#6687aa]">Volumen estimado</span><span className="font-display text-[21px] font-bold text-[#2f6fac]">5.15 m³</span></div><div className="mt-3 h-2 rounded-full bg-[#d9eafb]"><div className="h-full w-[44%] rounded-full bg-[#6aa7f5]" /></div><p className="mt-2 text-[10px] text-[#7899ba]">Capacidad recomendada: furgón de 12 m³</p></div></div><div className="surface-card p-5 sm:p-6 xl:col-span-2"><span className="section-kicker">RECOMENDACIÓN</span><div className="mt-5 flex justify-center"><div className="truck-illustration"><Truck size={54} strokeWidth={1.2} /></div></div><h3 className="mt-4 text-center font-display text-[17px] font-bold text-[#244568]">Furgón mediano</h3><p className="mt-2 text-center text-[11px] leading-relaxed text-[#91a5bc]">Espacio suficiente para el volumen calculado y 2 ayudantes.</p><div className="mt-5 space-y-3"><div className="flex justify-between text-[11px]"><span className="text-[#8ba1ba]">Ocupación</span><b className="text-[#416688]">43%</b></div><div className="flex justify-between text-[11px]"><span className="text-[#8ba1ba]">Costo base</span><b className="text-[#416688]">S/ 280</b></div><div className="flex justify-between text-[11px]"><span className="text-[#8ba1ba]">Margen sugerido</span><b className="text-[#41aa91]">+12%</b></div></div><button onClick={() => onAction("Cotización generada desde cubicaje")} className="primary-button mt-6 w-full justify-center">Generar cotización <ArrowUpRight size={14} /></button></div></div>;
  if (active === "pagos") return <div className="grid gap-5 xl:grid-cols-5"><div className="surface-card p-5 sm:p-6 xl:col-span-3"><div className="flex items-center justify-between"><div><span className="section-kicker">TRANSACCIONES</span><h2 className="mt-2 font-display text-[19px] font-bold text-[#17375f]">Actividad de pagos</h2></div><button onClick={() => onAction("Nuevo cobro preparado")} className="primary-button"><Plus size={15} /> Nuevo cobro</button></div><div className="mt-5 space-y-2">{[{id:"MV-1048",client:"Lucía Fernández",amount:"S/ 480.00",method:"Yape",status:"Completado",tone:"green",icon:Zap},{id:"MV-1047",client:"Diego Salazar",amount:"S/ 620.00",method:"Visa · •••• 4242",status:"Completado",tone:"green",icon:CreditCard},{id:"MV-1046",client:"Micaela Torres",amount:"S/ 395.00",method:"PayPal",status:"Pendiente",tone:"orange",icon:CircleDollarSign}].map((payment) => {const Icon=payment.icon; return <div key={payment.id} className="item-row"><div className={cx("payment-icon", `payment-${payment.tone}`)}><Icon size={15} /></div><div className="min-w-0 flex-1"><p className="text-[12px] font-bold text-[#365779]">{payment.client}</p><p className="mt-1 text-[10px] text-[#9aafc5]">{payment.id} · {payment.method}</p></div><span className={cx("status-pill", payment.tone === "green" ? "status-green" : "status-orange")}>{payment.status}</span><span className="w-20 text-right text-[12px] font-bold text-[#41688e]">{payment.amount}</span></div>})}</div></div><div className="surface-card p-5 sm:p-6 xl:col-span-2"><span className="section-kicker">MÉTODOS SOPORTADOS</span><h2 className="mt-2 font-display text-[18px] font-bold text-[#17375f]">Cobros sin fricción</h2><p className="mt-2 text-[11px] leading-relaxed text-[#90a4bb]">Simula el método preferido de cada cliente y confirma la operación en segundos.</p><div className="mt-6 grid grid-cols-3 gap-2"><div className="payment-method"><CreditCard size={18} /><span>Tarjeta</span></div><div className="payment-method"><span className="font-bold text-[#43b7a5]">Yape</span><span>QR</span></div><div className="payment-method"><span className="font-bold text-[#4d78dd]">P</span><span>PayPal</span></div></div><div className="mt-6 rounded-xl bg-[#f2f8ff] p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-white p-2 text-[#5e9af1]"><ReceiptText size={16} /></div><div><p className="text-[11px] font-bold text-[#456887]">Ingresos del mes</p><p className="mt-1 font-display text-[22px] font-bold text-[#214a7a]">S/ 8,420.50</p></div></div></div></div></div>;
  if (active === "incidencias") return <div className="grid gap-5 xl:grid-cols-5"><div className="surface-card p-5 sm:p-6 xl:col-span-3"><div className="flex items-center justify-between"><div><span className="section-kicker">CENTRO DE CALIDAD</span><h2 className="mt-2 font-display text-[19px] font-bold text-[#17375f]">Incidencias recientes</h2></div><button onClick={() => onAction("Nueva incidencia creada")} className="primary-button"><Plus size={15} /> Registrar</button></div><div className="mt-5 space-y-3">{[{title:"Acceso restringido en destino",sub:"MV-1048 · Reportada por Andes Cargo",time:"Hace 8 min",status:"En atención",tone:"orange",icon:AlertCircle},{title:"Cliente solicitó reprogramación",sub:"MV-1042 · Mudanzas Lima",time:"Hace 2 h",status:"Resuelta",tone:"green",icon:CalendarDays},{title:"Daño leve en caja #12",sub:"MV-1039 · Norte Express",time:"Ayer",status:"Con compensación",tone:"blue",icon:ShieldCheck}].map((incident) => {const Icon=incident.icon; return <div key={incident.title} className="incident-row"><div className={cx("alert-icon", `alert-icon-${incident.tone}`)}><Icon size={16} /></div><div className="min-w-0 flex-1"><p className="text-[12px] font-bold text-[#365779]">{incident.title}</p><p className="mt-1 text-[10px] text-[#9aafc5]">{incident.sub}</p><p className="mt-2 text-[10px] font-semibold text-[#b0bfd0]">{incident.time}</p></div><span className={cx("status-pill", incident.tone === "green" ? "status-green" : incident.tone === "orange" ? "status-orange" : "status-blue")}>{incident.status}</span><button onClick={() => onAction(`Detalle: ${incident.title}`)} className="text-[#b2c1d1] hover:text-[#5d8fc5]"><MoreHorizontal size={17} /></button></div>})}</div></div><div className="surface-card p-5 sm:p-6 xl:col-span-2"><span className="section-kicker">SATISFACCIÓN</span><h2 className="mt-2 font-display text-[18px] font-bold text-[#17375f]">Reseñas de clientes</h2><div className="mt-6 flex items-center gap-4"><span className="font-display text-[45px] font-bold tracking-[-0.07em] text-[#214a7a]">4.8</span><div><div className="flex gap-0.5 text-[#f5b65e]">{[1,2,3,4,5].map((i)=><Star key={i} size={16} fill="currentColor" />)}</div><p className="mt-2 text-[10px] text-[#91a5bd]">sobre 126 servicios</p></div></div><div className="mt-6 space-y-2.5">{[{n:5,p:82},{n:4,p:12},{n:3,p:4},{n:2,p:1},{n:1,p:1}].map((rating)=><div key={rating.n} className="flex items-center gap-2 text-[10px] text-[#8fa5bc]"><span className="w-3">{rating.n}</span><Star size={11} className="fill-[#f5c36e] text-[#f5c36e]" /><div className="h-1.5 flex-1 rounded-full bg-[#edf2f6]"><div style={{width:`${rating.p}%`}} className="h-full rounded-full bg-[#f4c06b]" /></div><span className="w-7 text-right">{rating.p}%</span></div>)}</div><button onClick={() => onAction("Todas las reseñas abiertas")} className="secondary-button mt-6 w-full justify-center">Ver todas las reseñas</button></div></div>;
  return <div className="surface-card p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><span className="section-kicker">{active === "mudanzas" ? "ORDENES EN CURSO" : "WORKSPACE"}</span><h2 className="mt-2 font-display text-[19px] font-bold text-[#17375f]">{moduleMeta[active].title}</h2><p className="mt-2 text-[11px] text-[#91a5bd]">{moduleMeta[active].description}</p></div><button onClick={() => onAction("Nuevo flujo iniciado")} className="primary-button"><Plus size={15} /> Crear nuevo</button></div><div className="mt-7 grid gap-4 md:grid-cols-3"><div className="module-placeholder"><FileText size={18} /><p className="mt-3 text-[12px] font-bold text-[#416789]">Planifica en un solo lugar</p><p className="mt-1 text-[10px] leading-relaxed text-[#98abc0]">Centraliza clientes, direcciones y estado de cada servicio.</p></div><div className="module-placeholder"><UsersRound size={18} /><p className="mt-3 text-[12px] font-bold text-[#416789]">Colabora con tu equipo</p><p className="mt-1 text-[10px] leading-relaxed text-[#98abc0]">Todos ven los cambios y reciben notificaciones a tiempo.</p></div><div className="module-placeholder"><MessageSquareText size={18} /><p className="mt-3 text-[12px] font-bold text-[#416789]">Comunicación clara</p><p className="mt-1 text-[10px] leading-relaxed text-[#98abc0]">Actualiza a tus clientes automáticamente en cada hito.</p></div></div></div>;
}

function NotificationDrawer({ onClose, onAction }: { onClose: () => void; onAction: (message: string) => void }) {
  return <div className="fixed inset-0 z-50 flex justify-end bg-[#12335b]/10 backdrop-blur-[2px]" onClick={onClose}><div className="h-full w-full max-w-[370px] border-l border-[#e0eaf4] bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><div><span className="section-kicker">CENTRO DE AVISOS</span><h2 className="mt-2 font-display text-[20px] font-bold text-[#17375f]">Notificaciones</h2></div><button onClick={onClose} className="icon-button"><X size={17} /></button></div><div className="mt-7 space-y-3"><div className="notification-item"><div className="alert-icon alert-icon-orange"><AlertCircle size={15} /></div><div><p className="text-xs font-bold text-[#355677]">Nuevo incidente</p><p className="mt-1 text-[10px] leading-relaxed text-[#91a6bd]">Se reportó un acceso restringido en MV-1048.</p><span className="mt-2 block text-[10px] text-[#b3c0ce]">Hace 8 minutos</span></div></div><div className="notification-item"><div className="alert-icon alert-icon-blue"><Truck size={15} /></div><div><p className="text-xs font-bold text-[#355677]">Vehículo acercándose</p><p className="mt-1 text-[10px] leading-relaxed text-[#91a6bd]">Andes Cargo está a 1.8 km del destino.</p><span className="mt-2 block text-[10px] text-[#b3c0ce]">Hace 18 minutos</span></div></div><div className="notification-item"><div className="alert-icon alert-icon-green"><Check size={15} /></div><div><p className="text-xs font-bold text-[#355677]">Pago confirmado</p><p className="mt-1 text-[10px] leading-relaxed text-[#91a6bd]">Yape confirmó el pago de MV-1047.</p><span className="mt-2 block text-[10px] text-[#b3c0ce]">Hace 32 minutos</span></div></div></div><button onClick={() => { onAction("Notificaciones marcadas como leídas"); onClose(); }} className="secondary-button mt-7 w-full justify-center">Marcar como leídas</button></div></div>;
}

export default function Home() {
  const [active, setActive] = useState<ModuleKey>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const current = useMemo(() => moduleMeta[active], [active]);

  const onAction = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2800);
  };

  const changeModule = (key: ModuleKey) => {
    setActive(key);
    setMobileOpen(false);
  };

  return <div className="min-h-screen bg-[#f7faff] text-[#16365f]"><SideNav active={active} onChange={changeModule} /><MobileBar onMenu={() => setMobileOpen(true)} onBell={() => setNotificationsOpen(true)} /><main className="min-h-screen lg:pl-[248px]"><Header active={active} onBell={() => setNotificationsOpen(true)} onAction={onAction} /><div className="px-5 py-6 sm:px-8 lg:px-10 lg:py-8"><div className="mb-6 flex items-center justify-between"><div className="flex items-center gap-2 text-[11px] font-semibold text-[#92a7be]"><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#4bb79e]" /> Sistema operativo</span><span className="hidden text-[#cbd7e4] sm:inline">·</span><span className="hidden sm:inline">Última sincronización: hace 2 min</span></div><div className="hidden items-center gap-2 text-[11px] font-semibold text-[#7e98b7] sm:flex"><CalendarDays size={14} /> 13 — 19 sep 2026 <ChevronDown size={14} /></div></div>{active === "overview" ? <Overview onAction={onAction} /> : <ModuleView active={active} onAction={onAction} />}</div></main>{mobileOpen && <div className="fixed inset-0 z-40 bg-[#0d2f57]/20 lg:hidden" onClick={() => setMobileOpen(false)}><div className="h-full w-[280px] bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between px-2"><Logo /><button onClick={() => setMobileOpen(false)} className="icon-button"><X size={17} /></button></div><div className="mt-10 space-y-8">{navGroups.map((group) => <div key={group.label}><div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a7b8ce]">{group.label}</div><div className="space-y-1.5">{group.items.map((item) => {const Icon=item.icon; return <button key={item.key} onClick={() => changeModule(item.key as ModuleKey)} className={cx("nav-item", active === item.key && "nav-item-active") }><Icon size={17} /><span>{item.label}</span>{item.badge && <span className="ml-auto rounded-full bg-[#edf4fd] px-2 py-0.5 text-[10px] font-bold text-[#7f9cc0]">{item.badge}</span>}</button>})}</div></div>)}</div></div></div>}{notificationsOpen && <NotificationDrawer onClose={() => setNotificationsOpen(false)} onAction={onAction} />}{toast && <div className="toast-message"><div className="toast-check"><Check size={14} /></div><span>{toast}</span></div>}</div>;
}
