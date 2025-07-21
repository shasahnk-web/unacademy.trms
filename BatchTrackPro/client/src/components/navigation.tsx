import { Link, useLocation } from "wouter";
import { GraduationCap, Home, ChevronRight, Bell, User } from "lucide-react";

interface NavigationProps {
  currentBatch?: {
    batchName: string;
    batchId: string;
  };
}

export default function Navigation({ currentBatch }: NavigationProps) {
  const [location] = useLocation();

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-800">Unacademy</h1>
            </div>
            
            {/* Breadcrumb */}
            <nav className="hidden md:flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <Link 
                    href="/" 
                    className={`${location === '/' ? 'text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Home className="h-4 w-4" />
                  </Link>
                </li>
                {currentBatch && location.startsWith('/batch/') && (
                  <li className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-slate-400 mx-2" />
                    <span className="text-slate-700 truncate max-w-48">
                      {currentBatch.batchName}
                    </span>
                  </li>
                )}
              </ol>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-500 hover:text-slate-700 md:hidden">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden md:flex items-center space-x-3">
              <button className="p-2 text-slate-500 hover:text-slate-700">
                <Bell className="h-5 w-5" />
              </button>
              <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-slate-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
