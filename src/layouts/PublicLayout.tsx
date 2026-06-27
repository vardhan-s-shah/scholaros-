import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { GraduationCap } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuthStore } from '../store/auth-store';

export const PublicLayout: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300 relative">
      {/* Background grids */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.04] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold tracking-tight text-lg">ScholarOS</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#platform" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Platform</a>
            <a href="#benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Benefits</a>
          </nav>

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="sm">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline-block">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-8 px-6 text-center text-xs text-muted-foreground relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} ScholarOS. Empowering academic excellence.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
