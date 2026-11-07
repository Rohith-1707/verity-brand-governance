import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FolderSync,
  FileCheck2,
  FileSpreadsheet,
  GitCompare,
  ScrollText,
  CheckSquare,
  BrainCircuit,
  Activity,
  History,
  Settings,
  ShieldCheck,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  open: boolean;
  onClose?: () => void;
  pendingReviewsCount?: number;
  openImpactsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  onClose,
  pendingReviewsCount = 0,
  openImpactsCount = 0
}) => {
  const { user } = useAuth();
  const role = user?.role || 'creator';

  const navItems = [
    {
      group: 'Core Governance',
      items: [
        { label: 'Main Dashboard', to: '/app/dashboard', icon: LayoutDashboard },
        { label: 'Content Verification', to: '/app/verify', icon: FileCheck2 },
        {
          label: 'Review & Approval',
          to: '/app/review',
          icon: CheckSquare,
          badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined,
          badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        },
        { label: 'Verification Reports', to: '/app/reports', icon: FileSpreadsheet },
      ]
    },
    {
      group: 'Truth & Guidelines',
      items: [
        { label: 'Knowledge Base', to: '/app/knowledge-base', icon: BookOpen },
        {
          label: 'Document Management',
          to: '/app/documents',
          icon: FolderSync,
          roles: ['admin', 'reviewer']
        },
        {
          label: 'Change Impact Analysis',
          to: '/app/impact',
          icon: GitCompare,
          badge: openImpactsCount > 0 ? openImpactsCount : undefined,
          badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
        },
        { label: 'Brand Guidelines', to: '/app/guidelines', icon: ScrollText },
      ]
    },
    {
      group: 'Intelligence & Health',
      items: [
        { label: 'Governance Intelligence', to: '/app/governance', icon: BrainCircuit },
        { label: 'Brand Health Score', to: '/app/brand-health', icon: Activity },
        { label: 'Audit History', to: '/app/audit', icon: History, roles: ['admin', 'reviewer'] },
        { label: 'Settings & Weights', to: '/app/settings', icon: Settings, roles: ['admin'] },
      ]
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <ShieldCheck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white">VERITY</span>
              <span className="block text-[10px] text-cyan-400 font-medium -mt-1 tracking-wider uppercase">
                Brand Governance
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navItems.map((group, idx) => {
            const accessibleItems = group.items.filter(
              (item) => !item.roles || item.roles.includes(role)
            );
            if (accessibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {group.group}
                </div>
                {accessibleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-cyan-500/15 to-teal-500/10 text-cyan-400 font-semibold border-l-2 border-cyan-400'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge != null && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* User Role Card */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 border border-slate-800">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-md bg-cyan-950 border border-cyan-700/50 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-200 truncate">{user?.name}</div>
                <div className="text-[10px] text-slate-400 capitalize">{user?.role}</div>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                user?.role === 'admin'
                  ? 'bg-purple-950 text-purple-400 border border-purple-800'
                  : user?.role === 'reviewer'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
              }`}
            >
              {user?.role}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
