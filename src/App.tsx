/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Activity, 
  BarChart3, 
  Settings, 
  Home, 
  Mic, 
  Watch, 
  Bell, 
  ChevronRight, 
  TrendingUp, 
  Moon, 
  Sun,
  AlertCircle,
  CheckCircle2,
  Info,
  Brain,
  PlayCircle,
  Calendar,
  Wind,
  User,
  Menu,
  X,
  MessageSquare
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { 
  MOCK_HOURLY_DATA, 
  MOCK_WEEKLY_SUMMARY, 
  STATUS_COLORS, 
  MOCK_AQI_DATA, 
  MOCK_SPIROMETRY_DATA, 
  EXERCISES_LIST 
} from './constants';
import { Screen, AIAnalysisResult, Exercise, NicotineLog } from './types';
import { analyzeSymptoms } from './services/geminiService';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
  const [isRecording, setIsRecording] = useState(true);
  const [watchConnected, setWatchConnected] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [exercises, setExercises] = useState<Exercise[]>(EXERCISES_LIST);
  const [nicotineLogs, setNicotineLogs] = useState<NicotineLog[]>([]);
  const [currentNicotineCount, setCurrentNicotineCount] = useState(0);
  const [userCondition, setUserCondition] = useState('Bilinmiyor / Sağlıklı');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [showToast, setShowToast] = useState<{ message: string, type: 'info' | 'error' | 'success' } | null>(null);

  const currentStatus = MOCK_WEEKLY_SUMMARY[MOCK_WEEKLY_SUMMARY.length - 1].status;
  const statusConfig = STATUS_COLORS[currentStatus];

  const completedCount = exercises.filter(ex => ex.status === 'completed').length;
  const progressPercentage = Math.round((completedCount / exercises.length) * 100);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeSymptoms(symptoms, 85, userCondition);
      setAnalysis(result);
      setRiskLevel(result.riskLevel);
      
      if (result.riskLevel === 'high') {
        setShowToast({ message: "Yüksek risk tespit edildi. Lütfen önerileri inceleyin.", type: 'error' });
      }
    } catch (error) {
      console.error(error);
      setAnalysis({ analysis: 'Bir hata oluştu. Lütfen tekrar deneyin.', riskLevel: 'medium', rehabRecommendation: 'Doktorunuza danışın' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleExercise = (id: number) => {
    if (riskLevel === 'high') {
      setShowToast({ message: "Şu anki risk seviyeniz nedeniyle egzersiz yapmanız önerilmez. Lütfen doktorunuza danışın.", type: 'error' });
      return;
    }
    const updated = exercises.map(ex => 
      ex.id === id ? { ...ex, status: ex.status === 'completed' ? 'pending' : 'completed' } : ex
    );
    setExercises(updated);

    if (updated.every(ex => ex.status === 'completed')) {
      if (currentPhase < 3) {
        setTimeout(() => {
          setShowToast({ message: `Tebrikler! Faz ${currentPhase} tamamlandı. Faz ${currentPhase + 1}'e geçiyorsunuz.`, type: 'success' });
          setCurrentPhase(prev => prev + 1);
          setExercises(EXERCISES_LIST.map(ex => ({ ...ex, status: 'pending' })));
        }, 500);
      }
    }
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <DashboardScreen status={currentStatus} exercises={exercises} toggleExercise={toggleExercise} setSelectedExercise={setSelectedExercise} progressPercentage={progressPercentage} completedCount={completedCount} userCondition={userCondition} setUserCondition={setUserCondition} />;
      case 'ai':
        return <AIScreen symptoms={symptoms} setSymptoms={setSymptoms} handleAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} analysis={analysis} riskLevel={riskLevel} userCondition={userCondition} setUserCondition={setUserCondition} />;
      case 'trends':
        return <TrendsScreen />;
      case 'rehab':
        return <RehabScreen exercises={exercises} toggleExercise={toggleExercise} setSelectedExercise={setSelectedExercise} riskLevel={riskLevel} currentPhase={currentPhase} progressPercentage={progressPercentage} completedCount={completedCount} />;
      case 'edu':
        return <EduScreen nicotineLogs={nicotineLogs} setNicotineLogs={setNicotineLogs} currentNicotineCount={currentNicotineCount} setCurrentNicotineCount={setCurrentNicotineCount} setShowToast={setShowToast} />;
      case 'status':
        return <StatusScreen isRecording={isRecording} watchConnected={watchConnected} />;
      default:
        return <DashboardScreen status={currentStatus} exercises={exercises} toggleExercise={toggleExercise} setSelectedExercise={setSelectedExercise} progressPercentage={progressPercentage} completedCount={completedCount} userCondition={userCondition} setUserCondition={setUserCondition} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row max-w-6xl mx-auto shadow-2xl overflow-hidden relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={cn(
              "fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-xl border flex items-center gap-3 min-w-[300px]",
              showToast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 
              showToast.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 
              'bg-blue-50 border-blue-200 text-blue-700'
            )}
          >
            {showToast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <p className="text-sm font-bold">{showToast.message}</p>
            <button onClick={() => setShowToast(null)} className="ml-auto hover:opacity-70">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise Detail Modal */}
      <AnimatePresence>
        {selectedExercise && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setSelectedExercise(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                  <PlayCircle size={32} />
                </div>
                <button 
                  onClick={() => setSelectedExercise(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <h3 className="text-2xl font-bold mb-2">{selectedExercise.title}</h3>
              <p className="text-blue-600 text-sm font-bold mb-6 flex items-center gap-2">
                <Calendar size={16} /> Süre: {selectedExercise.duration}
              </p>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Nasıl Uygulanır?</h4>
                <p className="text-gray-700 leading-relaxed">
                  {selectedExercise.description}
                </p>
              </div>
              <button 
                onClick={() => {
                  toggleExercise(selectedExercise.id);
                  setSelectedExercise(null);
                }}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                {selectedExercise.status === 'completed' ? 'Tekrarla' : 'Egzersizi Tamamla'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white border-r border-slate-200 p-6 z-40">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
          <h1 className="text-xl font-bold tracking-tight">PulmoTrack AI</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          <SidebarNavButton active={activeScreen === 'dashboard'} onClick={() => setActiveScreen('dashboard')} icon={<Home size={20}/>} label="Ana Sayfa" />
          <SidebarNavButton active={activeScreen === 'ai'} onClick={() => setActiveScreen('ai')} icon={<Brain size={20}/>} label="AI Analiz" />
          <SidebarNavButton active={activeScreen === 'trends'} onClick={() => setActiveScreen('trends')} icon={<BarChart3 size={20}/>} label="Trendler" />
          <SidebarNavButton active={activeScreen === 'rehab'} onClick={() => setActiveScreen('rehab')} icon={<PlayCircle size={20}/>} label="Rehabilitasyon" />
          <SidebarNavButton active={activeScreen === 'edu'} onClick={() => setActiveScreen('edu')} icon={<Calendar size={20}/>} label="Eğitim & Alışkanlık" />
          <SidebarNavButton active={activeScreen === 'status'} onClick={() => setActiveScreen('status')} icon={<Settings size={20}/>} label="Sistem Durumu" />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 overflow-hidden">
              <img src="https://picsum.photos/seed/user/100/100" alt="User" referrerPolicy="no-referrer" />
            </div>
            <div>
              <p className="text-sm font-semibold">Kullanıcı</p>
              <p className="text-xs text-slate-500">{userCondition}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden px-6 pt-8 pb-4 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-30">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">PulmoTrack</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", statusConfig.bg)} />
            <span className={cn("text-xs font-medium uppercase tracking-wider", statusConfig.text)}>
              {currentStatus === 'normal' ? 'Sistem Normal' : 'Dikkat: Artış'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors relative">
            <Bell size={20} />
            {currentStatus !== 'normal' && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            )}
          </button>
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
            <img src="https://picsum.photos/seed/user/100/100" alt="User" referrerPolicy="no-referrer" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-8 px-4 md:px-8 pt-4 md:pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white/80 backdrop-blur-lg border-t border-slate-100 px-6 py-3 flex items-center justify-between z-30">
        <MobileNavButton active={activeScreen === 'dashboard'} onClick={() => setActiveScreen('dashboard')} icon={<Home size={22} />} label="Panel" />
        <MobileNavButton active={activeScreen === 'ai'} onClick={() => setActiveScreen('ai')} icon={<Brain size={22} />} label="AI" />
        <MobileNavButton active={activeScreen === 'rehab'} onClick={() => setActiveScreen('rehab')} icon={<PlayCircle size={22} />} label="Rehab" />
        <MobileNavButton active={activeScreen === 'trends'} onClick={() => setActiveScreen('trends')} icon={<BarChart3 size={22} />} label="Trend" />
        <MobileNavButton active={activeScreen === 'edu'} onClick={() => setActiveScreen('edu')} icon={<Calendar size={22} />} label="Eğitim" />
      </nav>
    </div>
  );
}

// --- Navigation Components ---

function SidebarNavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200",
        active 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      )}
    >
      {icon}
      <span className="font-semibold text-sm">{label}</span>
      {active && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
    </button>
  );
}

function MobileNavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all duration-200",
        active ? "text-indigo-600 scale-110" : "text-slate-400 hover:text-slate-600"
      )}
    >
      {icon}
      <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
    </button>
  );
}

// --- Screens ---

function DashboardScreen({ status, exercises, toggleExercise, setSelectedExercise, progressPercentage, completedCount, userCondition, setUserCondition }: any) {
  const totalCoughsToday = useMemo(() => MOCK_HOURLY_DATA.reduce((acc, curr) => acc + curr.count, 0), []);
  const nightCoughs = useMemo(() => MOCK_HOURLY_DATA.filter(d => d.isNight).reduce((acc, curr) => acc + curr.count, 0), []);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Günlük Özet</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-slate-500 text-sm">28 Mart 2026, Cumartesi • </p>
            <select 
              value={userCondition}
              onChange={(e) => setUserCondition(e.target.value)}
              className="text-xs font-bold text-indigo-600 bg-transparent border-none outline-none cursor-pointer hover:underline"
            >
              <option value="Bilinmiyor / Sağlıklı">Bilinmiyor / Sağlıklı</option>
              <option value="KOAH">KOAH</option>
              <option value="Astım">Astım</option>
              <option value="Bronşit">Bronşit</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>
        </div>
      </header>

      {/* Status Card */}
      <section className={cn(
        "p-6 rounded-3xl border transition-all shadow-sm",
        STATUS_COLORS[status as keyof typeof STATUS_COLORS].light,
        STATUS_COLORS[status as keyof typeof STATUS_COLORS].border
      )}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Bugünkü Durum</h2>
            <p className={cn("text-2xl font-black mt-1", STATUS_COLORS[status as keyof typeof STATUS_COLORS].text)}>
              {status === 'normal' ? 'Her Şey Yolunda' : status === 'warning' ? 'Hafif Artış' : 'Dikkat: Yüksek Artış'}
            </p>
          </div>
          <div className={cn("p-3 rounded-2xl bg-white shadow-sm", STATUS_COLORS[status as keyof typeof STATUS_COLORS].text)}>
            {status === 'normal' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          </div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          {status === 'normal' 
            ? "Öksürük ve solunum verileriniz normal aralıkta seyrediyor. Takibe devam edin."
            : status === 'warning'
            ? "Bugün öksürük sayınızda %15'lik bir artış tespit edildi. Dinlenmeniz önerilir."
            : "Öksürük sıklığınızda belirgin bir artış var. Lütfen belirtilerinizi takip edin."}
        </p>
      </section>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<TrendingUp className="text-indigo-500" size={18} />} label="Öksürük" value={totalCoughsToday} unit="kez" color="indigo" />
        <StatCard icon={<Activity className="text-emerald-500" size={18} />} label="Solunum" value={18} unit="bpm" color="emerald" />
        <StatCard icon={<Activity className="text-rose-500" size={18} />} label="Ort. Nabız" value={74} unit="bpm" color="rose" />
        <StatCard icon={<Moon className="text-blue-500" size={18} />} label="Gece Öksürüğü" value={nightCoughs} unit="kez" color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AQI Status */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Wind className="text-blue-500" size={20} /> Hava Kalitesi (AQI)
              </h3>
              <p className="text-sm text-slate-500">Konum: Kocaeli, İzmit</p>
            </div>
            <div className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">
              Hassas Gruplar İçin Riskli (85)
            </div>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_AQI_DATA}>
                <defs>
                  <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="aqi" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorAqi)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spirometry */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Spirometri (FEV1)</h3>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_SPIROMETRY_DATA}>
                <Line type="monotone" dataKey="fev1" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold">2.9 L</p>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp size={12} /> %4 artış (geçen haftaya göre)
            </p>
          </div>
        </div>
      </div>

      {/* Tasks & Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Bugünkü Görevler</h3>
          <div className="space-y-3">
            {exercises.map((ex: Exercise) => (
              <div key={ex.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group">
                <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => toggleExercise(ex.id)}>
                  {ex.status === 'completed' ? (
                    <CheckCircle2 className="text-green-500" size={18} />
                  ) : (
                    <div className="w-[18px] h-[18px] border-2 border-slate-300 rounded-full group-hover:border-indigo-400" />
                  )}
                  <span className={cn("text-sm", ex.status === 'completed' ? 'line-through text-slate-400' : 'font-medium')}>{ex.title}</span>
                </div>
                <button onClick={() => setSelectedExercise(ex)} className="text-[10px] font-bold text-indigo-600 hover:underline px-2 py-1 bg-indigo-50 rounded-lg">NASIL?</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-lg shadow-indigo-200">
          <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-2">Haftalık Hedef</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold">%{progressPercentage}</span>
            <span className="text-indigo-200 text-sm mb-1">tamamlandı</span>
          </div>
          <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} className="h-full bg-white" />
          </div>
          <p className="mt-4 text-sm text-indigo-100">
            {(completedCount * 0.2).toFixed(1)} saat aktif rehabilitasyon tamamlandı. Akciğer kapasiteniz tahmini +{completedCount * 40}ml arttı.
          </p>
        </div>
      </div>
    </div>
  );
}

function AIScreen({ symptoms, setSymptoms, handleAnalyze, isAnalyzing, analysis, riskLevel, userCondition, setUserCondition }: any) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white">
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Brain size={24} /> Akıllı Semptom Analizörü
          </h3>
          <p className="text-indigo-100 text-sm leading-relaxed">
            Semptomlarınızı anlatın; hava kalitesi, tıbbi geçmişiniz ve klinik verilerinizle harmanlayarak bir ön değerlendirme yapalım.
          </p>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Tıbbi Geçmiş / Durum</label>
              <select 
                value={userCondition}
                onChange={(e) => setUserCondition(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              >
                <option value="Bilinmiyor / Sağlıklı">Bilinmiyor / Sağlıklı</option>
                <option value="KOAH">KOAH</option>
                <option value="Astım">Astım</option>
                <option value="Bronşit">Bronşit</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">İlaç Kullanımı (Varsa)</label>
              <input 
                type="text"
                placeholder="Örn: Ventolin, Symbicort..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Şu an nasıl hissediyorsunuz?</label>
            <textarea 
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Örn: İki gündür kuru öksürüğüm var, merdiven çıkarken nefesim daralıyor..."
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none"
            />
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || !symptoms.trim()}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Klinik Veriler Analiz Ediliyor...
              </>
            ) : (
              <>
                <Activity size={20} /> Analizi Başlat
              </>
            )}
          </button>

          {analysis && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-6 border rounded-2xl",
                riskLevel === 'high' ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className={cn(
                  "font-bold flex items-center gap-2",
                  riskLevel === 'high' ? 'text-red-700' : 'text-indigo-600'
                )}>
                  <MessageSquare size={18} /> AI Klinik Görüşü
                </h4>
                <div className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase",
                  riskLevel === 'high' ? 'bg-red-100 text-red-700' : 
                  riskLevel === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                )}>
                  Risk: {riskLevel === 'high' ? 'YÜKSEK' : riskLevel === 'medium' ? 'ORTA' : 'DÜŞÜK'}
                </div>
              </div>
              
              <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap mb-4">
                {analysis.analysis}
              </div>

              <div className="p-4 bg-white/50 rounded-xl border border-slate-200 mb-4">
                <p className="text-sm font-bold text-slate-800 mb-1">Rehabilitasyon Önerisi:</p>
                <p className="text-sm text-slate-600">{analysis.rehabRecommendation}</p>
              </div>

              {analysis.psychologicalNote && (
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 mb-4">
                  <p className="text-sm font-bold text-purple-800 mb-1">Psikolojik Not:</p>
                  <p className="text-sm text-purple-600 italic">{analysis.psychologicalNote}</p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-slate-200 flex items-center gap-3 text-xs text-slate-500 italic">
                <AlertCircle size={14} />
                Bu analiz bir teşhis değildir. Lütfen doktorunuza danışın.
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function TrendsScreen() {
  return (
    <div className="space-y-6">
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-800">Haftalık Öksürük Özeti</h3>
          <div className="flex gap-2">
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
              <div className="w-2 h-2 rounded-full bg-indigo-500" /> Gündüz
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
              <div className="w-2 h-2 rounded-full bg-blue-400" /> Gece
            </span>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_WEEKLY_SUMMARY}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="totalCoughs" radius={[4, 4, 0, 0]} barSize={20}>
                {MOCK_WEEKLY_SUMMARY.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.status === 'critical' ? '#f43f5e' : entry.status === 'warning' ? '#f59e0b' : '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-800">Solunum & Nabız Analizi</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Son 24 Saat</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_HOURLY_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} interval={4} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="respiratoryRate" stroke="#10b981" strokeWidth={3} dot={false} name="Solunum Hızı" />
              <Line type="monotone" dataKey="heartRate" stroke="#f43f5e" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Nabız" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-emerald-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">Solunum</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-rose-500 border-t border-dashed" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">Nabız</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function RehabScreen({ exercises, toggleExercise, setSelectedExercise, riskLevel, currentPhase, progressPercentage, completedCount }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Aktif Program: {riskLevel === 'high' ? 'Güvenlik Modu' : `Faz ${currentPhase}`}</h3>
          {riskLevel === 'high' && (
            <div className="flex items-center gap-2 text-red-600 text-xs font-bold animate-pulse">
              <AlertCircle size={14} /> EGZERSİZLER DURDURULDU
            </div>
          )}
        </div>
        <div className="space-y-4">
          {exercises.map((ex: Exercise) => (
            <div 
              key={ex.id} 
              onClick={() => toggleExercise(ex.id)}
              className={cn(
                "group flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 cursor-pointer",
                riskLevel === 'high' ? 'opacity-50 grayscale cursor-not-allowed' : 'bg-slate-50 hover:bg-indigo-50'
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-all",
                ex.status === 'completed' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
              )}>
                {ex.status === 'completed' ? <CheckCircle2 size={24} /> : <PlayCircle size={24} />}
              </div>
              <div className="flex-1">
                <h4 className={cn("font-bold text-sm", ex.status === 'completed' ? 'line-through text-slate-400' : '')}>
                  {ex.title}
                </h4>
                <p className="text-xs text-slate-500">{ex.duration} • {ex.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}</p>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedExercise(ex);
                }}
                className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"
              >
                <Info size={18} />
              </button>
              <ChevronRight size={18} className="text-slate-300" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#151619] text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2">Rehabilitasyon Durumu</h3>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Düzenli egzersiz akciğer kapasitenizi artırır ve alevlenme riskini azaltır.
          </p>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-400 uppercase tracking-widest">Haftalık Hedef</span>
                <span className="text-indigo-400 font-bold">{progressPercentage}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} className="h-full bg-indigo-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-xs text-slate-500 mb-1">Toplam Süre</p>
                <p className="text-xl font-bold">{(completedCount * 0.2).toFixed(1)} Saat</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-xs text-slate-500 mb-1">Kazanılan Kapasite</p>
                <p className="text-xl font-bold text-green-400">+{completedCount * 40}ml</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

function EduScreen({ nicotineLogs, setNicotineLogs, currentNicotineCount, setCurrentNicotineCount, setShowToast }: any) {
  const [isTracking, setIsTracking] = useState(false);

  const addLog = () => {
    const today = new Date().toLocaleDateString();
    setNicotineLogs((prev: any) => [...prev, { date: today, count: currentNicotineCount }]);
    setIsTracking(false);
    setShowToast({ message: "Davranış kaydı başarıyla eklendi.", type: 'success' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Brain className="text-purple-500" size={24} /> Psikolojik Boyut ve Bağımlılık
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-bold text-slate-700">Davranış Döngüsü</h4>
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold text-xs">1</div>
                <p className="text-sm font-semibold">Tetikleyici (Stres, Ortam)</p>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold text-xs">2</div>
                <p className="text-sm font-semibold">Eylem (Sigara/Nikotin)</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold text-xs">3</div>
                <p className="text-sm font-semibold">Rahatlama (Anlık Dopamin)</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-slate-700">Bilişsel Çarpıtmalar</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <span><strong>İnkar:</strong> "Günde sadece 1 tane içiyorum."</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <span><strong>Kontrol İllüzyonu:</strong> "İstesem hemen bırakırım."</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-3xl text-white shadow-lg">
        <h3 className="text-xl font-bold mb-4">Davranış Takibi</h3>
        {isTracking ? (
          <div className="bg-white/10 p-6 rounded-2xl border border-white/20">
            <p className="text-sm font-bold mb-4">Bugün kaç adet nikotin ürünü kullandınız?</p>
            <div className="flex items-center gap-6 mb-6">
              <button onClick={() => setCurrentNicotineCount(Math.max(0, currentNicotineCount - 1))} className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center text-2xl hover:bg-white/10">-</button>
              <span className="text-4xl font-bold">{currentNicotineCount}</span>
              <button onClick={() => setCurrentNicotineCount(currentNicotineCount + 1)} className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center text-2xl hover:bg-white/10">+</button>
            </div>
            <div className="flex gap-3">
              <button onClick={addLog} className="flex-1 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors">Kaydet</button>
              <button onClick={() => setIsTracking(false)} className="px-6 py-3 border border-white/30 font-bold rounded-xl hover:bg-white/10 transition-colors">İptal</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setIsTracking(true)} className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors">Günlük Tüketimi Kaydet</button>
        )}
      </div>
    </div>
  );
}

function StatusScreen({ isRecording, watchConnected }: { isRecording: boolean, watchConnected: boolean }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnalyzing(true);
      setTimeout(() => setIsAnalyzing(false), 3000);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <section className="bg-slate-900 p-6 rounded-3xl shadow-xl text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Activity size={120} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-indigo-300 uppercase tracking-widest text-xs">Arka Plan Analiz Akışı</h3>
            {isAnalyzing ? (
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> ANALİZ EDİLİYOR
              </span>
            ) : (
              <span className="text-[10px] font-bold text-slate-500 uppercase">BEKLEMEDE</span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 mb-8">
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                isAnalyzing ? "bg-indigo-500 shadow-lg shadow-indigo-500/50 scale-110" : "bg-slate-800"
              )}>
                <Mic size={20} />
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Ses Kaydı</span>
            </div>
            
            <div className="h-px bg-slate-800 flex-1 relative overflow-hidden">
              {isAnalyzing && (
                <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
              )}
            </div>

            <div className="flex flex-col items-center gap-2 flex-1">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                isAnalyzing ? "bg-indigo-500 shadow-lg shadow-indigo-500/50 scale-110" : "bg-slate-800"
              )}>
                <Activity size={20} />
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase">CNN Model</span>
            </div>

            <div className="h-px bg-slate-800 flex-1 relative overflow-hidden">
              {isAnalyzing && (
                <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.5 }} className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
              )}
            </div>

            <div className="flex flex-col items-center gap-2 flex-1">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                isAnalyzing ? "bg-indigo-500 shadow-lg shadow-indigo-500/50 scale-110" : "bg-slate-800"
              )}>
                <Bell size={20} />
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Bildirim</span>
            </div>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Model Çıktısı</span>
              <span className="text-[10px] font-bold text-indigo-400">Güven: %98.2</span>
            </div>
            <p className="text-xs text-slate-300 font-medium italic">
              {isAnalyzing ? "Spektrogram analiz ediliyor... Öksürük paterni tespit edildi." : "Sinyal bekleniyor... Son analiz 2 dk önce yapıldı."}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-6">Sensör Durumu</h3>
        <div className="space-y-4">
          <StatusRow icon={<Mic className={isRecording ? "text-indigo-500" : "text-slate-300"} size={20} />} label="Mikrofon (Arka Plan)" status={isRecording ? "Aktif" : "Kapalı"} active={isRecording} />
          <StatusRow icon={<Watch className={watchConnected ? "text-indigo-500" : "text-slate-300"} size={20} />} label="Akıllı Saat Bağlantısı" status={watchConnected ? "Bağlı" : "Bağlantı Yok"} active={watchConnected} />
        </div>
      </section>
    </div>
  );
}

// --- Sub-components ---

function StatCard({ icon, label, value, unit, color }: { icon: React.ReactNode, label: string, value: number, unit: string, color: string }) {
  return (
    <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-xl bg-slate-50">
          {icon}
        </div>
        <ChevronRight size={14} className="text-slate-300" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-xl font-black text-slate-800">{value}</span>
          <span className="text-[10px] font-bold text-slate-400">{unit}</span>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ icon, label, status, active }: { icon: React.ReactNode, label: string, status: string, active: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-bold text-slate-700">{label}</span>
      </div>
      <span className={cn(
        "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
        active ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"
      )}>
        {status}
      </span>
    </div>
  );
}
