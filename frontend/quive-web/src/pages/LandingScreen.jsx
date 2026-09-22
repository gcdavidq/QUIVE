import React from "react";
import { 
  Truck, 
  MapPin, 
  Boxes, 
  ArrowRight, 
  Sparkles, 
  Navigation, 
  ShieldCheck, 
  Sun, 
  Moon,
  CreditCard
} from "lucide-react";
import { useTheme } from "../ThemeContext";

const LandingScreen = ({ onNavigate }) => {
  const { resolvedTheme, setThemePreference } = useTheme();

  return ( 
    <div className="min-h-screen theme-bg-primary theme-text-primary transition-colors duration-200">
      {/* Glow suave superior de fondo */}
      <div className="absolute top-0 inset-x-0 h-[480px] bg-gradient-to-b from-[#eaf3ff] via-[#f4f9ff]/60 to-transparent dark:from-[#132742]/40 dark:via-transparent pointer-events-none -z-10" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-[#0d1726]/80 border-b border-[#e2ebf5] dark:border-[#213652] transition-colors">
        <div className="container mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
          
          {/* Logo con Brand Mark estilo MoveFlow */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('/')}>
            <div className="brand-mark">
              <span className="brand-mark-shape" />
              <span className="brand-mark-dot" />
            </div>
            <div className="leading-tight">
              <span className="block font-display text-[21px] font-extrabold tracking-[-0.04em] text-[#102c53] dark:text-white">
                QUIVE<span className="text-[#4d93f5]">.</span>
              </span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#8ea6c5]">
                Logística simple
              </span>
            </div>
          </div>

          {/* Navegación central desktop */}
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-[#5c7b9e] dark:text-[#90a9c8]">
            <a href="#como-funciona" className="hover:text-[#4d93f5] transition-colors">¿Cómo funciona?</a>
            <a href="#servicios" className="hover:text-[#4d93f5] transition-colors">Servicios</a>
            <a href="#transportistas" className="hover:text-[#4d93f5] transition-colors">Transportistas</a>
          </nav>

          {/* Botones de acción y Theme Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setThemePreference(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="icon-button h-9 w-9"
              aria-label="Cambiar tema"
            >
              {resolvedTheme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>

            <button 
              onClick={() => onNavigate('/login')}
              className="hidden sm:inline-flex px-4 py-2 text-[12px] font-bold text-[#456b94] dark:text-[#a0b8d4] hover:text-[#4d93f5] transition-colors"
            >
              Iniciar Sesión
            </button>

            <button 
              onClick={() => onNavigate('/register')}
              className="primary-button text-[12px] !py-2.5 !px-5"
            >
              Registrarse
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-5 sm:px-8 pt-12 pb-16 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Columna Izquierda: Mensaje principal y CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e8f3ff] dark:bg-[#163152] border border-[#d6e7fc] dark:border-[#21436e] text-[#3b7edb] dark:text-[#7db1f9] text-[11px] font-bold tracking-wide uppercase">
              <Sparkles size={13} className="text-[#4d93f5] animate-pulse" />
              <span>Plataforma Logística y Mudanzas en Perú</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.04em] text-[#102c53] dark:text-white leading-[1.12]">
              QUIVE, una mudanza sin estrés<span className="text-[#4d93f5]">.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#5a799c] dark:text-[#90a8c4] leading-relaxed max-w-xl">
              Conectamos a clientes con transportistas verificados en minutos. Cotiza el cubicaje exacto de tus pertenencias, obtén rutas viales óptimas y sigue el vehículo satelitalmente en tiempo real.
            </p>

            {/* CTAs de acción */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button 
                onClick={() => onNavigate('/login')}
                className="primary-button text-[14px] !py-3.5 !px-7 shadow-lg hover:shadow-xl"
              >
                <span>INICIAR UNA MUDANZA</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>

              <button 
                onClick={() => onNavigate('/login')}
                className="secondary-button text-[13px] !py-3.5 !px-6"
              >
                <span className="text-amber-500">⚡</span>
                <span>Acceso Demo 1-Clic</span>
              </button>
            </div>

            {/* Qué incluye el servicio (funcionalidades reales, sin cifras) */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-[12px] font-semibold text-[#6f8ba8] dark:text-[#8ea5bf]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[#45bba2]" />
                <span>Documentos del transportista revisados</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Navigation size={16} className="text-[#4d93f5]" />
                <span>Seguimiento GPS del traslado</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Showcase Visual estilo MoveFlow */}
          <div className="lg:col-span-5">
            <div className="surface-card p-5 sm:p-6 shadow-xl relative overflow-hidden group">
              {/* Header de la tarjeta */}
              <div className="flex items-center justify-between pb-4 border-b border-[#edf2f7] dark:border-[#213652]">
                <div>
                  <span className="section-kicker">EJEMPLO ILUSTRATIVO</span>
                  <h3 className="font-display text-[16px] font-bold text-[#102c53] dark:text-white mt-1">
                    Así verás tu mudanza en ruta
                  </h3>
                </div>
                <span className="live-pill">
                  <span className="live-dot" /> VISTA DE MUESTRA
                </span>
              </div>

              {/* Mapa y Ruta Simulada Visual */}
              <div className="my-4 relative h-40 rounded-xl overflow-hidden bg-gradient-to-br from-[#eaf4fb] to-[#dbeef9] dark:from-[#13273e] dark:to-[#173352] border border-[#d6e5f3] dark:border-[#234267] p-3 flex flex-col justify-between">
                <div className="flex justify-between items-center text-[10px] font-bold text-[#6285a8]">
                  <span className="flex items-center gap-1 bg-white/80 dark:bg-[#102339]/80 px-2 py-1 rounded-md backdrop-blur">
                    <MapPin size={11} className="text-blue-500" /> Origen
                  </span>
                  <span className="flex items-center gap-1 bg-white/80 dark:bg-[#102339]/80 px-2 py-1 rounded-md backdrop-blur">
                    <Navigation size={11} className="text-emerald-500" /> Destino
                  </span>
                </div>

                {/* SVG Route Curve */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 120" preserveAspectRatio="none">
                  <path d="M 30 90 Q 150 10, 270 50" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
                  <path d="M 30 90 Q 150 10, 270 50" fill="none" stroke="#4d93f5" strokeWidth="3" strokeDasharray="6 4" strokeLinecap="round" />
                </svg>

                {/* Truck marker */}
                <div className="absolute left-[54%] top-[24%] transform -translate-x-1/2 -translate-y-1/2 bg-[#4d93f5] text-white p-2 rounded-xl shadow-lg animate-bounce">
                  <Truck size={16} />
                </div>

              </div>

              {/* Qué datos muestra el seguimiento real */}
              <div className="carrier-row !p-3">
                <div className="avatar stat-blue text-[#4d93f5]"><Truck size={16} /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-[#16365f] dark:text-white">Tu transportista y su vehículo</p>
                  <p className="text-[10px] text-[#8aa0ba]">Nombre, placa, capacidad y calificaciones reales</p>
                </div>
              </div>

              {/* Resumen volumétrico rápido */}
              <div className="mt-3.5 pt-3 border-t border-[#edf2f7] dark:border-[#213652] flex items-center justify-between text-[11px]">
                <span className="text-[#849bb3] flex items-center gap-1.5">
                  <Boxes size={13} className="text-indigo-500" />
                  Volumen calculado con tus objetos
                </span>
                <span className="font-bold text-[#4d93f5] cursor-pointer hover:underline" onClick={() => onNavigate('/login')}>
                  Probar con la cuenta demo →
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Características principales */}
      <section id="servicios" className="container mx-auto px-5 sm:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="section-kicker">TECNOLOGÍA Y EFICIENCIA</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#102c53] dark:text-white tracking-tight mt-2">
            ¿Por qué elegir QUIVE para tu mudanza?
          </h2>
          <p className="text-[#6484a7] dark:text-[#90a8c2] text-sm sm:text-base mt-3">
            Digitalizamos cada aspecto de la mudanza tradicional para brindarte tranquilidad, transparencia de precios y puntualidad.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="surface-card p-6 text-left hover:-translate-y-1 transition-transform">
            <div className="stat-icon stat-blue mb-4">
              <Truck size={20} />
            </div>
            <h3 className="font-display text-[16px] font-bold text-[#102c53] dark:text-white mb-2">
              Transportistas Verificados
            </h3>
            <p className="text-[#6d8cae] dark:text-[#8ea6be] text-xs leading-relaxed">
              Todos los conductores pasan por estricto filtro de antecedentes, SOAT, revisión técnica y certificación domiciliaria.
            </p>
          </div>

          {/* Card 2 */}
          <div className="surface-card p-6 text-left hover:-translate-y-1 transition-transform">
            <div className="stat-icon stat-lilac mb-4">
              <Boxes size={20} />
            </div>
            <h3 className="font-display text-[16px] font-bold text-[#102c53] dark:text-white mb-2">
              Cubicaje Automatizado
            </h3>
            <p className="text-[#6d8cae] dark:text-[#8ea6be] text-xs leading-relaxed">
              Calcula volumen y peso seleccionando tus muebles y electrodomésticos. Te recomendamos el vehículo ideal para no pagar de más.
            </p>
          </div>

          {/* Card 3 */}
          <div className="surface-card p-6 text-left hover:-translate-y-1 transition-transform">
            <div className="stat-icon stat-mint mb-4">
              <Navigation size={20} />
            </div>
            <h3 className="font-display text-[16px] font-bold text-[#102c53] dark:text-white mb-2">
              Telemetría GPS en Vivo
            </h3>
            <p className="text-[#6d8cae] dark:text-[#8ea6be] text-xs leading-relaxed">
              Rastreo satelital punto a punto mediante OpenRouteService y Leaflet para saber en todo momento dónde están tus cosas.
            </p>
          </div>

          {/* Card 4 */}
          <div className="surface-card p-6 text-left hover:-translate-y-1 transition-transform">
            <div className="stat-icon stat-peach mb-4">
              <CreditCard size={20} />
            </div>
            <h3 className="font-display text-[16px] font-bold text-[#102c53] dark:text-white mb-2">
              Pagos Multimétodo Seguros
            </h3>
            <p className="text-[#6d8cae] dark:text-[#8ea6be] text-xs leading-relaxed">
              Acepta Tarjeta de Crédito, débito, Yape y PayPal con liberación de fondos condicionada a la entrega en conformidad.
            </p>
          </div>
        </div>
      </section>

      {/* Flujo en 3 Pasos */}
      <section id="como-funciona" className="border-t border-[#e2ebf5] dark:border-[#213652] bg-[#f2f7fc] dark:bg-[#0c1624] py-20">
        <div className="container mx-auto px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="section-kicker">EXPERIENCIA SIMPLE</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#102c53] dark:text-white tracking-tight mt-2">
              Tu mudanza en 3 pasos sencillos
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="surface-card p-6 text-center relative">
              <div className="w-10 h-10 rounded-full bg-[#4d93f5] text-white font-display font-bold text-lg flex items-center justify-center mx-auto mb-4 shadow-md">
                1
              </div>
              <h3 className="font-display text-[16px] font-bold text-[#102c53] dark:text-white mb-2">
                Ingresa origen, destino y carga
              </h3>
              <p className="text-[#6d8cae] dark:text-[#8ea6be] text-xs leading-relaxed">
                Elige direcciones y marca los muebles o cajas a trasladar. El algoritmo calculará volumen y distancia exacta al instante.
              </p>
            </div>

            <div className="surface-card p-6 text-center relative">
              <div className="w-10 h-10 rounded-full bg-[#3db198] text-white font-display font-bold text-lg flex items-center justify-center mx-auto mb-4 shadow-md">
                2
              </div>
              <h3 className="font-display text-[16px] font-bold text-[#102c53] dark:text-white mb-2">
                Elige tu transportista
              </h3>
              <p className="text-[#6d8cae] dark:text-[#8ea6be] text-xs leading-relaxed">
                Visualiza el ranking de conductores ordenados por cercanía, tarifa y reputación histórica. Selecciona el que mejor se ajuste.
              </p>
            </div>

            <div className="surface-card p-6 text-center relative">
              <div className="w-10 h-10 rounded-full bg-[#8d7ce5] text-white font-display font-bold text-lg flex items-center justify-center mx-auto mb-4 shadow-md">
                3
              </div>
              <h3 className="font-display text-[16px] font-bold text-[#102c53] dark:text-white mb-2">
                Sigue el viaje en tiempo real
              </h3>
              <p className="text-[#6d8cae] dark:text-[#8ea6be] text-xs leading-relaxed">
                Monitorea el trayecto en el mapa satelital hasta el punto de entrega. Califica el servicio al finalizar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Call To Action */}
      <section className="container mx-auto px-5 sm:px-8 py-16">
        <div className="surface-card bg-gradient-to-r from-[#21518f] via-[#2f6cb5] to-[#4d93f5] p-8 sm:p-12 text-white rounded-3xl text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-200">
              ¿Listo para empezar?
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
              Haz tu mudanza hoy mismo de forma rápida y segura
            </h2>
            <p className="text-blue-100 text-sm sm:text-base">
              Accede a la plataforma de demostración interactiva o regístrate en menos de dos minutos.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => onNavigate('/login')}
                className="px-7 py-3.5 bg-white text-[#1a4478] rounded-xl font-bold text-sm hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
              >
                PROBAR DEMO INTERACTIVA
              </button>
              <button 
                onClick={() => onNavigate('/register')}
                className="px-7 py-3.5 bg-blue-900/40 border border-white/30 text-white rounded-xl font-bold text-sm hover:bg-blue-900/60 transition-all"
              >
                CREAR CUENTA NUEVA
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e2ebf5] dark:border-[#213652] py-8 text-center text-xs text-[#7f99b5]">
        <div className="container mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="brand-mark h-6 w-6 !rounded-md">
              <span className="brand-mark-shape !h-2.5 !w-2.5 !top-1 !left-1.5" />
              <span className="brand-mark-dot !h-1 !w-1 !bottom-1 !left-1.5" />
            </div>
            <span className="font-bold text-[#16365f] dark:text-white">QUIVE Logistics Platform</span>
          </div>
          <p>© 2026 QUIVE. Todos los derechos reservados. Desarrollado con dedicación.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingScreen;