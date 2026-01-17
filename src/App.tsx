import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import { AppLayout } from "./components/app/AppLayout";
import Onboarding from "./pages/app/Onboarding";
import Overview from "./pages/app/Overview";
import ConsultingEngine from "./pages/app/ConsultingEngine";
import StrategyScenarios from "./pages/app/StrategyScenarios";
import ExecutionWorkspace from "./pages/app/ExecutionWorkspace";
import GrowthAnalytics from "./pages/app/GrowthAnalytics";
import HealthMonitor from "./pages/app/HealthMonitor";
import Playbooks from "./pages/app/Playbooks";
import Integrations from "./pages/app/Integrations";
import Settings from "./pages/app/Settings";
import AuditModule from "./pages/app/AuditModule";
import BrandingModule from "./pages/app/BrandingModule";
import TaxLegalModule from "./pages/app/TaxLegalModule";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* App Routes (Protected) */}
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Overview />} />
                <Route path="onboarding" element={<Onboarding />} />
                <Route path="consulting" element={<ConsultingEngine />} />
                <Route path="scenarios" element={<StrategyScenarios />} />
                <Route path="execution" element={<ExecutionWorkspace />} />
                <Route path="analytics" element={<GrowthAnalytics />} />
                <Route path="health" element={<HealthMonitor />} />
                <Route path="playbooks" element={<Playbooks />} />
                <Route path="integrations" element={<Integrations />} />
                <Route path="settings" element={<Settings />} />
                <Route path="audit" element={<AuditModule />} />
                <Route path="branding" element={<BrandingModule />} />
                <Route path="tax-legal" element={<TaxLegalModule />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
