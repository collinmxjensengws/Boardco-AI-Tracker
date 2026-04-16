'use client';

import { useEffect } from 'react';
import { MODULES, type Member } from '@/lib/data';

const AVATAR_COLORS = [
  '#0071E3', '#34C759', '#FF9500', '#FF3B30',
  '#AF52DE', '#5856D6', '#FF2D55', '#5AC8FA',
];

function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

interface Props {
  member: Member;
  completions: Set<string>;
  pendingKeys: Set<string>;
  onToggle: (email: string, taskId: string) => void;
  onClose: () => void;
}

export default function MemberModal({ member, completions, pendingKeys, onToggle, onClose }: Props) {
  const color = avatarColor(member.name);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock scroll on mount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const totalTasks = MODULES.reduce((a, m) => a + m.tasks.length, 0);
  const doneTasks  = MODULES.reduce((a, m) =>
    a + m.tasks.filter(t => completions.has(`${member.email}:${t.id}`)).length, 0);
  const overallPct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: 24,
          width: '100%', maxWidth: 520,
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 24px 20px',
          borderBottom: '1px solid #F2F2F7',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: color, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: 0.5,
            }}>
              {member.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1D1D1F' }}>{member.name}</div>
              <div style={{ fontSize: 13, color: '#6E6E73', marginTop: 1 }}>{member.org}</div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                border: 'none', background: '#F2F2F7',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1l10 10M11 1L1 11" stroke="#6E6E73" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Overall progress */}
          <div style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#6E6E73' }}>
                {doneTasks === totalTasks
                  ? 'All done! Amazing work!'
                  : doneTasks === 0
                  ? 'Ready to start — you\'ve got this!'
                  : `${totalTasks - doneTasks} task${totalTasks - doneTasks === 1 ? '' : 's'} left — keep going!`}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#1D1D1F' }}>{doneTasks} / {totalTasks}</span>
            </div>
            <div style={{ height: 6, background: '#E5E5EA', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                background: `linear-gradient(90deg, ${color}, ${color}CC)`,
                width: '100%',
                transform: `scaleX(${overallPct / 100})`,
                transformOrigin: 'left',
                transition: 'transform 0.5s ease',
              }} />
            </div>
          </div>
        </div>

        {/* Module list */}
        <div style={{ overflowY: 'auto', padding: '12px 24px 24px', flex: 1 }}>
          {MODULES.map(mod => {
            const done  = mod.tasks.filter(t => completions.has(`${member.email}:${t.id}`)).length;
            const total = mod.tasks.length;
            const pct   = total ? Math.round((done / total) * 100) : 0;

            return (
              <div key={mod.id} style={{ marginTop: 16 }}>
                {/* Module header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: mod.color, flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 13, fontWeight: 650, color: '#1D1D1F' }}>{mod.title}</span>
                    <span style={{ fontSize: 11, color: '#AEAEB2' }}>· Due {mod.due}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: done === total ? mod.color : '#AEAEB2' }}>
                    {done === total ? '✓ Done!' : `${done}/${total}`}
                  </span>
                </div>

                {/* Task rows */}
                <div style={{
                  background: '#FAFAFA', borderRadius: 14,
                  overflow: 'hidden', border: '1px solid #F2F2F7',
                }}>
                  {mod.tasks.map((task, i) => {
                    const key     = `${member.email}:${task.id}`;
                    const done    = completions.has(key);
                    const pending = pendingKeys.has(key);

                    return (
                      <div
                        key={task.id}
                        onClick={() => !pending && onToggle(member.email, task.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '11px 14px',
                          borderTop: i > 0 ? '1px solid #F2F2F7' : 'none',
                          cursor: pending ? 'default' : 'pointer',
                          opacity: pending ? 0.55 : 1,
                          transition: 'background 0.12s ease',
                        }}
                        onMouseEnter={e => { if (!pending) (e.currentTarget as HTMLDivElement).style.background = '#F2F2F7'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                      >
                        {/* Check circle */}
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                          background: done ? mod.color : 'transparent',
                          border: done ? 'none' : '2px solid #D2D2D7',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.16s ease',
                          boxShadow: done ? `0 2px 6px ${mod.color}40` : 'none',
                        }}>
                          {done && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8"
                                strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <span style={{
                          fontSize: 13, color: done ? '#AEAEB2' : '#1D1D1F',
                          textDecoration: done ? 'line-through' : 'none',
                          transition: 'color 0.16s ease',
                          flex: 1,
                        }}>
                          {task.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
