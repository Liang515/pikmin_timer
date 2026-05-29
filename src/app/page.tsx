"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, ExternalLink, Trash2, RotateCcw, Clock, BellRing, Sparkles, Users, Edit3, Check, X, MapPin, Globe, Moon, Sun, ChevronUp, ChevronDown } from 'lucide-react';
import { Mushroom, AreaGroup } from '@/types/mushroom';

type Lang = 'zh' | 'en';
const T = {
  zh: {
    home: '首頁',
    battleEnded: '⚔️ 戰鬥結束！',
    battleEndedBody: (name: string) => `${name} 的戰鬥已完成，5分鐘後重生。`,
    respawned: '🍄 蘑菇已重生！',
    respawnedBody: (name: string) => `${name} 已經重生完畢！`,
    defaultMushroom: '蘑菇',
    enterArea: '請輸入區域名稱:',
    newArea: '新區域',
    keepOneArea: '至少需保留一個區域',
    confirmDeleteArea: '確定要刪除此區域嗎？其中的紀錄也會一起刪除。',
    renameArea: '重新命名區域:',
    title: '🍄 蘑菇戰報',
    deleteTab: '刪除目前分頁',
    noRecords: (name: string) => `「${name}」目前沒有紀錄`,
    clickToAdd: '點擊右下角 + 開始新增',
    addTo: '新增至 ',
    mushroomName: '蘑菇名稱 (選填)',
    mushroomNamePlaceholder: '例如：火屬性巨大蘑菇',
    participants: '參戰人數',
    remainingTime: '剩餘戰鬥時間',
    m15: '15分',
    m30: '30分',
    h1: '1小時',
    h3: '3小時',
    h8: '8小時',
    startTracking: '建立追蹤',
    resetTime: '重新設定剩餘時間 (選填)',
    saveChanges: '儲存修改',
    cancel: '取消',
    players: '人',
    respawning: '重生中',
    battleEnds: '戰鬥結束：',
    estRespawn: '預計重生：',
    respawnComplete: '重生完成',
    languageToggle: 'EN',
    allAreas: '所有區域快速選擇',
    collapse: '收起',
    expand: '展開所有區域',
    recordsCount: (count: number) => `${count} 個紀錄`,
    confirmDelete: '確定刪除？',
    deleteBtn: '刪除'
  },
  en: {
    home: 'Home',
    battleEnded: '⚔️ Battle Ended!',
    battleEndedBody: (name: string) => `${name} battle completed. Respawning in 5 mins.`,
    respawned: '🍄 Mushroom Respawned!',
    respawnedBody: (name: string) => `${name} has respawned!`,
    defaultMushroom: 'Mushroom',
    enterArea: 'Enter area name:',
    newArea: 'New Area',
    keepOneArea: 'At least one area must be kept.',
    confirmDeleteArea: 'Delete this area and all its records?',
    renameArea: 'Rename area:',
    title: '🍄 Mushroom Timer',
    deleteTab: 'Delete current tab',
    noRecords: (name: string) => `No records in '${name}'`,
    clickToAdd: 'Click + to add a mushroom',
    addTo: 'Add to ',
    mushroomName: 'Mushroom Name (Optional)',
    mushroomNamePlaceholder: 'e.g., Large Fire Mushroom',
    participants: 'Participants',
    remainingTime: 'Remaining Battle Time',
    m15: '15m',
    m30: '30m',
    h1: '1h',
    h3: '3h',
    h8: '8h',
    startTracking: 'Start Tracking',
    resetTime: 'Reset Time (Optional)',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    players: 'players',
    respawning: 'Respawning',
    battleEnds: 'Battle Ends: ',
    estRespawn: 'Est. Respawn: ',
    respawnComplete: 'Respawn Complete',
    languageToggle: '中',
    allAreas: 'All Areas Quick Select',
    collapse: 'Collapse',
    expand: 'Expand All Areas',
    recordsCount: (count: number) => `${count} ${count === 1 ? 'record' : 'records'}`,
    confirmDelete: 'Delete?',
    deleteBtn: 'Delete'
  }
};

/* ─── Keyboard Time Picker Component ─── */
function KeyboardTimePicker({ h, m, s, onChangeH, onChangeM, onChangeS, onEnter }: {
  h: number; m: number; s: number;
  onChangeH: (v: number) => void;
  onChangeM: (v: number) => void;
  onChangeS: (v: number) => void;
  onEnter?: () => void;
}) {
  const hRef = useRef<HTMLInputElement>(null);
  const mRef = useRef<HTMLInputElement>(null);
  const sRef = useRef<HTMLInputElement>(null);

  // Auto focus first input (Hours) on mount with a safe delay
  useEffect(() => {
    const timer = setTimeout(() => {
      hRef.current?.focus();
      hRef.current?.select();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (
    val: string,
    max: number,
    onChange: (v: number) => void,
    nextRef?: React.RefObject<HTMLInputElement | null>
  ) => {
    const digits = val.replace(/\D/g, '').slice(0, 2);
    if (digits === '') {
      onChange(0);
      return;
    }
    const num = Math.min(max, parseInt(digits));
    onChange(num);

    // Smart Auto-jump to next field
    const isAutoJump = digits.length >= 2 || 
      (digits.length === 1 && (
        (max === 23 && parseInt(digits) >= 3) || 
        (max === 59 && parseInt(digits) >= 6)
      ));

    if (isAutoJump && nextRef && nextRef.current) {
      nextRef.current.focus();
      nextRef.current.select();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    prevRef?: React.RefObject<HTMLInputElement | null>
  ) => {
    if (e.key === 'Backspace' && e.currentTarget.value === '' && prevRef && prevRef.current) {
      prevRef.current.focus();
      prevRef.current.select();
      e.preventDefault();
    }
    if (e.key === 'Enter' && onEnter) {
      onEnter();
    }
  };

  const formatVal = (v: number) => (v === 0 ? '' : v.toString());

  return (
    <div className="flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/80 px-4 w-full">
      <div className="flex flex-col items-center gap-1 flex-1">
        <input
          ref={hRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={formatVal(h)}
          onChange={e => handleInputChange(e.target.value, 23, onChangeH, mRef)}
          onKeyDown={e => handleKeyDown(e)}
          placeholder="00"
          className="w-full text-center text-2xl font-mono font-bold bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl py-2 outline-none text-slate-800 dark:text-slate-100 transition-colors shadow-sm focus:shadow-md"
        />
        <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">時 (H)</span>
      </div>
      
      <span className="text-2xl font-black text-slate-300 dark:text-slate-700 mb-5">:</span>

      <div className="flex flex-col items-center gap-1 flex-1">
        <input
          ref={mRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={formatVal(m)}
          onChange={e => handleInputChange(e.target.value, 59, onChangeM, sRef)}
          onKeyDown={e => handleKeyDown(e, hRef)}
          placeholder="00"
          className="w-full text-center text-2xl font-mono font-bold bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl py-2 outline-none text-slate-800 dark:text-slate-100 transition-colors shadow-sm focus:shadow-md"
        />
        <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">分 (M)</span>
      </div>

      <span className="text-2xl font-black text-slate-300 dark:text-slate-700 mb-5">:</span>

      <div className="flex flex-col items-center gap-1 flex-1">
        <input
          ref={sRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={formatVal(s)}
          onChange={e => handleInputChange(e.target.value, 59, onChangeS)}
          onKeyDown={e => handleKeyDown(e, mRef)}
          placeholder="00"
          className="w-full text-center text-2xl font-mono font-bold bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl py-2 outline-none text-slate-800 dark:text-slate-100 transition-colors shadow-sm focus:shadow-md"
        />
        <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">秒 (S)</span>
      </div>
    </div>
  );
}

/* ─── Participant Slider ─── */
function ParticipantSlider({ value, onChange }: {
  value: number;
  onChange: (v: number) => void;
}) {
  const clamp = (v: number) => Math.max(1, Math.min(30, v));
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= 1}
        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Minus size={18} />
      </button>
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex items-center justify-center">
          <Users size={16} className="text-blue-500 dark:text-blue-400 mr-1.5" />
          <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 tabular-nums min-w-[2ch] text-center">{value}</span>
        </div>
        <input
          type="range"
          min={1}
          max={30}
          value={value}
          onChange={e => onChange(parseInt(e.target.value))}
          className="participant-slider w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700 accent-blue-600"
        />
        <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 px-0.5">
          <span>1</span>
          <span>10</span>
          <span>20</span>
          <span>30</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= 30}
        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Plus size={18} />
      </button>
    </div>
  );
}

const COLORS = [
  'from-blue-400 to-indigo-500 shadow-blue-500/30',
  'from-purple-400 to-fuchsia-500 shadow-purple-500/30',
  'from-rose-400 to-red-500 shadow-red-500/30',
  'from-emerald-400 to-teal-500 shadow-emerald-500/30',
  'from-amber-300 to-orange-500 shadow-orange-500/30',
];

export default function PikminDashboard() {
  const [mushrooms, setMushrooms] = useState<Mushroom[]>([]);
  const [groups, setGroups] = useState<AreaGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string>("");
  const [now, setNow] = useState(Date.now());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addH, setAddH] = useState(0);
  const [addM, setAddM] = useState(0);
  const [addS, setAddS] = useState(0);
  const [addP, setAddP] = useState(5);
  const [lang, setLang] = useState<Lang>('zh');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Compact inline area editing states
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [deleteConfirmGroupId, setDeleteConfirmGroupId] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState("");
  const [isGroupsExpanded, setIsGroupsExpanded] = useState(false);

  const notifiedSet = useRef<Set<string>>(new Set());

  const t = T[lang];

  useEffect(() => {
    const savedMs = localStorage.getItem('pikmin_mushrooms');
    const savedGroups = localStorage.getItem('pikmin_groups');
    const savedLang = localStorage.getItem('pikmin_lang') as Lang;
    const savedTheme = localStorage.getItem('pikmin_theme') as 'light' | 'dark' | null;

    if (savedLang && (savedLang === 'zh' || savedLang === 'en')) {
      setLang(savedLang);
    }

    let initialTheme: 'light' | 'dark' = 'light';
    if (savedTheme === 'light' || savedTheme === 'dark') {
      initialTheme = savedTheme;
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      initialTheme = 'dark';
    }
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    let initialGroups: AreaGroup[] = [];
    if (savedGroups) {
      initialGroups = JSON.parse(savedGroups);
      initialGroups.sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
    } else {
      initialGroups = [{ id: 'default', name: savedLang === 'en' ? 'Home' : '首頁', lastAccessed: Date.now() }];
    }
    setGroups(initialGroups);
    setActiveGroupId(initialGroups[0].id);

    if (savedMs) setMushrooms(JSON.parse(savedMs));
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('pikmin_mushrooms', JSON.stringify(mushrooms));
    localStorage.setItem('pikmin_groups', JSON.stringify(groups));
    localStorage.setItem('pikmin_lang', lang);
    
    mushrooms.forEach(m => {
      const bEnd = m.battleEndTime || (m.endTime - 5 * 60000);
      if (now >= bEnd && !notifiedSet.current.has(m.id + '_battle')) {
        notifiedSet.current.add(m.id + '_battle');
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(T[lang].battleEnded, { body: T[lang].battleEndedBody(m.name) });
        }
      }
      if (now >= m.endTime && !notifiedSet.current.has(m.id + '_respawn')) {
        notifiedSet.current.add(m.id + '_respawn');
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(T[lang].respawned, { body: T[lang].respawnedBody(m.name) });
        }
      }
    });
  }, [mushrooms, groups, now, lang]);

  const addMushroom = (h: number, m: number, s: number, name: string, participants: number) => {
    const battleMs = (h * 3600 + m * 60 + s) * 1000;
    const battleEndTime = Date.now() + battleMs;
    const endTime = battleEndTime + 5 * 60 * 1000;
    const newMs: Mushroom = {
      id: crypto.randomUUID(),
      name: name || t.defaultMushroom,
      groupId: activeGroupId,
      participants: participants || 5,
      startTime: Date.now(),
      battleEndTime,
      endTime,
      note: "",
      isFavorite: false,
      color: COLORS[mushrooms.length % COLORS.length]
    };
    setMushrooms([...mushrooms, newMs]);
  };

  const updateMushroom = (id: string, updates: Partial<Mushroom>) => {
    setMushrooms(mushrooms.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMushroom = (id: string) => {
    setMushrooms(mushrooms.filter(m => m.id !== id));
    notifiedSet.current.delete(id + '_battle');
    notifiedSet.current.delete(id + '_respawn');
    if (editingId === id) setEditingId(null);
  };

  const handleSetActiveGroup = (id: string) => {
    setActiveGroupId(id);
    setGroups(prevGroups => {
      const newGroups = prevGroups.map(g => g.id === id ? { ...g, lastAccessed: Date.now() } : g);
      return newGroups.sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
    });
  };

  // Warning auto-dismiss effect
  useEffect(() => {
    if (warningMessage) {
      const timer = setTimeout(() => setWarningMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [warningMessage]);

  const startAddGroup = () => {
    setIsAddingGroup(true);
    setNewGroupName("");
    setDeleteConfirmGroupId(null);
  };

  const commitAddGroup = () => {
    const trimmed = newGroupName.trim();
    if (!trimmed) {
      setIsAddingGroup(false);
      return;
    }
    const newGroup = { id: crypto.randomUUID(), name: trimmed, lastAccessed: Date.now() };
    setGroups(prev => [newGroup, ...prev]);
    setActiveGroupId(newGroup.id);
    setIsAddingGroup(false);
    setNewGroupName("");
  };

  const cancelAddGroup = () => {
    setIsAddingGroup(false);
    setNewGroupName("");
  };

  const startRenameGroup = (id: string, currentName: string) => {
    setEditingGroupId(id);
    setEditGroupName(currentName);
    setDeleteConfirmGroupId(null);
  };

  const commitRenameGroup = (id: string) => {
    const trimmed = editGroupName.trim();
    if (trimmed) {
      setGroups(groups.map(g => g.id === id ? { ...g, name: trimmed } : g));
    }
    setEditingGroupId(null);
  };

  const handleDeleteGroupClick = (id: string) => {
    if (groups.length <= 1) {
      setWarningMessage(t.keepOneArea);
      return;
    }
    setDeleteConfirmGroupId(id);
    setIsAddingGroup(false);
  };

  const confirmDeleteGroup = (id: string) => {
    const remaining = groups.filter(g => g.id !== id);
    setGroups(remaining);
    setMushrooms(mushrooms.filter(m => m.groupId !== id));
    setDeleteConfirmGroupId(null);
    if (activeGroupId === id && remaining.length > 0) {
      handleSetActiveGroup(remaining[0].id);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('pikmin_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleAddSubmit = () => {
    const n = (document.getElementById('quick-name') as HTMLInputElement)?.value || "";
    addMushroom(addH, addM, addS, n, addP);
    setIsAdding(false);
    setAddH(0); setAddM(0); setAddS(0); setAddP(5);
  };

  const activeMushrooms = mushrooms.filter(m => m.groupId === activeGroupId);
  const sortedMushrooms = [...activeMushrooms].sort((a, b) => {
    const aOver = now > a.endTime;
    const bOver = now > b.endTime;
    if (aOver && !bOver) return 1;
    if (!aOver && bOver) return -1;
    return a.endTime - b.endTime;
  });

  return (
    <main className={`min-h-screen bg-slate-100 dark:bg-slate-950 p-3 sm:p-4 pb-24 md:p-8 font-sans transition-colors duration-300 ${theme}`}>
      <header className="flex justify-between items-center mb-4 sm:mb-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-1.5 sm:gap-2">
            {t.title}
          </h1>
        </div>
        <div className="flex gap-1.5 sm:gap-2">
          <button onClick={toggleTheme} className="p-2 sm:p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-slate-600 dark:text-slate-300 active:scale-95 transition-transform hover:shadow-md">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="px-2.5 sm:px-3 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-slate-600 dark:text-slate-300 active:scale-95 transition-transform hover:shadow-md font-bold flex items-center gap-1 sm:gap-1.5 text-sm sm:text-base">
             <Globe size={18} /> <span className="hidden sm:inline">{t.languageToggle}</span>
          </button>
          <button onClick={() => window.location.href='pikminbloom://'} className="p-2 sm:p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-green-600 dark:text-green-400 active:scale-95 transition-transform hover:shadow-md">
             <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </header>

      {/* Warning Alert Bar */}
      {warningMessage && (
        <div className="max-w-2xl mx-auto mb-4 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold px-4 py-2.5 rounded-2xl border border-rose-500/20 flex items-center justify-between animate-in slide-in-from-top-2 duration-200 shadow-sm">
          <span className="flex items-center gap-1.5">⚠️ {warningMessage}</span>
          <button onClick={() => setWarningMessage("")} className="text-rose-400 hover:text-rose-600 p-0.5 active:scale-90 transition-transform">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tabs / Groups Selection */}
      <div className="max-w-2xl mx-auto mb-6 flex items-center gap-2 w-full overflow-hidden">
        <div className="flex-1 flex flex-row gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 -my-1">
          {groups.map(g => {
            const isEditingThis = editingGroupId === g.id;
            const isActive = activeGroupId === g.id;

            if (isEditingThis) {
              return (
                <div 
                  key={g.id} 
                  className="flex items-center bg-blue-600 text-white px-4 rounded-2xl shadow-md h-[42px] animate-in zoom-in-95 duration-150 shrink-0"
                >
                  <input
                    type="text"
                    value={editGroupName}
                    onChange={e => setEditGroupName(e.target.value)}
                    onBlur={() => commitRenameGroup(g.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitRenameGroup(g.id);
                      if (e.key === 'Escape') setEditingGroupId(null);
                    }}
                    className="w-24 sm:w-32 bg-transparent text-white font-bold outline-none text-base border-none p-0 focus:ring-0"
                    autoFocus
                  />
                  <button 
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => commitRenameGroup(g.id)} 
                    className="text-white hover:text-blue-200 ml-2.5 p-1 bg-white/10 rounded-lg active:scale-90 transition-transform flex items-center justify-center shrink-0"
                    title="確定"
                  >
                    <Check size={14} />
                  </button>
                </div>
              );
            }

            return (
              <button
                key={g.id}
                onClick={() => handleSetActiveGroup(g.id)}
                onDoubleClick={() => startRenameGroup(g.id, g.name)}
                className={`px-4 py-2 rounded-2xl whitespace-nowrap font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-sm h-[42px] relative group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-blue-500/20' 
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <MapPin size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{g.name}</span>
                
                {/* Micro-edit icon inside the active tab */}
                {isActive && (
                  <span 
                    onClick={(e) => {
                      e.stopPropagation(); // Avoid switching tabs
                      startRenameGroup(g.id, g.name);
                    }}
                    className="p-0.5 bg-white/20 hover:bg-white/30 rounded-md transition-colors cursor-pointer"
                    title={t.renameArea}
                  >
                    <Edit3 size={11} />
                  </span>
                )}

                {isActive && activeMushrooms.length > 0 && (
                  <span className="bg-white/30 text-[10px] px-1.5 py-0.5 rounded-md ml-0.5 font-extrabold">{activeMushrooms.length}</span>
                )}
              </button>
            );
          })}

          {/* Inline Add Button or Input */}
          {isAddingGroup ? (
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl border-2 border-blue-500 shadow-sm animate-in zoom-in-95 duration-150 h-[42px]">
              <input
                type="text"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitAddGroup();
                  if (e.key === 'Escape') cancelAddGroup();
                }}
                placeholder={t.newArea}
                className="w-24 sm:w-32 bg-transparent text-slate-800 dark:text-slate-100 font-bold outline-none text-sm placeholder:text-slate-400"
                autoFocus
              />
              <button onClick={commitAddGroup} className="text-emerald-500 hover:text-emerald-600 p-0.5 active:scale-90 transition-transform">
                <Check size={16} />
              </button>
              <button onClick={cancelAddGroup} className="text-rose-500 hover:text-rose-600 p-0.5 active:scale-90 transition-transform">
                <X size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={startAddGroup}
              className="p-2.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all flex items-center justify-center min-w-[42px] h-[42px] active:scale-95 shadow-sm"
              title={t.newArea}
            >
              <Plus size={20} />
            </button>
          )}
        </div>

        {/* Inline Confirmation Trash Button */}
        {deleteConfirmGroupId === activeGroupId ? (
          <div className="flex items-center gap-2 bg-rose-500 text-white rounded-2xl shadow-md px-3 py-1 animate-in slide-in-from-right-2 duration-150 h-[42px] shrink-0">
            <span className="text-xs font-bold whitespace-nowrap">{t.confirmDelete}</span>
            <button 
              onClick={() => confirmDeleteGroup(activeGroupId)} 
              className="px-2.5 py-1 bg-white text-rose-600 rounded-xl text-xs font-black hover:bg-slate-100 active:scale-90 transition-transform flex items-center justify-center h-7"
            >
              {t.deleteBtn}
            </button>
            <button 
              onClick={() => setDeleteConfirmGroupId(null)} 
              className="px-2.5 py-1 bg-white/20 text-white rounded-xl text-xs font-black hover:bg-white/30 active:scale-90 transition-transform flex items-center justify-center h-7"
            >
              {t.cancel}
            </button>
          </div>
        ) : (
          <button 
             onClick={() => handleDeleteGroupClick(activeGroupId)}
             className={`p-2.5 rounded-2xl shadow-sm transition-all active:scale-95 h-[42px] w-[42px] flex items-center justify-center shrink-0 ${
               groups.length <= 1 
                 ? 'bg-slate-100 text-slate-300 dark:bg-slate-800/50 dark:text-slate-600 cursor-not-allowed' 
                 : 'bg-white dark:bg-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50'
             }`}
             title={t.deleteTab}
             disabled={groups.length <= 1}
          >
            <Trash2 size={20} />
          </button>
        )}

        {/* Toggle Expand Button */}
        <button
          onClick={() => setIsGroupsExpanded(!isGroupsExpanded)}
          className={`p-2.5 rounded-2xl shadow-sm transition-all active:scale-95 h-[42px] w-[42px] flex items-center justify-center shrink-0 ${
            isGroupsExpanded
              ? 'bg-blue-600 text-white shadow-blue-500/20 shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
          title={t.expand}
        >
          <ChevronDown size={20} className={`transform transition-transform duration-300 ${isGroupsExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expanded Grid View */}
      {isGroupsExpanded && (
        <div className="max-w-2xl mx-auto mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 pb-6 sm:pb-8 rounded-3xl shadow-xl animate-in slide-in-from-top-2 duration-200 w-full">
          <div className="flex justify-between items-center mb-3 px-1">
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <MapPin size={12} className="text-blue-500 dark:text-blue-400" />
              {t.allAreas}
            </span>
            <button 
              onClick={() => setIsGroupsExpanded(false)} 
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-bold px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t.collapse}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {groups.map(g => {
              const isActive = activeGroupId === g.id;
              const groupMushrooms = mushrooms.filter(m => m.groupId === g.id);
              return (
                <button
                  key={g.id}
                  onClick={() => {
                    handleSetActiveGroup(g.id);
                    setIsGroupsExpanded(false);
                  }}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-95 duration-150 h-20 ${
                    isActive
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700/80 shadow-sm text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="font-bold text-sm truncate w-full">{g.name}</span>
                  <span className={`text-[10px] self-end px-2 py-0.5 rounded-lg font-black ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400'
                  }`}>
                    {t.recordsCount(groupMushrooms.length)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-4 max-w-2xl mx-auto">
        {activeMushrooms.length === 0 && (
          <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500">
            <Sparkles className="mx-auto mb-3 opacity-50" size={32} />
            <p className="font-bold text-slate-500 dark:text-slate-400">{t.noRecords(groups.find(g => g.id === activeGroupId)?.name || '')}</p>
            <p className="text-sm mt-1">{t.clickToAdd}</p>
          </div>
        )}
        {sortedMushrooms.map(m => (
          <MushroomItem 
            key={m.id} 
            m={m} 
            now={now} 
            lang={lang}
            isEditing={editingId === m.id}
            setEditingId={setEditingId}
            onDelete={deleteMushroom} 
            onUpdate={updateMushroom}
            onResetNote={() => {
              notifiedSet.current.delete(m.id + '_battle');
              notifiedSet.current.delete(m.id + '_respawn');
            }}
          />
        ))}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsAdding(true)}
        className={`fixed bottom-6 right-6 sm:bottom-10 sm:right-10 w-16 h-16 bg-blue-600 text-white rounded-full shadow-[0_10px_25px_rgba(37,99,235,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 group ${editingId ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}
      >
        <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Modern Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsAdding(false)}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] p-5 sm:p-6 shadow-2xl relative z-10 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                 <Sparkles className="text-amber-500" size={24} />
                 {t.addTo} {groups.find(g => g.id === activeGroupId)?.name}
              </h2>
              <button onClick={() => setIsAdding(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="grid gap-5">
              <div>
                 <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">{t.mushroomName}</label>
                 <input id="quick-name" placeholder={t.mushroomNamePlaceholder} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-4 rounded-2xl outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-all text-lg font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100" />
              </div>
              
              <div>
                 <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">{t.participants}</label>
                 <ParticipantSlider value={addP} onChange={setAddP} />
              </div>

              <div>
                 <div className="flex justify-between items-center mb-2">
                   <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1"><Clock size={16}/> {t.remainingTime}</label>
                 </div>
                 <div className="flex flex-wrap gap-2 mb-3">
                   {[
                     { label: t.m15, h: 0, m: 15, s: 0 },
                     { label: t.m30, h: 0, m: 30, s: 0 },
                     { label: t.h1, h: 1, m: 0, s: 0 },
                     { label: t.h3, h: 3, m: 0, s: 0 },
                     { label: t.h8, h: 8, m: 0, s: 0 },
                   ].map(p => (
                     <button 
                       key={p.label}
                       onClick={() => {
                          setAddH(p.h);
                          setAddM(p.m);
                          setAddS(p.s);
                       }}
                       className={`px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap active:scale-95 transition-all ${
                         addH === p.h && addM === p.m && addS === p.s
                           ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                           : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                       }`}
                     >
                       {p.label}
                     </button>
                   ))}
                 </div>
                 <KeyboardTimePicker
                    h={addH} m={addM} s={addS}
                    onChangeH={setAddH} onChangeM={setAddM} onChangeS={setAddS}
                    onEnter={handleAddSubmit}
                  />
               </div>

               <button 
                 id="start-tracking-btn"
                 onClick={handleAddSubmit}
                 className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white py-4 rounded-2xl font-bold text-lg shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-2 mt-2 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
               >
                 <Plus size={24} /> {t.startTracking}
               </button>

            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function MushroomItem({ m, now, lang, isEditing, setEditingId, onDelete, onUpdate, onResetNote }: { 
  m: Mushroom, 
  now: number, 
  lang: Lang,
  isEditing: boolean,
  setEditingId: (id: string | null) => void,
  onDelete: (id: string) => void, 
  onUpdate: (id: string, u: Partial<Mushroom>) => void,
  onResetNote: () => void
}) {
  const [editP, setEditP] = useState(m.participants);
  const [editName, setEditName] = useState(m.name);
  const [editH, setEditH] = useState(0);
  const [editM, setEditM] = useState(0);
  const [editS, setEditS] = useState(0);
  const [editTimeChanged, setEditTimeChanged] = useState(false);
  
  const t = T[lang];

  useEffect(() => {
    if (isEditing) {
      setEditP(m.participants);
      setEditName(m.name);
      // Pre-fill with current remaining time
      const remaining = Math.max(0, m.battleEndTime - Date.now());
      const totalSec = Math.floor(remaining / 1000);
      setEditH(Math.floor(totalSec / 3600));
      setEditM(Math.floor((totalSec % 3600) / 60));
      setEditS(totalSec % 60);
      setEditTimeChanged(false);
    }
  }, [isEditing, m.participants, m.name, m.battleEndTime]);

  const diff = m.endTime - now;
  const isOver = diff <= 0;
  const battleEnd = m.battleEndTime || (m.endTime - 5 * 60000);
  const isWaitingRespawn = !isOver && now >= battleEnd;

  const formatTime = (ms: number) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    return {
      h: Math.floor(totalSec / 3600).toString().padStart(2, '0'),
      m: Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0'),
      s: (totalSec % 60).toString().padStart(2, '0')
    };
  };

  const timeFmt = formatTime(diff);

  const handleEditSubmit = () => {
    const updates: Partial<Mushroom> = { 
      name: editName.trim() || t.defaultMushroom,
      participants: editP 
    };
    if (editTimeChanged) {
       const battleMs = (editH*3600 + editM*60 + editS)*1000;
       updates.battleEndTime = Date.now() + battleMs;
       updates.endTime = updates.battleEndTime + 5 * 60 * 1000;
       onResetNote();
    }
    onUpdate(m.id, updates);
    setEditingId(null);
  };

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl shadow-sm border-2 border-blue-500 transition-all text-slate-800 dark:text-slate-100">
        <div className="mb-3">
          <input 
            value={editName}
            onChange={e => setEditName(e.target.value)}
            className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg w-full font-bold text-slate-700 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base placeholder:text-slate-400 dark:placeholder:text-slate-500 mb-3"
            placeholder={t.defaultMushroom}
          />
          <ParticipantSlider value={editP} onChange={setEditP} />
        </div>

        <div className="flex flex-col gap-2 mb-4 bg-slate-50 dark:bg-slate-800/50 p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold mb-1 flex items-center gap-1"><Clock size={14} /> {t.resetTime}</div>
          <KeyboardTimePicker
            h={editH} m={editM} s={editS}
            onChangeH={v => { setEditH(v); setEditTimeChanged(true); }}
            onChangeM={v => { setEditM(v); setEditTimeChanged(true); }}
            onChangeS={v => { setEditS(v); setEditTimeChanged(true); }}
            onEnter={handleEditSubmit}
          />
        </div>

        <div className="flex gap-2">
          <button 
            id={`save-edit-btn-${m.id}`}
            onClick={handleEditSubmit}
            className="bg-blue-600 text-white px-4 py-3 rounded-xl flex-1 font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 active:scale-95 transition-transform hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
          >
            <Check size={18} /> {t.saveChanges}
          </button>
          <button onClick={() => setEditingId(null)} className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 px-4 py-3 rounded-xl font-bold active:scale-95 transition-transform focus:outline-none focus:ring-4 focus:ring-slate-500/20">
            {t.cancel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-5 rounded-3xl transition-all duration-300 relative overflow-hidden flex flex-col sm:flex-row justify-between items-center gap-4 ${isOver ? 'bg-slate-200 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 opacity-80' : `bg-gradient-to-br text-white shadow-xl -translate-y-1 ${m.color}`}`}>
      <div className="flex flex-col items-start w-full sm:w-auto">
        <h3 className={`text-xl font-bold flex flex-wrap items-center gap-2 ${isOver ? 'text-slate-800 dark:text-slate-200' : 'text-white'}`}>
          {m.name}
          <span className={`flex items-center gap-1 text-sm px-2 py-0.5 rounded-full font-normal shadow-sm ${isOver ? 'bg-slate-300/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400' : 'bg-white/20 text-white'}`}>
            <Users size={14} /> {m.participants} {t.players}
          </span>
          {isWaitingRespawn && (
             <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse shadow-sm">
               {t.respawning}
             </span>
          )}
        </h3>
        <div className="mt-1">
          <p className={`text-xs flex items-center gap-1.5 ${isOver ? 'text-slate-600 dark:text-slate-400' : 'text-white/80'}`}>
            <Clock size={12} />
            {t.battleEnds}{new Date(battleEnd).toLocaleTimeString(lang === 'zh' ? 'zh-TW' : 'en-US')}
          </p>
          <p className={`text-xs flex items-center gap-1.5 mt-0.5 ${isOver ? 'text-slate-500 dark:text-slate-500' : 'text-white/60'}`}>
            <RotateCcw size={12} />
            {t.estRespawn}{new Date(m.endTime).toLocaleTimeString(lang === 'zh' ? 'zh-TW' : 'en-US')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto justify-between mt-2 sm:mt-0">
        <div className="flex gap-1 sm:gap-1.5 font-mono text-2xl sm:text-3xl font-bold">
          {isOver ? <span className="text-lg sm:text-xl flex items-center gap-2 text-slate-600 dark:text-slate-300"><Sparkles size={20}/> {t.respawnComplete}</span> : (
            <>
              <div className="bg-black/20 px-1.5 sm:px-2 py-1 rounded-lg flex flex-col items-center min-w-[40px] sm:min-w-[50px]">
                <span className="text-xl sm:text-2xl">{timeFmt.h}</span>
              </div>
              <span className="opacity-50">:</span>
              <div className="bg-black/20 px-1.5 sm:px-2 py-1 rounded-lg flex flex-col items-center min-w-[40px] sm:min-w-[50px]">
                <span className="text-xl sm:text-2xl">{timeFmt.m}</span>
              </div>
              <span className="opacity-50">:</span>
              <div className="bg-black/20 px-1.5 sm:px-2 py-1 rounded-lg flex flex-col items-center min-w-[40px] sm:min-w-[50px]">
                <span className="text-xl sm:text-2xl">{timeFmt.s}</span>
              </div>
            </>
          )}
        </div>
        
        <div className="flex gap-2">
          <button onClick={() => setEditingId(m.id)} className={`p-2 rounded-full ${isOver ? 'bg-slate-300 dark:bg-slate-700' : 'bg-black/10 hover:bg-black/20'}`}>
            <Edit3 size={18} />
          </button>
          <button onClick={() => onDelete(m.id)} className={`p-2 rounded-full ${isOver ? 'bg-slate-300 dark:bg-slate-700' : 'bg-black/10 hover:bg-black/20'}`}>
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      {/* Progress Bar */}
      {!isOver && (
        <div className="absolute bottom-0 left-0 h-1 bg-black/10 w-full overflow-hidden">
          <div 
            className="h-full bg-white/40 shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-1000 ease-linear" 
            style={{ width: `${Math.min(100, Math.max(0, ((now - (m.startTime || now)) / Math.max(1, (m.battleEndTime - (m.startTime || now)))) * 100))}%` }}
          />
        </div>
      )}
    </div>
  );
}
