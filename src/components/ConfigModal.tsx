import React from 'react';
import { X, Settings, Link, Calendar, Palette, Type, ShieldAlert } from 'lucide-react';
import { AppConfig } from '../types';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSave: (config: AppConfig) => void;
}

const colorPresets = [
  { name: 'Sky Blue / Sleek Interface', value: '#2563eb' },
  { name: 'Indigo / Học thuật', value: '#4f46e5' },
  { name: 'Emerald / Sinh thái / Wellness', value: '#059669' },
  { name: 'Amber / Sang trọng / Soft', value: '#d97706' },
  { name: 'Rose / Lãng mạn', value: '#e11d48' },
  { name: 'Slate / Công nghệ / Brutalist', value: '#334155' }
];

export default function ConfigModal({ isOpen, onClose, config, onSave }: ConfigModalProps) {
  const [scriptUrl, setScriptUrl] = React.useState(config.scriptUrl);
  const [eventName, setEventName] = React.useState(config.eventName);
  const [eventDate, setEventDate] = React.useState(config.eventDate);
  const [logoType, setLogoType] = React.useState(config.logoType);
  const [customLogoUrl, setCustomLogoUrl] = React.useState(config.customLogoUrl || '');
  const [themeColor, setThemeColor] = React.useState(config.themeColor);

  React.useEffect(() => {
    setScriptUrl(config.scriptUrl);
    setEventName(config.eventName);
    setEventDate(config.eventDate);
    setLogoType(config.logoType);
    setCustomLogoUrl(config.customLogoUrl || '');
    setThemeColor(config.themeColor);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      scriptUrl: scriptUrl.trim(),
      eventName: eventName.trim() || 'Check-in Sự Kiện',
      eventDate: eventDate.trim() || new Date().toLocaleDateString('vi-VN'),
      logoType,
      customLogoUrl: customLogoUrl.trim() || undefined,
      themeColor
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" id="settings-dialog">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <form 
          onSubmit={handleSave}
          className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-100 flex flex-col max-h-[90vh]"
          id="settings-form"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-400" />
              <h3 className="text-base font-bold text-gray-800">Cấu hình Hệ thống & Giao diện</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
              id="close-settings-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            
            {/* GOOGLE SHEET CONNECTION */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Link className="w-4 h-4 text-indigo-500" /> Kết nối Google Sheet (Apps Script URL)
              </label>
              <input
                type="url"
                value={scriptUrl}
                onChange={(e) => setScriptUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full px-3.5 py-2.5 bg-gray-50/50 hover:bg-gray-50 focus:bg-white text-xs font-mono border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl outline-hidden text-gray-700"
                id="settings-script-url-input"
              />
              <p className="text-[10px] text-gray-400 leading-normal">
                Dán đường dẫn <code className="bg-gray-100/80 px-1 py-0.5 rounded">URL Ứng dụng Web (Web App URL)</code> nhận được sau khi Triển khai đoạn mã Google Apps Script (.gs) của bạn.
              </p>
            </div>

            {/* EVENT DETAILS */}
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Type className="w-4 h-4 text-indigo-500" /> Thông tin sự kiện
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-600">Tên chương trình</span>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="Check-in Hội Nghị / Sự Kiện"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-hidden focus:border-indigo-500 text-gray-800 font-medium"
                    id="settings-event-name-input"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" /> Ngày tổ chức
                  </span>
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder="Hôm nay"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-hidden focus:border-indigo-500 text-gray-800 font-medium"
                    id="settings-event-date-input"
                  />
                </div>
              </div>
            </div>

            {/* LOGO STYLES */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-indigo-500" /> Hình ảnh & Biểu trưng Logo
              </label>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'default', label: 'Cúp/Mặc định' },
                  { value: 'tech', label: 'Tech/Chuyên nghiệp' },
                  { value: 'store', label: 'Cửa hàng/Boutique' },
                  { value: 'custom', label: 'URL Tự chọn' }
                ].map((l) => (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => setLogoType(l.value as any)}
                    className={`px-2 py-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-center items-center gap-1 ${
                      logoType === l.value
                        ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700 font-bold'
                        : 'border-gray-200 hover:border-gray-300 text-gray-500 text-xs font-medium'
                    }`}
                    id={`settings-logo-type-${l.value}`}
                  >
                    <span className="text-[11px] leading-tight">{l.label}</span>
                  </button>
                ))}
              </div>

              {logoType === 'custom' && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-600">Nhập đường dẫn ảnh logo (CDN URL)</span>
                  <input
                    type="url"
                    value={customLogoUrl}
                    onChange={(e) => setCustomLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-3.5 py-2.5 bg-gray-50/50 text-xs border border-gray-200 focus:border-indigo-500 rounded-xl outline-hidden text-gray-700 font-mono"
                    id="settings-custom-logo-url-input"
                  />
                </div>
              )}
            </div>

            {/* CURATED COLOR PRESETS */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-indigo-500" /> Tông màu chủ đạo (Theme)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setThemeColor(preset.value)}
                    className={`px-3 py-2.5 rounded-xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                      themeColor === preset.value
                        ? 'border-gray-900 bg-gray-50 text-gray-900 font-bold'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600 text-xs font-medium'
                    }`}
                    id={`settings-theme-color-${preset.value.replace('#', '')}`}
                  >
                    <span 
                      className="w-4 h-4 rounded-full border border-black/10 shrink-0" 
                      style={{ backgroundColor: preset.value }}
                    />
                    <span className="text-xs">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/50 border border-rose-100 rounded-xl text-xs text-rose-900 flex gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-950">Bảo mật thông tin cục bộ</p>
                <p className="mt-0.5 text-rose-800">
                  Các thông tin cài đặt và lịch sử check-in này được lưu an toàn trực tiếp trên trình duyệt của riêng bạn (qua LocalStorage), không đi qua bất kỳ máy chủ trung gian nào ngoài Google Sheets của chính bạn.
                </p>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 font-semibold text-xs rounded-xl cursor-pointer transition-colors"
              id="cancel-settings-btn"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 hover:brightness-110 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer transition-all"
              style={{ backgroundColor: themeColor }}
              id="save-settings-btn"
            >
              Lưu cấu hình
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
