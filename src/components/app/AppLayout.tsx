import { Outlet, Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { AppTopbar } from './AppTopbar';
import { useAuth } from '@/hooks/useAuth';
import { useCompany, CompanyProvider } from '@/hooks/useCompany';
import { Loader2 } from 'lucide-react';

function AppLayoutContent() {
  const { user, loading: authLoading } = useAuth();
  const { loading: companyLoading, needsOnboarding } = useCompany();

  if (authLoading || companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading ATLAS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (needsOnboarding && !window.location.pathname.includes('/app/onboarding')) {
    return <Navigate to="/app/onboarding" replace />;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <AppTopbar />
          <main className="flex-1 p-6 bg-background">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export function AppLayout() {
  return (
    <CompanyProvider>
      <AppLayoutContent />
    </CompanyProvider>
  );
}
