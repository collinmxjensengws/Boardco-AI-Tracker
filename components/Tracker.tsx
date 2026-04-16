'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { MEMBERS, MODULES, type Member, type Module } from '@/lib/data';
import MemberModal from '@/components/MemberModal';
import ChatBot from '@/components/ChatBot';

// ─── Helpers ────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#0071E3', '#34C759', '#FF9500', '#FF3B30',
  '#AF52DE', '#5856D6', '#FF2D55', '#5AC8FA',
];

function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function getTaskLabel(taskId: string): string {
  for (const mod of MODULES) {
    const task = mod.tasks.find(t => t.id === taskId);
    if (task) return task.label;
  }
  return 'task';
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function ProgressRing({
  pct, color, trackColor, size = 44,
}: {
  pct: number; color: string; trackColor: string; size?: number;
}) {
  const sw = 4;
  const r  = (size - sw) / 2;
  const c  = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={trackColor} strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={String(c)} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, fontWeight: 800, color, letterSpacing: -0.3,
      }}>
        {pct}%
      </div>
    </div>
  );
}

function Checkbox({
  done, pending, color, label, onClick,
}: {
  done: boolean; pending: boolean; color: string; label: string; onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={pending}
      title={label}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 28, height: 28, borderRadius: '50%', padding: 0,
        border: done ? 'none' : `2px solid ${hov ? '#AEAEB2' : '#D2D2D7'}`,
        background: done ? color : (hov ? '#F2F2F7' : '#FFFFFF'),
        cursor: pending ? 'default' : 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease',
        opacity: pending ? 0.45 : 1,
        outline: 'none',
        boxShadow: done ? `0 2px 8px ${color}38` : 'none',
      }}
    >
      {done && (
        <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
          <path d="M1 4.5L4.5 8L11 1" stroke="white" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

function MemberRow({
  member, module: mod, completions, pendingKeys, onToggle, onSelect,
}: {
  member: Member;
  module: Module;
  completions: Set<string>;
  pendingKeys: Set<string>;
  onToggle: (email: string, taskId: string) => void;
  onSelect: (member: Member) => void;
}) {
  const [hov, setHov] = useState(false);
  const done  = mod.tasks.filter(t => completions.has(`${member.email}:${t.id}`)).length;
  const total = mod.tasks.length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
  const bg    = avatarColor(member.name);

  return (
    <tr
      style={{
        borderBottom: '1px solid #F2F2F7',
        background: hov ? '#FAFAFA' : '#FFFFFF',
        transition: 'background 0.12s ease',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Member name cell — sticky on left */}
      <td style={{
        padding: '10px 20px 10px 28px',
        position: 'sticky', left: 0,
        background: hov ? '#FAFAFA' : '#FFFFFF',
        transition: 'background 0.12s ease',
        zIndex: 1,
      }}>
        <div
          onClick={() => onSelect(member)}
          style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 170, cursor: 'pointer' }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: 0.4,
          }}>
            {member.initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 14, fontWeight: 500, color: '#0071E3', whiteSpace: 'nowrap',
              textDecoration: 'underline', textDecorationColor: 'transparent',
              transition: 'text-decoration-color 0.15s ease',
            }}
              onMouseEnter={e => (e.currentTarget.style.textDecorationColor = '#0071E3')}
              onMouseLeave={e => (e.currentTarget.style.textDecorationColor = 'transparent')}
            >
              {member.name}
            </div>
          </div>
        </div>
      </td>

      {/* Task checkboxes */}
      {mod.tasks.map(task => (
        <td key={task.id} style={{ padding: '10px 8px', textAlign: 'center' }}>
          <Checkbox
            done={completions.has(`${member.email}:${task.id}`)}
            pending={pendingKeys.has(`${member.email}:${task.id}`)}
            color={mod.color}
            label={task.label}
            onClick={() => onToggle(member.email, task.id)}
          />
        </td>
      ))}

      {/* Progress mini-bar */}
      <td style={{ padding: '10px 20px 10px 8px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
          <div style={{
            width: 48, height: 4, background: '#E5E5EA', borderRadius: 2, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', background: mod.color,
              width: '100%',
              transform: `scaleX(${pct / 100})`,
              transformOrigin: 'left',
              transition: 'transform 0.3s ease',
            }} />
          </div>
          <span style={{ fontSize: 12, color: '#6E6E73', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
            {done}/{total}
          </span>
        </div>
      </td>
    </tr>
  );
}

// ─── Undo toast ─────────────────────────────────────────────────────────────

function Toast({ label, wasCompleted, onUndo, onDismiss }: {
  label: string; wasCompleted: boolean; onUndo: () => void; onDismiss: () => void;
}) {
  const short = label.length > 32 ? label.slice(0, 32) + '…' : label;
  return (
    <>
      <style>{`@keyframes toast-in { from { opacity:0; transform:translateX(-50%) translateY(10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
      <div style={{
        position: 'fixed', bottom: 96, left: '50%',
        transform: 'translateX(-50%)', zIndex: 400,
        background: '#1D1D1F', color: '#FFFFFF',
        borderRadius: 14, padding: '11px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
        fontSize: 13.5, whiteSpace: 'nowrap',
        animation: 'toast-in 0.18s ease forwards',
      }}>
        <span style={{ fontSize: 15, color: wasCompleted ? '#AEAEB2' : '#34C759' }}>
          {wasCompleted ? '↩' : '✓'}
        </span>
        <span>
          {wasCompleted ? 'Unchecked' : 'Done!'}{' '}
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{short}</span>
        </span>
        <button onClick={onUndo} style={{
          background: 'rgba(255,255,255,0.15)', border: 'none', color: '#FFFFFF',
          borderRadius: 7, padding: '5px 11px', cursor: 'pointer',
          fontSize: 12.5, fontWeight: 600, marginLeft: 2,
        }}>Undo</button>
        <button onClick={onDismiss} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)',
          cursor: 'pointer', fontSize: 20, padding: '0 2px',
          lineHeight: 1, display: 'flex', alignItems: 'center',
        }}>×</button>
      </div>
    </>
  );
}

// ─── Section divider row ─────────────────────────────────────────────────────

function SectionHeader({ label, color, colSpan }: { label: string; color: string; colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{
        padding: '12px 28px 5px',
        background: '#FAFAFA',
        borderTop: '1px solid #F2F2F7',
      }}>
        <span style={{
          fontSize: 10, fontWeight: 800, letterSpacing: 1.2,
          textTransform: 'uppercase', color,
        }}>{label}</span>
      </td>
    </tr>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function Tracker() {
  const [activeModuleId, setActiveModuleId] = useState(1);
  const [completions, setCompletions]       = useState<Set<string>>(new Set());
  const [loading, setLoading]               = useState(true);
  const [pendingKeys, setPendingKeys]       = useState<Set<string>>(new Set());
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [toast, setToast]                   = useState<{ label: string; email: string; taskId: string; wasCompleted: boolean } | null>(null);
  const toastTimer                          = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load initial data + subscribe to realtime changes
  useEffect(() => {
    supabase
      .from('task_completions')
      .select('member_email,task_id')
      .then(({ data }) => {
        if (data) setCompletions(new Set(data.map((r: any) => `${r.member_email}:${r.task_id}`)));
        setLoading(false);
      });

    const channel = supabase
      .channel('task_completions_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'task_completions' },
        (p: any) => setCompletions(prev => { const n = new Set(prev); n.add(`${p.new.member_email}:${p.new.task_id}`); return n; }))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'task_completions' },
        (p: any) => setCompletions(prev => {
          const n = new Set(prev);
          n.delete(`${p.old.member_email}:${p.old.task_id}`);
          return n;
        }))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  const toggle = useCallback(async (email: string, taskId: string, silent = false) => {
    const key = `${email}:${taskId}`;
    if (pendingKeys.has(key)) return;
    const was = completions.has(key);

    // Optimistic update
    setCompletions(prev => { const n = new Set(prev); was ? n.delete(key) : n.add(key); return n; });
    setPendingKeys(prev => { const n = new Set(prev); n.add(key); return n; });

    // Show undo toast
    if (!silent) {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToast({ label: getTaskLabel(taskId), email, taskId, wasCompleted: was });
      toastTimer.current = setTimeout(() => setToast(null), 3500);
    }

    const { error } = was
      ? await supabase.from('task_completions').delete().match({ member_email: email, task_id: taskId })
      : await supabase.from('task_completions').upsert({ member_email: email, task_id: taskId });

    if (error) {
      setCompletions(prev => { const n = new Set(prev); was ? n.add(key) : n.delete(key); return n; });
      setToast(null);
    }
    setPendingKeys(prev => { const n = new Set(prev); n.delete(key); return n; });
  }, [completions, pendingKeys, dismissToast]);

  // ── Derived stats ────────────────────────────────────────────────────────

  const modProgress = (modId: number) => {
    const mod   = MODULES.find(m => m.id === modId)!;
    const total = MEMBERS.length * mod.tasks.length;
    const done  = MEMBERS.reduce((a, mb) =>
      a + mod.tasks.filter(t => completions.has(`${mb.email}:${t.id}`)).length, 0);
    return { done, total, pct: total ? Math.round(done / total * 100) : 0 };
  };

  const overall = (() => {
    const total = MODULES.reduce((a, m) => a + MEMBERS.length * m.tasks.length, 0);
    const done  = MODULES.reduce((a, mod) =>
      a + MEMBERS.reduce((b, mb) =>
        b + mod.tasks.filter(t => completions.has(`${mb.email}:${t.id}`)).length, 0), 0);
    return { done, total, pct: total ? Math.round(done / total * 100) : 0 };
  })();

  const activeMod      = MODULES.find(m => m.id === activeModuleId)!;
  const activeProgress = modProgress(activeModuleId);
  const boardco        = MEMBERS.filter(m => m.org === 'BoardCo');
  const marine         = MEMBERS.filter(m => m.org === "Mark's Marine");
  const colSpan        = activeMod.tasks.length + 2;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F7' }}>

      {/* ── Sticky Header ─────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(245,245,247,0.88)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 24px',
          height: 62, display: 'flex', alignItems: 'center', gap: 20,
        }}>
          {/* Logo + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              background: 'linear-gradient(135deg, #0071E3 0%, #34C759 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 650, color: '#1D1D1F', lineHeight: 1.2 }}>
                BoardCo AI Training
              </div>
              <div style={{ fontSize: 11, color: '#6E6E73', lineHeight: 1 }}>Spring 2026</div>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="header-progress">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#6E6E73' }}>Overall Progress</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#1D1D1F' }}>
                {loading ? '—' : `${overall.done} / ${overall.total}`}
              </span>
            </div>
            <div style={{ height: 5, background: '#E5E5EA', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 3,
                background: 'linear-gradient(90deg, #0071E3, #34C759)',
                width: '100%',
                transform: `scaleX(${overall.pct / 100})`,
                transformOrigin: 'left',
                transition: 'transform 0.6s ease',
              }} />
            </div>
            <div style={{ fontSize: 11, color: '#AEAEB2' }}>{overall.pct}% complete across all modules</div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '30px 24px 72px' }}>

        {/* ── Module Cards ──────────────────────────────────────────────── */}
        <div className="module-grid" style={{ marginBottom: 28 }}>
          {MODULES.map(mod => {
            const p        = modProgress(mod.id);
            const isActive = mod.id === activeModuleId;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveModuleId(mod.id)}
                style={{
                  border: 'none',
                  borderRadius: 18,
                  padding: '18px 20px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  outline: 'none',
                  background: isActive ? mod.color : '#FFFFFF',
                  boxShadow: isActive
                    ? `0 8px 30px ${mod.color}42`
                    : '0 1px 10px rgba(0,0,0,0.07)',
                  transition: 'all 0.22s ease',
                  transform: isActive ? 'translateY(-2px)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                    <div style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
                      textTransform: 'uppercase', marginBottom: 4,
                      color: isActive ? 'rgba(255,255,255,0.62)' : '#6E6E73',
                    }}>
                      {mod.week}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 650, lineHeight: 1.2, color: isActive ? '#FFFFFF' : '#1D1D1F' }}>
                      {mod.title}
                    </div>
                  </div>
                  <ProgressRing
                    pct={loading ? 0 : p.pct}
                    color={isActive ? 'rgba(255,255,255,0.92)' : mod.color}
                    trackColor={isActive ? 'rgba(255,255,255,0.22)' : '#F2F2F7'}
                    size={42}
                  />
                </div>
                <div style={{ fontSize: 11, color: isActive ? 'rgba(255,255,255,0.62)' : '#AEAEB2' }}>
                  Due {mod.due} · {loading ? '—' : `${p.done}/${p.total}`} tasks
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Active Module Panel ───────────────────────────────────────── */}
        <div className="fade-in" key={activeModuleId} style={{
          background: '#FFFFFF',
          borderRadius: 20,
          boxShadow: '0 2px 24px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          {/* Module header */}
          <div style={{ padding: '22px 28px', borderBottom: '1px solid #F2F2F7' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                  background: activeMod.color,
                  boxShadow: `0 0 0 3px ${activeMod.color}28`,
                }} />
                <div>
                  <div style={{ fontSize: 12, color: '#6E6E73', fontWeight: 500 }}>
                    {activeMod.week} · Due {activeMod.due}
                  </div>
                  <h2 style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 700, color: '#1D1D1F' }}>
                    {activeMod.title}
                  </h2>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 30, fontWeight: 800, color: activeMod.color, lineHeight: 1 }}>
                  {loading ? '—' : `${activeProgress.pct}%`}
                </div>
                <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 2 }}>
                  {loading ? '' : `${activeProgress.done} / ${activeProgress.total} tasks`}
                </div>
              </div>
            </div>
            <p style={{
              margin: '14px 0 0 24px', fontSize: 13, color: '#6E6E73', lineHeight: 1.65,
              paddingLeft: 14, borderLeft: `2px solid ${activeMod.color}35`,
            }}>
              {activeMod.description}
            </p>
          </div>

          {/* Table or loading state */}
          {loading ? (
            <div style={{ padding: '60px 28px', textAlign: 'center' }}>
              <div style={{
                display: 'inline-block', width: 28, height: 28,
                border: `3px solid ${activeMod.color}28`, borderTopColor: activeMod.color,
                borderRadius: '50%', animation: 'spin 0.75s linear infinite',
              }} />
              <div style={{ marginTop: 14, fontSize: 14, color: '#6E6E73' }}>Loading progress…</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%', borderCollapse: 'collapse',
                minWidth: Math.max(580, 220 + activeMod.tasks.length * 108 + 110),
              }}>
                <thead>
                  <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F2F2F7' }}>
                    <th style={{
                      padding: '10px 20px 10px 28px', textAlign: 'left',
                      position: 'sticky', left: 0, background: '#FAFAFA', zIndex: 2,
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#C7C7CC', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                        Member
                      </span>
                    </th>
                    {activeMod.tasks.map(task => (
                      <th key={task.id} style={{ padding: '10px 8px', textAlign: 'center', minWidth: 100 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#AEAEB2' }} title={task.label}>
                          {task.shortLabel}
                        </span>
                      </th>
                    ))}
                    <th style={{ padding: '10px 20px', minWidth: 90 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#C7C7CC', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                        Done
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <SectionHeader label="BoardCo · Utah & DFW" color="#0071E3" colSpan={colSpan} />
                  {boardco.map(member => (
                    <MemberRow
                      key={member.email}
                      member={member}
                      module={activeMod}
                      completions={completions}
                      pendingKeys={pendingKeys}
                      onToggle={toggle}
                      onSelect={setSelectedMember}
                    />
                  ))}
                  <SectionHeader label="Mark's Marine" color="#AF52DE" colSpan={colSpan} />
                  {marine.map(member => (
                    <MemberRow
                      key={member.email}
                      member={member}
                      module={activeMod}
                      completions={completions}
                      pendingKeys={pendingKeys}
                      onToggle={toggle}
                      onSelect={setSelectedMember}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 32, textAlign: 'center', fontSize: 12, color: '#C7C7CC' }}>
          Vjal program resumes May 4th · Questions? Reach Tom or Collin
        </div>
      </main>

      {/* Member progress modal */}
      {selectedMember && (
        <MemberModal
          member={selectedMember}
          completions={completions}
          pendingKeys={pendingKeys}
          onToggle={toggle}
          onClose={() => setSelectedMember(null)}
        />
      )}

      {/* Undo toast */}
      {toast && (
        <Toast
          label={toast.label}
          wasCompleted={toast.wasCompleted}
          onUndo={() => { toggle(toast.email, toast.taskId, true); dismissToast(); }}
          onDismiss={dismissToast}
        />
      )}

      {/* AI chatbot */}
      <ChatBot />
    </div>
  );
}
