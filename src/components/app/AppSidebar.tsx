import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Brain,
  GitBranch,
  CheckSquare,
  TrendingUp,
  HeartPulse,
  BookOpen,
  Plug,
  Settings,
  LogOut,
  ChevronLeft,
  Building2,
  ClipboardCheck,
  Palette,
  Scale,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useCompany } from '@/hooks/useCompany';
import { cn } from '@/lib/utils';

const mainNavItems = [
  { title: 'Overview', url: '/app', icon: LayoutDashboard },
  { title: 'Consulting Engine', url: '/app/consulting', icon: Brain },
  { title: 'Strategy Scenarios', url: '/app/scenarios', icon: GitBranch },
  { title: 'Execution Workspace', url: '/app/execution', icon: CheckSquare },
  { title: 'Growth Analytics', url: '/app/analytics', icon: TrendingUp },
  { title: 'Health Monitor', url: '/app/health', icon: HeartPulse },
  { title: 'Finance Report Analysis', url: '/app/audit', icon: ClipboardCheck },
  { title: 'AI Design & Branding', url: '/app/branding', icon: Palette },
  { title: 'Tax & Legal', url: '/app/tax-legal', icon: Scale },
];

const resourceNavItems = [
  { title: 'Playbooks', url: '/app/playbooks', icon: BookOpen },
  { title: 'Integrations', url: '/app/integrations', icon: Plug },
  { title: 'Settings', url: '/app/settings', icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  const { company } = useCompany();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const isActive = (url: string) => {
    if (url === '/app') {
      return location.pathname === '/app';
    }
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link to="/app" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/logo.png" alt="ATLAS" className="w-full h-full object-contain" />
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold tracking-tight"
            >
              ATLAS
            </motion.span>
          )}
        </Link>
      </SidebarHeader>

      {/* Company Selector */}
      {company && !isCollapsed && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
            <Building2 size={16} className="text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{company.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{company.industry}</p>
            </div>
          </div>
        </div>
      )}

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url} className={cn(
                      "transition-all duration-200",
                      isActive(item.url) && "bg-primary/10 text-primary"
                    )}>
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourceNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url} className={cn(
                      "transition-all duration-200",
                      isActive(item.url) && "bg-primary/10 text-primary"
                    )}>
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut()}
              tooltip="Sign Out"
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
