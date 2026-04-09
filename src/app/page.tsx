"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Plus, ExternalLink, Trash2, RotateCcw, Clock, BellRing, Sparkles, Users, Edit3, Check, X, MapPin } from 'lucide-react';
import { Mushroom, AreaGroup } from '@/types/mushroom';

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
  const notifiedSet = useRef<Set<string>>(new Set());

  useEffect(() => {
    const savedMs = localStorage.getItem('pikmin_mushrooms');
    const savedGroups = localStorage.getItem('pikmin_groups');
    
    let initialGroups: AreaGroup[] = [];
    if (savedGroups) {
      initialGroups = JSON.parse(savedGroups);
    } else {
      initialGroups = [{ id: 'default', name: '首頁' }];
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
    
    mushrooms.forEach(m => {
      const bEnd = m.battleEndTime || (m.endTime - 5 * 60000);
      if (now >= bEnd && !notifiedSet.current.has(m.id + '_battle')) {
        notifiedSet.current.add(m.id + '_battle');
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('⚔️ 戰鬥結束！', { body: `${m.name} 的戰鬥已完成，5分鐘後重生。` });
        }
      }
      if (now >= m.endTime && !notifiedSet.current.has(m.id + '_respawn')) {
        notifiedSet.current.add(m.id + '_respawn');
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🍄 蘑菇已重生！', { body: `${m.name} 已經重生完畢！` });
        }
      }
    });
  }, [mushrooms, groups, now]);

  const addMushroom = (h: number, m: number, s: number, name: string, participants: number) => {
    const battleMs = (h * 3600 + m * 60 + s) * 1000;
    const battleEndTime = Date.now() + battleMs;
    const endTime = battleEndTime + 5 * 60 * 1000;
    const newMs: Mushroom = {
      id: crypto.randomUUID(),
      name: name || `蘑菇`,
      groupId: activeGroupId,
      participants: participants || 5,
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

  const addGroup = () => {
    const name = prompt("請輸入區域名稱:", "新區域");
    if (name) {
      const newGroup = { id: crypto.randomUUID(), name };
      setGroups([...groups, newGroup]);
      setActiveGroupId(newGroup.id);
    }
  };

  const deleteGroup = (id: string) => {
    if (groups.length <= 1) return alert("至少需保留一個區域");
    if (confirm("確要刪除此區域嗎？其中的紀錄也會一起刪除。")) {
      setGroups(groups.filter(g => g.id !== id));
      setMushrooms(mushrooms.filter(m => m.groupId !== id));
      if (activeGroupId === id) setActiveGroupId(groups[0].id);
    }
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
    <main className="min-h-screen bg-slate-100 p-4 pb-24 md:p-8 font-sans">
      <header className="flex justify-between items-center mb-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            🍄 蘑菇戰報
          </h1>
        </div>
        <button onClick={() => window.location.href='pikminbloom://'} className="p-3 bg-white rounded-xl shadow-sm text-green-600 active:scale-95 transition-transform">
           <ExternalLink size={24} />
        </button>
      </header>

      {/* Tabs / Groups Selection */}
      <div className="max-w-2xl mx-auto mb-6 flex items-center gap-2">
        <div className="flex-1 overflow-x-auto no-scrollbar flex gap-2 py-2">
          {groups.map(g => (
            <button
              key={g.id}
              onClick={() => setActiveGroupId(g.id)}
              onDoubleClick={() => {
                const newName = prompt("重新命名區域:", g.name);
                if (newName) setGroups(groups.map(group => group.id === g.id ? {...group, name: newName} : group));
              }}
              className={`px-5 py-2.5 rounded-2xl whitespace-nowrap font-bold transition-all flex items-center gap-2 active:scale-95 shadow-sm ${
                activeGroupId === g.id 
                  ? 'bg-blue-600 text-white shadow-blue-500/20' 
                  : 'bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              <MapPin size={16} />
              {g.name}
              {activeGroupId === g.id && activeMushrooms.length > 0 && (
                <span className="bg-white/30 text-[10px] px-1.5 py-0.5 rounded-md ml-1">{activeMushrooms.length}</span>
              )}
            </button>
          ))}
          <button 
            onClick={addGroup}
            className="p-2.5 bg-slate-200 text-slate-600 rounded-2xl hover:bg-slate-300 transition-all flex items-center justify-center min-w-[45px] active:scale-95"
          >
            <Plus size={20} />
          </button>
        </div>
        <button 
           onClick={() => deleteGroup(activeGroupId)}
           className="p-2.5 bg-white text-rose-500 rounded-2xl shadow-sm hover:bg-rose-50 transition-all active:scale-95"
           title="刪除目前分頁"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="grid gap-4 max-w-2xl mx-auto">
        {activeMushrooms.length === 0 && (
          <div className="text-center p-12 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
            <Sparkles className="mx-auto mb-3 opacity-50" size={32} />
            <p className="font-bold">「{groups.find(g => g.id === activeGroupId)?.name}」目前沒有紀錄</p>
            <p className="text-sm mt-1">點擊右下角 + 開始新增</p>
          </div>
        )}
        {sortedMushrooms.map(m => (
          <MushroomItem 
            key={m.id} 
            m={m} 
            now={now} 
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsAdding(false)}></div>
          <div className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl relative z-10 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                 <Sparkles className="text-amber-500" size={24} />
                 新增至 {groups.find(g => g.id === activeGroupId)?.name}
              </h2>
              <button onClick={() => setIsAdding(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 active:scale-95 transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="grid gap-5">
              <div>
                 <label className="block text-sm font-bold text-slate-600 mb-2">蘑菇名稱 (選填)</label>
                 <input id="quick-name" placeholder="例如：火屬性巨大蘑菇" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-lg font-medium placeholder:text-slate-400" />
              </div>
              
              <div>
                 <label className="block text-sm font-bold text-slate-600 mb-2">參戰人數</label>
                 <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 focus-within:border-blue-500 focus-within:bg-white transition-all">
                   <Users size={20} className="text-slate-400 mr-2" />
                   <input id="quick-p" type="number" defaultValue="5" min="1" className="w-full bg-transparent outline-none font-bold text-xl" />
                 </div>
              </div>

              <div>
                 <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-1"><Clock size={16}/> 剩餘戰鬥時間</label>
                 <div className="flex gap-2">
                    <div className="flex-1 relative">
                       <input id="quick-h" type="text" inputMode="numeric" pattern="[0-9]*" placeholder="00" className="w-full bg-slate-50 border-2 border-slate-100 p-3 pb-6 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-center text-3xl font-mono font-bold placeholder:text-slate-300" onInput={e => { const t = e.target as HTMLInputElement; t.value = t.value.replace(/\D/g, '').slice(0, 2); if (t.value.length >= 2) document.getElementById('quick-m')?.focus() }} />
                       <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Hrs</span>
                    </div>
                    <span className="text-2xl font-bold text-slate-300 self-center mb-6">:</span>
                    <div className="flex-1 relative">
                       <input id="quick-m" type="text" inputMode="numeric" pattern="[0-9]*" placeholder="00" className="w-full bg-slate-50 border-2 border-slate-100 p-3 pb-6 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-center text-3xl font-mono font-bold placeholder:text-slate-300" onInput={e => { const t = e.target as HTMLInputElement; t.value = t.value.replace(/\D/g, '').slice(0, 2); if (t.value.length >= 2) document.getElementById('quick-s')?.focus() }} />
                       <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Min</span>
                    </div>
                    <span className="text-2xl font-bold text-slate-300 self-center mb-6">:</span>
                    <div className="flex-1 relative">
                       <input id="quick-s" type="text" inputMode="numeric" pattern="[0-9]*" placeholder="00" className="w-full bg-slate-50 border-2 border-slate-100 p-3 pb-6 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-center text-3xl font-mono font-bold placeholder:text-slate-300" onInput={e => { const t = e.target as HTMLInputElement; t.value = t.value.replace(/\D/g, '').slice(0, 2); }} />
                       <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Sec</span>
                    </div>
                 </div>
              </div>

              <button 
                onClick={() => {
                  const n = (document.getElementById('quick-name') as HTMLInputElement).value;
                  const p = parseInt((document.getElementById('quick-p') as HTMLInputElement).value) || 5;
                  const h = parseInt((document.getElementById('quick-h') as HTMLInputElement).value) || 0;
                  const m = parseInt((document.getElementById('quick-m') as HTMLInputElement).value) || 0;
                  const s = parseInt((document.getElementById('quick-s') as HTMLInputElement).value) || 0;
                  if (h+m+s === 0) return alert("請至少輸入一項時間！");
                  addMushroom(h, m, s, n, p);
                  setIsAdding(false);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white py-4 rounded-2xl font-bold text-lg shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-2 mt-2"
              >
                <Plus size={24} /> 建立追蹤
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function MushroomItem({ m, now, isEditing, setEditingId, onDelete, onUpdate, onResetNote }: { 
  m: Mushroom, 
  now: number, 
  isEditing: boolean,
  setEditingId: (id: string | null) => void,
  onDelete: (id: string) => void, 
  onUpdate: (id: string, u: Partial<Mushroom>) => void,
  onResetNote: () => void
}) {
  const [editP, setEditP] = useState(m.participants);
  const [editH, setEditH] = useState("");
  const [editM, setEditM] = useState("");
  const [editS, setEditS] = useState("");
  
  const hRef = useRef<HTMLInputElement>(null);
  const mRef = useRef<HTMLInputElement>(null);
  const sRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setEditP(m.participants);
      setEditH("");
      setEditM("");
      setEditS("");
    }
  }, [isEditing, m.participants]);

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

  const t = formatTime(diff);

  if (isEditing) {
    return (
      <div className="bg-white p-5 rounded-3xl shadow-sm border-2 border-blue-500 transition-all">
        <div className="flex gap-2 mb-3">
          <input 
            defaultValue={m.name} 
            onChange={e => onUpdate(m.id, { name: e.target.value })}
            className="border p-2 rounded-lg flex-1 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="蘑菇名稱"
          />
          <div className="flex items-center border rounded-lg px-2 gap-2 focus-within:ring-2 focus-within:ring-blue-500">
            <Users size={16} className="text-slate-400" />
            <input 
              type="number" 
              value={editP} 
              onChange={e => setEditP(parseInt(e.target.value) || 5)}
              className="w-10 outline-none font-bold text-slate-700 bg-transparent text-center"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="text-sm text-slate-500 font-bold mb-1 flex items-center gap-1"><Clock size={14} /> 重新設定剩餘時間 (選填)</div>
          <div className="flex gap-2 items-center">
            <input 
              ref={hRef}
              type="text" inputMode="numeric" pattern="[0-9]*" 
              placeholder={t.h} 
              value={editH}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                setEditH(val);
                if (val.length === 2 && mRef.current) mRef.current.focus();
              }}
              className="w-full text-center p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg font-bold bg-white"
            />
            <span className="font-bold text-slate-400">:</span>
            <input 
              ref={mRef}
              type="text" inputMode="numeric" pattern="[0-9]*" 
              placeholder={t.m} 
              value={editM}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                setEditM(val);
                if (val.length === 2 && sRef.current) sRef.current.focus();
              }}
              className="w-full text-center p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg font-bold bg-white"
            />
            <span className="font-bold text-slate-400">:</span>
            <input 
              ref={sRef}
              type="text" inputMode="numeric" pattern="[0-9]*" 
              placeholder={t.s} 
              value={editS}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                setEditS(val);
              }}
              className="w-full text-center p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg font-bold bg-white"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => {
              const updates: Partial<Mushroom> = { participants: editP };
              if (editH || editM || editS) {
                 const h = parseInt(editH) || 0;
                 const min = parseInt(editM) || 0;
                 const sec = parseInt(editS) || 0;
                 const battleMs = (h*3600 + min*60 + sec)*1000;
                 updates.battleEndTime = Date.now() + battleMs;
                 updates.endTime = updates.battleEndTime + 5 * 60 * 1000;
                 onResetNote();
              }
              onUpdate(m.id, updates);
              setEditingId(null);
            }}
            className="bg-blue-600 text-white px-4 py-3 rounded-xl flex-1 font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 active:scale-95 transition-transform"
          >
            <Check size={18} /> 儲存修改
          </button>
          <button onClick={() => setEditingId(null)} className="bg-slate-100 hover:bg-slate-200 text-slate-500 px-4 py-3 rounded-xl font-bold active:scale-95 transition-transform">
            取消
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-5 rounded-3xl transition-all duration-300 relative overflow-hidden flex flex-col sm:flex-row justify-between items-center gap-4 ${isOver ? 'bg-slate-200 opacity-60' : `bg-gradient-to-br text-white shadow-xl -translate-y-1 ${m.color}`}`}>
      <div className="flex flex-col items-start w-full sm:w-auto">
        <h3 className="text-xl font-bold flex items-center gap-2">
          {m.name}
          <span className="flex items-center gap-1 text-sm bg-white/20 px-2 py-0.5 rounded-full font-normal shadow-sm">
            <Users size={14} /> {m.participants} 人
          </span>
          {isWaitingRespawn && (
             <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse shadow-sm">
               重生中
             </span>
          )}
        </h3>
        <div className="mt-1">
          <p className={`text-xs flex items-center gap-1.5 ${isOver ? 'text-slate-500' : 'text-white/80'}`}>
            <Clock size={12} />
            戰鬥結束：{new Date(battleEnd).toLocaleTimeString()}
          </p>
          <p className={`text-xs flex items-center gap-1.5 mt-0.5 ${isOver ? 'text-slate-400' : 'text-white/60'}`}>
            <RotateCcw size={12} />
            預計重生：{new Date(m.endTime).toLocaleTimeString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto justify-between mt-2 sm:mt-0">
        <div className="flex gap-1.5 font-mono text-3xl font-bold">
          {isOver ? <span className="text-xl flex items-center gap-2"><Sparkles size={20}/> 重生完成</span> : (
            <>
              <div className="bg-black/20 px-2 py-1 rounded-lg flex flex-col items-center min-w-[50px]">
                <span className="text-2xl">{t.h}</span>
              </div>
              <span className="opacity-50">:</span>
              <div className="bg-black/20 px-2 py-1 rounded-lg flex flex-col items-center min-w-[50px]">
                <span className="text-2xl">{t.m}</span>
              </div>
              <span className="opacity-50">:</span>
              <div className="bg-black/20 px-2 py-1 rounded-lg flex flex-col items-center min-w-[50px]">
                <span className="text-2xl">{t.s}</span>
              </div>
            </>
          )}
        </div>
        
        <div className="flex gap-2">
          <button onClick={() => setEditingId(m.id)} className={`p-2 rounded-full ${isOver ? 'bg-slate-300' : 'bg-black/10'}`}>
            <Edit3 size={18} />
          </button>
          <button onClick={() => onDelete(m.id)} className={`p-2 rounded-full ${isOver ? 'bg-slate-300' : 'bg-black/10'}`}>
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
