import React, { useState } from 'react';
import { Search, Bell, Plus, Shield, Sparkles, ChevronDown, LogOut } from 'lucide-react';
import { StaffUser, Role, SystemNotification } from '../../types/crm';
import { RedFlagLogo } from '../common/RedFlagLogo';

interface NavbarProps {
  currentUser: StaffUser;
  onRoleChange: (role: Role) => void;
  onOpenGlobalSearch: () => void;
  onOpenNewLeadModal: () => void;
  onOpenNewAgreementModal: () => void;
  notifications: SystemNotification[];
  onOpenNotifications: () => void;
  staffList: StaffUser[];
  onUserSelect: (user: StaffUser) => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onRoleChange,
  onOpenGlobalSearch,
  onOpenNewLeadModal,
  onOpenNewAgreementModal,
  notifications,
  onOpenNotifications,
  staffList,
  onUserSelect,
  onSignOut,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const roles: Role[] = ['Admin', 'Sales Manager', 'Sales Executive', 'Viewer'];

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
      {/* Zone 1: Brand Title */}
      <div className="flex items-center gap-3 shrink-0">
        <RedFlagLogo size="md" />
      </div>

      {/* Zone 2: Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <button
          onClick={onOpenGlobalSearch}
          className="w-full flex items-center justify-between bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs rounded-xl px-3.5 py-2 transition-all shadow-inner group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-zinc-500 group-hover:text-red-400 transition-colors" />
            <span className="truncate">Search clients, agreements, phone, agreement IDs...</span>
          </div>
          <kbd className="hidden sm:inline-block bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-mono px-1.5 py-0.5 rounded shadow">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Zone 3: Actions, Notifications, Role Switcher & Sign Out */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={onOpenNewAgreementModal}
          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md shadow-red-950/50 active:scale-95 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Issue MOU</span>
        </button>

        {/* Notifications Icon */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left transition-colors"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-lg object-cover ring-1 ring-red-500/50"
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-zinc-200 leading-tight truncate max-w-[110px]">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-red-400 font-medium leading-none flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" />
                {currentUser.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
          </button>

          {/* Role Dropdown */}
          {showRoleDropdown && (
            <div
              className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              onMouseLeave={() => setShowRoleDropdown(false)}
            >
              <div className="mb-3 pb-2 border-b border-zinc-800">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Active Session
                </span>
                <p className="text-xs text-zinc-300 font-mono">agreements@redflaghomes.in</p>
              </div>

              {/* Staff Selector */}
              <div className="space-y-1 mb-3">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block px-2">
                  Select Staff Persona:
                </span>
                {staffList.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      onUserSelect(user);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                      user.id === currentUser.id
                        ? 'bg-red-950/50 text-red-300 border border-red-800/50'
                        : 'hover:bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src={user.avatar} className="w-5 h-5 rounded-md object-cover" />
                      <span className="font-medium truncate">{user.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                      {user.role}
                    </span>
                  </button>
                ))}
              </div>

              {/* Explicit Role Override */}
              <div className="pt-2 border-t border-zinc-800">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block px-2 mb-1">
                  Change Active Role:
                </span>
                <div className="grid grid-cols-2 gap-1">
                  {roles.map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        onRoleChange(role);
                        setShowRoleDropdown(false);
                      }}
                      className={`text-center py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                        currentUser.role === role
                          ? 'bg-red-600 text-white font-semibold'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-800/50 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
