import React from 'react';
import { X, Bell, CheckCircle2, Eye, ShieldAlert, Sparkles } from 'lucide-react';
import { SystemNotification } from '../../types/crm';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SystemNotification[];
  onMarkAllAsRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
      <div className="bg-zinc-950 border-l border-zinc-800 w-full max-w-sm h-full flex flex-col shadow-2xl">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-bold text-white">System Alerts & Activity</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-[10px] font-semibold text-red-400 hover:text-red-300"
            >
              Mark All Read
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {notifications.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-10">No system notifications.</p>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-xl border transition-all ${
                  notif.read
                    ? 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400'
                    : 'bg-zinc-900 border-red-500/40 text-zinc-100 shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                    {notif.type}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500">
                    {new Date(notif.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                <p className="text-xs text-zinc-400 mt-0.5">{notif.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
