'use client';

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/40 backdrop-blur-sm py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-gray-500 text-sm font-mono">SYSTEM ONLINE</span>
          </div>
          <div className="flex items-center gap-6 text-xs font-mono text-gray-600">
            <span>BUILD: stable</span>
            <span>DEPLOY: active</span>
            <span>REGION: NYC</span>
          </div>
          <p className="text-gray-600 text-sm font-mono">
            &copy; {new Date().getFullYear()} Larry. Engineered for production.
          </p>
        </div>
      </div>
    </footer>
  );
}
