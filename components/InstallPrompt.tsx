import React, { useState, useEffect } from 'react';
import { Download, Share, X, PlusSquare } from 'lucide-react';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsStandalone(true);
      return;
    }

    // Android / Desktop Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowAndroidPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);
    if (isIos && !isStandalone) {
      // Basic heuristic: check if session storage has flag to not annoy user every refresh
      const hasSeenPrompt = sessionStorage.getItem('iosInstallPromptSeen');
      if (!hasSeenPrompt) {
        setShowIosPrompt(true);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowAndroidPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const closeIosPrompt = () => {
    setShowIosPrompt(false);
    sessionStorage.setItem('iosInstallPromptSeen', 'true');
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Android / Desktop Prompt */}
      {showAndroidPrompt && (
        <div className="fixed bottom-6 left-6 right-6 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-500">
          <div className="bg-zinc-900/95 backdrop-blur-xl border border-red-600/30 rounded-3xl p-6 shadow-2xl flex items-center justify-between gap-4">
             <div className="flex items-center gap-4">
                <div className="bg-red-600 p-3 rounded-2xl text-white">
                   <Download size={24} />
                </div>
                <div>
                   <h4 className="text-white font-black uppercase italic tracking-tight">Instalar App</h4>
                   <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Experiência Elite Full Screen</p>
                </div>
             </div>
             <div className="flex items-center gap-2">
                <button onClick={() => setShowAndroidPrompt(false)} className="p-3 rounded-xl text-zinc-500 hover:text-white"><X size={20}/></button>
                <button onClick={handleInstallClick} className="bg-white text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-200">Instalar</button>
             </div>
          </div>
        </div>
      )}

      {/* iOS Prompt */}
      {showIosPrompt && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] animate-in slide-in-from-bottom-full fade-in duration-700">
           <div className="bg-zinc-900/95 backdrop-blur-xl border-t border-red-600/30 p-8 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
              <div className="flex justify-between items-start mb-6">
                 <div className="flex gap-4">
                    <img src="https://img.icons8.com/color/96/dumbbell.png" className="w-12 h-12" alt="Icon"/>
                    <div>
                       <h4 className="text-white font-black uppercase italic tracking-tight text-lg">Instalar ABFIT Elite</h4>
                       <p className="text-xs text-zinc-400 font-medium">Adicione à tela de início para melhor performance.</p>
                    </div>
                 </div>
                 <button onClick={closeIosPrompt} className="text-zinc-500 hover:text-white"><X size={24}/></button>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-zinc-300 border-t border-white/5 pt-6">
                  <p className="flex items-center gap-2">1. Toque em <Share size={18} className="text-blue-500" /></p>
                  <p className="flex items-center gap-2">2. Selecione <span className="bg-zinc-800 px-2 py-1 rounded-md text-white font-bold text-xs flex items-center gap-1"><PlusSquare size={12}/> Adicionar à Tela de Início</span></p>
              </div>
              
              {/* Pointing arrow for iOS Safari bottom bar */}
              <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-900 rotate-45 border-b border-r border-red-600/30"></div>
           </div>
        </div>
      )}
    </>
  );
}