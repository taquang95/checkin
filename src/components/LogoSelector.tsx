import React from 'react';
import { Layers, Store, Trophy, Image as ImageIcon } from 'lucide-react';

interface LogoSelectorProps {
  type: 'default' | 'tech' | 'store' | 'custom';
  customUrl?: string;
  className?: string;
}

export default function LogoSelector({ type, customUrl, className = '' }: LogoSelectorProps) {
  const [imageError, setImageError] = React.useState(false);

  // Reset error state if custom URL changes
  React.useEffect(() => {
    setImageError(false);
  }, [customUrl]);

  if (type === 'custom' && customUrl && !imageError) {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div className="relative max-w-[280px] flex items-center justify-center">
          <img
            src={customUrl}
            alt="Logo"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="max-h-24 md:max-h-28 w-auto object-contain transition-all duration-300"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center bg-linear-to-tr shadow-md p-1">
        {type === 'tech' ? (
          <div className="w-full h-full rounded-xl bg-slate-900 border border-slate-700/50 flex items-center justify-center text-teal-400 group relative overflow-hidden">
            <div className="absolute inset-0 bg-radial from-teal-500/10 to-transparent opacity-50" />
            <Layers className="relative w-10 h-10 animate-pulse" />
          </div>
        ) : type === 'store' ? (
          <div className="w-full h-full rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Store className="w-10 h-10" />
          </div>
        ) : type === 'custom' && imageError ? (
          <div className="w-full h-full rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
            <div className="flex flex-col items-center gap-1">
              <ImageIcon className="w-8 h-8" />
              <span className="text-[10px] font-medium text-rose-600 select-none">Lỗi ảnh</span>
            </div>
          </div>
        ) : (
          <div className="w-full h-full rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Trophy className="w-10 h-10" />
          </div>
        )}
      </div>
    </div>
  );
}
