import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Users, 
  Award, 
  TrendingUp, 
  Download, 
  Search, 
  Bell, 
  Send, 
  LogOut, 
  Mail, 
  Clock, 
  Phone,
  LayoutDashboard,
  X,
  CheckCircle2,
  FileText,
  Activity,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Check,
  ExternalLink
} from "lucide-react";
import { motion } from "motion/react";

interface AdminPanelProps {
  onLogoutAdmin: () => void;
}

interface MetricSummary {
  totalUsers: number;
  activeUsers: number;
  completedUsers: number;
  completionRate: number;
  averageProgress: number;
}

interface CapturedEmail {
  nombre: string;
  email: string;
  disabled?: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogoutAdmin }) => {
  const [metrics, setMetrics] = useState<MetricSummary>({
    totalUsers: 0,
    activeUsers: 0,
    completedUsers: 0,
    completionRate: 0,
    averageProgress: 0
  });

  const [usersList, setUsersList] = useState<CapturedEmail[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Hotmart Webhook Logs states
  const [hotmartLogs, setHotmartLogs] = useState<any[]>([]);
  const [hotmartSecretLen, setHotmartSecretLen] = useState<number>(0);
  const [hotmartSecretMasked, setHotmartSecretMasked] = useState<string>("");
  const [isLogsLoading, setIsLogsLoading] = useState(false);

  // Notification states
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyBody, setNotifyBody] = useState("");
  const [notifyCategory, setNotifyCategory] = useState("Alerta Motivacional");
  const [notifyTargetEmail, setNotifyTargetEmail] = useState("ALL");
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifySuccessMsg, setNotifySuccessMsg] = useState<string | null>(null);

  const fetchHotmartLogs = async () => {
    try {
      setIsLogsLoading(true);
      const token = localStorage.getItem("MAPA_ACCESS_TOKEN");
      const res = await fetch("/api/admin/hotmart-logs", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("No se pudieron cargar los registros de Hotmart.");
      const data = await res.json();
      if (data.success) {
        setHotmartLogs(data.logs || []);
        setHotmartSecretLen(data.webhook_secret_length || 0);
        setHotmartSecretMasked(data.webhook_secret_first_last || "no_set");
      }
    } catch (err) {
      console.error("Error fetching Hotmart logs:", err);
    } finally {
      setIsLogsLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("MAPA_ACCESS_TOKEN");
      const res = await fetch("/api/admin/metrics", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Error cargando métricas.");
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setUsersList(data.capturedEmails);
      }
      await fetchHotmartLogs();
    } catch (e: any) {
      setErrorMessage(e.message || "Fallo crítico al conectar con el servidor administrativo.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDispatchPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyTitle.trim() || !notifyBody.trim()) return;

    try {
      setNotifyLoading(true);
      setNotifySuccessMsg(null);
      const token = localStorage.getItem("MAPA_ACCESS_TOKEN");
      const res = await fetch("/api/admin/dispatch-push", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: notifyTitle.trim().slice(0, 50),
          body: notifyBody.trim().slice(0, 160),
          category: notifyCategory,
          userEmail: notifyTargetEmail === "ALL" ? "" : notifyTargetEmail
        })
      });

      const data = await res.json();
      if (data.success) {
        setNotifySuccessMsg(data.message || "Notificación enviada.");
        setNotifyTitle("");
        setNotifyBody("");
        setTimeout(() => setNotifySuccessMsg(null), 4000);
      } else {
        throw new Error(data.error || "Ocurrió un error.");
      }
    } catch (err: any) {
      alert("Fallo al enviar notificación: " + err.message);
    } finally {
      setNotifyLoading(false);
    }
  };

  const handleToggleUserStatus = async (email: string, makeDisabled: boolean) => {
    try {
      const token = localStorage.getItem("MAPA_ACCESS_TOKEN");
      const res = await fetch("/api/admin/toggle-user-status", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ email, disabled: makeDisabled })
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(prev => prev.map(u => u.email === email ? { ...u, disabled: makeDisabled } : u));
      } else {
        alert("Error al cambiar estado: " + (data.error || "Desconocido"));
      }
    } catch (err: any) {
      alert("Error al conectar con el servidor: " + err.message);
    }
  };

  // Export current list as JSON download
  const handleExportJSON = () => {
    if (usersList.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(usersList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `MAPA_Export_Usuarios_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.nombre.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.whatsapp && u.whatsapp.includes(q))
    );
  });

  const handleGoogleAuthConnect = async () => {
    try {
      const token = localStorage.getItem("MAPA_ACCESS_TOKEN");
      const res = await fetch("/api/auth/google-url", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "OAUTH_CLIENT_ID no está configurado en secretos.");
      }
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      alert("Error al conectar cuenta Google: " + err.message);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 py-6 px-4 text-slate-800" id="admin_dashboard_element">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-2">
        <div className="flex items-center space-x-4 text-left">
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-center shrink-0">
            <LayoutDashboard className="w-6 h-6 text-[#B5179E]" />
          </div>
          <div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[#56346F] tracking-tight">
              M.A.P.A.™ Panel Administrativo
            </h2>
            <p className="text-xs text-slate-500 font-sans tracking-wide">
              Métricas exclusivas para el Administrador Principal (contacto@tupodermental.club)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button 
            onClick={handleGoogleAuthConnect}
            className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-xs font-mono text-indigo-700 rounded-xl transition-all cursor-pointer font-bold flex items-center space-x-1.5"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Vincular Gmail</span>
          </button>
          <button 
            onClick={fetchAdminData}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-mono text-slate-700 rounded-xl transition-all cursor-pointer font-bold"
          >
            Actualizar
          </button>
          <button
            onClick={onLogoutAdmin}
            className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-mono text-rose-600 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer font-bold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir de Consola</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 space-y-3">
          <div className="w-10 h-10 border-2 border-[#6E488A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-500">Recuperando registros directos del servidor...</p>
        </div>
      ) : errorMessage ? (
        <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl text-center space-y-3 max-w-md mx-auto">
          <span className="text-2xl">⚠️</span>
          <p className="text-sm font-sans text-rose-700">{errorMessage}</p>
          <button 
            onClick={fetchAdminData} 
            className="px-4 py-1.5 bg-white border border-rose-200 rounded-xl text-xs text-rose-700 hover:bg-rose-50 transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          {/* ANALYSIS GRID - METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Cards 1: Total Users row */}
            <div 
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 space-y-2 text-left shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase">REGISTRADOS</span>
                <Users className="w-4 h-4 text-[#B5179E]" />
              </div>
              <p className="text-4xl font-display font-black text-[#6E488A]">{metrics.totalUsers}</p>
              <span className="text-[9px] font-mono text-slate-500">Captura total acumulada</span>
            </div>

            {/* Cards 2: Active Users */}
            <div 
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 space-y-2 text-left shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase">ACTIVOS RECIENTES</span>
                <Clock className="w-4 h-4 text-[#B5179E]" />
              </div>
              <p className="text-4xl font-display font-black text-[#6E488A]">{metrics.activeUsers}</p>
              <span className="text-[9px] font-mono text-slate-500">Últimos 30 días de sintonía</span>
            </div>

            {/* Cards 3: Completed program */}
            <div 
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 space-y-2 text-left shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase">COMPLETADOS</span>
                <Award className="w-4 h-4 text-[#B5179E]" />
              </div>
              <p className="text-4xl font-display font-black text-[#6E488A]">{metrics.completedUsers}</p>
              <span className="text-[9px] font-mono text-slate-500">Avances de 7 Días completos</span>
            </div>

            {/* Cards 4: Rates completed */}
            <div 
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 space-y-2 text-left shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase">TASA FINALIZACIÓN</span>
                <TrendingUp className="w-4 h-4 text-[#B5179E]" />
              </div>
              <p className="text-4xl font-display font-black text-[#6E488A]">{metrics.completionRate}%</p>
              <span className="text-[9px] font-mono text-slate-500">Porcentaje de éxito total</span>
            </div>

            {/* Cards 5: Day Progress avg */}
            <div 
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 space-y-2 text-left shadow-sm hover:shadow-md transition-all duration-300 w-full"
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase">AVANCE PROMEDIO</span>
                <BarChart3 className="w-4 h-4 text-[#B5179E]" />
              </div>
              <p className="text-4xl font-display font-black text-[#6E488A]">{metrics.averageProgress} Días</p>
              <span className="text-[9px] font-mono text-slate-500">Mediana de sintonía activa</span>
            </div>

          </div>

          {/* TWO MAIN MODULES: REGISTRY LIST AND PUSH NOTIFICATIONS GESTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* TABULAR REGISTRY MODULE - Left/8 Columns */}
            <div 
              className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm text-left"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-display font-black text-xl text-[#56346F]">
                    Correos Capturados y Avance
                  </h3>
                  <p className="text-xs text-slate-500">Registro histórico de leads y fases activas en M.A.P.A.™</p>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-60">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar por nombre, correo..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#6E488A] p-2 pl-9 text-xs rounded-xl outline-none text-slate-800 font-sans transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <button 
                    onClick={handleExportJSON}
                    disabled={usersList.length === 0}
                    className="p-2.5 bg-[#36C4D8] hover:bg-[#27A1B2] text-white font-mono font-black text-xs rounded-xl transition-all cursor-pointer disabled:opacity-40 select-none flex items-center space-x-1.5 px-4 shrink-0 border-none uppercase shadow-sm"
                    title="Exportar base de datos a archivo JSON"
                  >
                    <Download className="w-4 h-4 stroke-[3px]" />
                    <span>Exportar</span>
                  </button>
                </div>
              </div>

              {/* Responsive Table grid flow */}
              <div className="overflow-x-auto w-full">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-xs font-mono text-slate-400">No se encontraron registros de usuarios con ese criterio.</p>
                  </div>
                ) : (
                  <table className="w-full text-xs font-sans text-slate-700">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-600 uppercase font-mono tracking-wider text-[10px] text-left bg-slate-50">
                        <th className="py-3 px-3">Usuario / Email</th>
                        <th className="py-3 px-3 text-right">Estado / Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u, i) => (
                        <tr 
                          key={i} 
                          className={`border-b border-slate-100 hover:bg-slate-50/50 transition-all duration-150 ${u.disabled ? "opacity-60 bg-slate-50" : ""}`}
                        >
                          <td className="py-3.5 px-3 text-left">
                            <span className="font-bold text-slate-900 block leading-tight">{u.nombre}</span>
                            <span className="text-[10px] text-slate-500 block font-mono">{u.email}</span>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <div className="flex flex-col items-end space-y-1.5">
                              <span className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-mono uppercase font-black border ${
                                u.disabled 
                                  ? "bg-slate-100 text-slate-600 border-slate-200" 
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}>
                                {u.disabled ? "Inhabilitado" : "Activo"}
                              </span>
                              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                <button
                                  onClick={() => handleToggleUserStatus(u.email, !u.disabled)}
                                  className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all cursor-pointer border ${
                                    u.disabled 
                                      ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200" 
                                      : "bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200"
                                  }`}
                                >
                                  {u.disabled ? "Habilitar" : "Inhabilitar"}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* SYSTEM GESTIONS COLUMN - Right/4 Columns */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* NOTIFICATIONS DISPATCH GESTION */}
              <div 
                className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm text-left"
              >
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-display font-black text-xl text-[#56346F] flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-[#E86FA3] shrink-0 animate-bounce" />
                    <span>Gestor de Alertas M.A.P.A.</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">Despacha alertas motivacionales o guías rápidas instantáneas en tiempo real.</p>
                </div>

                <form onSubmit={handleDispatchPush} className="space-y-4 pt-1">
                  
                  {/* Selector de Categoría */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black">
                      Categoría de Alerta
                    </label>
                    <select
                      value={notifyCategory}
                      onChange={(e) => setNotifyCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#6E488A] p-2.5 rounded-xl text-xs outline-none text-slate-800 transition-all font-sans"
                    >
                      <option className="bg-white text-slate-800" value="Alerta Motivacional">🌸 Alerta Motivacional</option>
                      <option className="bg-white text-slate-800" value="Guía Rápida de Emergencia">⚡ Guía Rápida de Emergencia</option>
                    </select>
                  </div>

                  {/* Target user email select */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black">
                      Destinatarios de Alerta
                    </label>
                    <select
                      value={notifyTargetEmail}
                      onChange={(e) => setNotifyTargetEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#6E488A] p-2.5 rounded-xl text-xs outline-none text-slate-800 transition-all font-sans"
                    >
                      <option className="bg-white text-slate-800" value="ALL">📢 Todas las usuarias activas</option>
                      {usersList.slice(0, 10).map((u, idx) => (
                        <option className="bg-white text-slate-800" key={idx} value={u.email}>
                          👤 {u.nombre.slice(0, 15)} ({u.email.slice(0, 15)}...)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Title notification */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black">
                        Título de Alerta
                      </label>
                      <span className="text-[9px] font-mono text-slate-400">
                        {notifyTitle.length}/50
                      </span>
                    </div>
                    <input 
                      type="text" 
                      required
                      maxLength={50}
                      placeholder="Ej. Sintonía del Día: Respira y regula"
                      value={notifyTitle}
                      onChange={(e) => setNotifyTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#6E488A] p-2.5 rounded-xl text-xs outline-none text-slate-800 transition-all font-sans placeholder:text-slate-400"
                    />
                  </div>

                  {/* Body paragraph */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black">
                        Mensaje de Alerta
                      </label>
                      <span className="text-[9px] font-mono text-slate-400">
                        {notifyBody.length}/160
                      </span>
                    </div>
                    <textarea 
                      required
                      maxLength={160}
                      rows={3}
                      placeholder="Ej. Dedica 3 minutos hoy a sintonizar tu respiración somática de alivio con la Mentora Clara."
                      value={notifyBody}
                      onChange={(e) => setNotifyBody(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#6E488A] p-2.5 rounded-xl text-xs outline-none text-slate-800 transition-all font-sans placeholder:text-slate-400 resize-none"
                    />
                  </div>

                  {notifySuccessMsg && (
                    <p className="text-[11px] font-mono p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl leading-relaxed animate-fadeIn shadow-sm">
                      ✔ {notifySuccessMsg}
                    </p>
                  )}

                  {/* Submit trigger button */}
                  <button
                    type="submit"
                    disabled={notifyLoading || !notifyTitle.trim() || !notifyBody.trim()}
                    className="w-full py-3 bg-gradient-to-r from-[#6E488A] to-[#E86FA3] hover:opacity-95 text-white font-display font-black text-xs tracking-widest rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer border-none shadow-sm active:scale-95 disabled:opacity-40 disabled:pointer-events-none uppercase"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                    <span>{notifyLoading ? "DESPACHANDO..." : "DESPACHAR ALERTA EN VIVO ➔"}</span>
                  </button>

                </form>
              </div>

            </div>

          </div>

          {/* SECCIÓN EXCLUSIVA DE DIAGNÓSTICO DE SINCRONIZACIÓN HOTMART */}
          <div 
            className="w-full bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm text-left mt-6 text-slate-800"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display font-black text-xl text-[#56346F] flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#E86FA3] animate-pulse" />
                  Sincronización Hotmart: Monitor de Estado y Logs
                </h3>
                <p className="text-xs text-slate-500">Monitorea las peticiones de Webhook recibidas desde Hotmart en tiempo real.</p>
              </div>
              <button 
                onClick={fetchHotmartLogs}
                disabled={isLogsLoading}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-mono transition-all flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLogsLoading ? 'animate-spin' : ''}`} />
                <span>{isLogsLoading ? 'Actualizando...' : 'Actualizar Logs'}</span>
              </button>
            </div>

            {/* SECRETS STATUS BLOCK */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs font-sans">
              <div className="space-y-1">
                <span className="text-slate-500 block font-mono text-[10px] uppercase tracking-wider text-left">VARIABLE DE ENTORNO EN AI STUDIO</span>
                <span className="font-mono text-indigo-700 font-bold block text-left">HOTMART_WEBHOOK_SECRET</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 block font-mono text-[10px] uppercase tracking-wider text-left">ESTADO DE CONFIGURACIÓN</span>
                {hotmartSecretLen > 0 ? (
                  <span className="text-emerald-700 flex items-center gap-1 font-bold text-left">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Configurado ({hotmartSecretLen} caracteres)
                  </span>
                ) : (
                  <span className="text-amber-700 flex items-center gap-1 font-bold text-left">
                    <AlertTriangle className="w-4 h-4 text-amber-600" /> No configurado o vacío
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 block font-mono text-[10px] uppercase tracking-wider text-left">PREVISUALIZACIÓN DE CLAVE</span>
                <span className="font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-850 font-bold select-all block text-left w-fit">
                  {hotmartSecretMasked}
                </span>
              </div>
            </div>

            {/* LOGS TABLE LIST */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold text-[#56346F] uppercase tracking-wider text-left">Últimas 100 peticiones de Webhook recibidas:</h4>
              
              {hotmartLogs.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                  <p className="text-sm text-slate-500 font-sans">No se ha registrado ninguna petición de Webhook de Hotmart todavía.</p>
                  <p className="text-xs text-slate-400 mt-1 font-mono">Realiza una prueba de postback/webhook en la consola de Hotmart usando la URL de esta aplicación.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-mono text-[10px] uppercase tracking-wider text-slate-600">
                        <th className="p-3">Fecha y Hora</th>
                        <th className="p-3">Correo Compradora</th>
                        <th className="p-3 text-center font-bold">Autorizado</th>
                        <th className="p-3">Resultado</th>
                        <th className="p-3">Estado Compra</th>
                        <th className="p-3">Detalle / Mensaje</th>
                      </tr>
                    </thead>
                    <tbody className="font-sans divide-y divide-slate-100">
                      {hotmartLogs.map((log, idx) => {
                        const statusColor = 
                          log.status === "SUCCESS" ? "text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100" :
                          log.status === "UNAUTHORIZED" ? "text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-100" :
                          log.status === "NOT_APPROVED" ? "text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-100" :
                          "text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100";

                        return (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                            <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleString("es-ES")}
                            </td>
                            <td className="p-3 font-medium text-slate-900">{log.email}</td>
                            <td className="p-3 text-center">
                              {log.authorized ? (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-mono text-[9px] font-bold border border-emerald-200">
                                  ✔ SÍ
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-rose-50 text-rose-700 rounded-full font-mono text-[9px] font-bold border border-rose-200">
                                  ❌ NO
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <span className={`font-mono text-[10px] ${statusColor}`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-slate-600">
                              {log.payloadSummary?.purchase_status || "N/A"}
                            </td>
                            <td className="p-3 text-slate-600 leading-normal font-sans max-w-xs break-words">
                              {log.errorMessage || (
                                <span className="text-emerald-700 font-medium">Código de acceso enviado por email</span>
                              )}
                              {log.payloadSummary?.event_tickets_amount && (
                                <span className="block text-[10px] text-slate-400 font-mono mt-1">
                                  Tickets Amount: {log.payloadSummary.event_tickets_amount}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* USEFUL TROUBLESHOOTING GUIDE */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs font-sans space-y-3">
              <h5 className="font-bold text-slate-800 flex items-center gap-1.5 text-left">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Guía rápida de resolución de problemas de sintonización con Hotmart:
              </h5>
              <ul className="list-disc pl-5 space-y-2 text-slate-600 text-left">
                <li>
                  <strong>Si el resultado es <span className="text-rose-600 font-bold text-left">UNAUTHORIZED</span>:</strong> El token de autenticación configurado en la variable <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[#56346F]">HOTMART_WEBHOOK_SECRET</code> en AI Studio no coincide con el que Hotmart está enviando. Asegúrate de configurar en la aplicación de AI Studio exactamente el Token que te proporciona Hotmart en su consola Webhook (bajo la pestaña &quot;Tokens de Verificación&quot;).
                </li>
                <li>
                  <strong>Si el resultado es <span className="text-amber-600 font-bold text-left">NOT_APPROVED</span>:</strong> Hotmart envió el webhook de forma correcta pero el estado de la compra no era un estado de pago aprobado (por ejemplo, era un &quot;BILLING_INIT&quot;, &quot;CANCELLED&quot;, o &quot;REFUNDED&quot;). El sistema de sintonía hermética solo otorga accesos a transacciones aprobadas (<code className="font-mono">APPROVED</code> o <code className="font-mono">APROVADA</code>).
                </li>
                <li>
                  <strong>Si no aparece ninguna petición en la lista superior:</strong> Hotmart no está enviando las peticiones a la URL correcta. Asegúrate de que la URL de Webhook que configuraste en tu panel de herramientas de Hotmart coincida exactamente con la URL de tu aplicación (p. ej., <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-700">https://tu-app.run.app/api/hotmart/webhook</code>).
                </li>
              </ul>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
