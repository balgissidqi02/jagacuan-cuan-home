import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { Navbar } from "@/components/Navbar";
import Index from "./pages/Index";
import Budgeting from "./pages/Budgeting";
import AddBudget from "./pages/AddBudget";
import Spending from "./pages/Spending";
import SpendingTracker from "./pages/SpendingTracker";
import GoalsWithCustomCategories from "./pages/GoalsWithCustomCategories";
import Education from "./pages/Education";
import Challenge from "./pages/Challenge";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth routes without sidebar */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* App routes with sidebar */}
          <Route path="/*" element={
            <SidebarProvider>
              <div className="min-h-screen flex w-full bg-background">
                <AppSidebar />
                <main className="flex-1">
                  <Navbar />
                  <div className="p-0">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/budgeting" element={<Budgeting />} />
                      <Route path="/add-budget" element={<AddBudget />} />
                      <Route path="/spending" element={<SpendingTracker />} />
                      <Route path="/goals" element={<GoalsWithCustomCategories />} />
                      <Route path="/education" element={<Education />} />
                      <Route path="/challenge" element={<Challenge />} />
                      <Route path="/profile" element={<Profile />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </main>
              </div>
            </SidebarProvider>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
