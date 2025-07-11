'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import AboutSection from '@/components/AboutSection';
import ProjectsSection from '@/components/ProjectsSection';
import SkillsSection from '@/components/SkillsSection';
import ResumeSection from '@/components/ResumeSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import BackgroundCanvas from '@/components/BackgroundCanvas';
import HeroSection from '@/components/HeroSection';
import LoadingScreen from '@/components/LoadingScreen';
import FloatingParticles from '@/components/animations/FloatingParticles'; // This is active
import SmoothScroll from '@/components/animations/SmoothScroll'; // Re-enabling this
import { PerformanceMonitor, throttle } from '@/lib/performance';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Portfolio Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-slate-400 mb-4">Please refresh the page to try again.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function Home() {
  const [cursorPosition, setCursorPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('about');
  const [isLoading, setIsLoading] = useState(true);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [renderParticles, setRenderParticles] = useState(true);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => {
      setRenderParticles(!mediaQuery.matches);
    };
    handleChange(); // Initial check
    mediaQuery.addEventListener('change', handleChange);

    // Ensure custom cursor class is removed to show normal cursor
    document.body.classList.remove('custom-cursor');
    
    const updateCursorPosition = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, input, textarea, [role="button"], .cursor-pointer')) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, input, textarea, [role="button"], .cursor-pointer')) {
        setIsHovering(false);
      }
    };
    
    window.addEventListener('mousemove', updateCursorPosition);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('mousemove', updateCursorPosition);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.body.classList.remove('custom-cursor');
    };
  }, [isLoading]); // isLoading dependency is kept, though the media query logic is independent of it.
                  // Consider splitting into a separate useEffect if isLoading changes frequently.

  const handleLoadingComplete = () => {
    setIsLoading(false);
    setTimeout(() => setPageLoaded(true), 100);
  };

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-30% 0px -70% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);

  // Initialize performance monitoring
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading) {
      const monitor = PerformanceMonitor.getInstance();
      monitor.startMonitoring();
      
      // Log performance metrics every 30 seconds in development
      if (process.env.NODE_ENV === 'development') {
        const interval = setInterval(() => {
          const metrics = monitor.getMetrics();
          console.log('Performance Metrics:', metrics);
        }, 30000);
        
        return () => clearInterval(interval);
      }
    }
  }, [isLoading]);

  return (
    <ErrorBoundary>
      <SmoothScroll>
        {/* Loading Screen */}
        {isLoading && (
          <ErrorBoundary>
            <LoadingScreen onLoadingComplete={handleLoadingComplete} />
          </ErrorBoundary>
        )}

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: pageLoaded ? 1 : 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={pageLoaded ? 'page-content loaded' : 'page-content'}
        >
          {/* Theme-aware background */}
          <div className="fixed inset-0 -z-20 bg-slate-900 dark:bg-slate-900" 
               style={{
                 background: 'var(--light-bg-gradient)',
               }}>
            <div className="dark:hidden absolute inset-0" 
                 style={{
                   background: 'linear-gradient(135deg, #f5f7fa, #e4ecf7)',
                 }} />
            <div className="hidden dark:block absolute inset-0 bg-slate-900" />
          </div>

          {/* Floating Particles Background */}
          {renderParticles && (
            <ErrorBoundary fallback={<div />}>
              <FloatingParticles mouse={cursorPosition} className="opacity-30" />
            </ErrorBoundary>
          )}

          <ErrorBoundary fallback={<div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-900 to-slate-800" />}>
            <Suspense fallback={<div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-900/20 to-slate-800/20" />}>
              <BackgroundCanvas cursorPosition={cursorPosition} />
            </Suspense>
          </ErrorBoundary>

          {/* Custom Cursor */}
          {!isLoading && (
            <>
              <motion.div
                className="fixed z-[60] h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-sky-400 pointer-events-none transition-transform duration-150 ease-in-out hidden md:block"
                animate={{
                  left: cursorPosition.x,
                  top: cursorPosition.y,
                  scale: isHovering ? 1.5 : 1,
                  opacity: isHovering ? 0.5 : 1,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
              <motion.div
                className="fixed z-[60] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400 pointer-events-none hidden md:block"
                animate={{ left: cursorPosition.x, top: cursorPosition.y }}
                transition={{ type: 'spring', stiffness: 800, damping: 40 }}
              />
            </>
          )}
          
          <div className="relative z-10 mx-auto min-h-screen max-w-screen-xl px-6 py-12 md:px-12 md:py-20 lg:px-24 lg:py-0">
            <div className="lg:flex lg:justify-between lg:gap-4">
              <header className="lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:flex-1 lg:flex-col lg:justify-between lg:py-24 lg:overflow-y-auto">
                <ErrorBoundary>
                  <HeroSection />
                </ErrorBoundary>
                <ErrorBoundary>
                  <Navbar activeSection={activeSection} />
                </ErrorBoundary>
              </header>
              <main id="content" className="pt-24 lg:flex-1 lg:py-24">
                <ErrorBoundary>
                  <AboutSection />
                </ErrorBoundary>
                <ErrorBoundary>
                  <ProjectsSection />
                </ErrorBoundary>
                <ErrorBoundary>
                  <SkillsSection />
                </ErrorBoundary>
                <ErrorBoundary>
                  <ResumeSection />
                </ErrorBoundary>
                <ErrorBoundary>
                  <ContactSection />
                </ErrorBoundary>
                <ErrorBoundary>
                  <Footer />
                </ErrorBoundary>
              </main>
            </div>
          </div>
        </motion.div>
      </SmoothScroll>
    </ErrorBoundary>
  );
}
