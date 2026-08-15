import { signInWithGoogle } from './AuthProvider';
import { Activity, Code, GitMerge, Database, Zap } from 'lucide-react';

export function LoginPage() {
  return (
    <div className="relative flex h-screen w-screen items-center justify-center bg-[#0d0f13] overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,transparent_0%,#0d0f13_80%)]" />
      </div>

      {/* Floating Icons Background */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none overflow-hidden">
         <Code className="absolute top-[15%] left-[20%] w-16 h-16 animate-pulse" />
         <GitMerge className="absolute top-[60%] left-[10%] w-24 h-24 text-blue-500" />
         <Database className="absolute top-[20%] right-[15%] w-20 h-20 text-purple-500" />
         <Zap className="absolute bottom-[20%] right-[25%] w-16 h-16 text-yellow-500" />
         <Activity className="absolute bottom-[10%] left-[40%] w-12 h-12 text-green-500" />
      </div>

      <div className="z-10 flex flex-col items-center animate-slide-in p-10 bg-gray-900/60 backdrop-blur-xl rounded-3xl border border-gray-800 shadow-2xl max-w-md w-full">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-3xl text-white shadow-lg mb-6">
          P
        </div>
        <h1 className="text-4xl font-bold mb-3 tracking-tight text-white">Pluto</h1>
        <p className="text-gray-400 mb-10 font-light text-center">
          The next-generation visual Python editor for data science and AI.
        </p>
        
        <button 
          onClick={signInWithGoogle}
          className="group relative flex items-center justify-center w-full gap-4 bg-white text-gray-900 px-6 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:-translate-y-0.5"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="text-lg">Continue with Google</span>
        </button>
        
        <p className="mt-8 text-xs text-gray-500 text-center max-w-xs">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
