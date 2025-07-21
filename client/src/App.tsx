import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import BatchDetails from "@/pages/batch-details";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/batch/:batchId" component={BatchDetails} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 font-sans">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <Router />
          </main>
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
