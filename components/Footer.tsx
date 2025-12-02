'use client';

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/40 backdrop-blur-sm py-8 text-center">
      <div className="flex justify-center items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-electric-cyan rounded-full animate-pulse" />
        <span className="text-gray-500 text-sm font-mono">SYSTEM ONLINE</span>
      </div>
      <p className="text-gray-600 text-sm">
        &copy; {new Date().getFullYear()} Larry. Engineered for the Future.
      </p>
    </footer>
  );
}
