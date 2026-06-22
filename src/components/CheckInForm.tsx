import React from 'react';
import { User, Phone, Mail, CheckCircle, AlertTriangle, ArrowRight, Loader } from 'lucide-react';
import { CheckInRecord } from '../types';

interface CheckInFormProps {
  onSubmit: (data: { name: string; phone: string; email: string }) => Promise<void>;
  isLoading: boolean;
  themeColor: string;
  hasScriptUrl: boolean;
  onOpenSettings: () => void;
}

export default function CheckInForm({ onSubmit, isLoading, themeColor, hasScriptUrl, onOpenSettings }: CheckInFormProps) {
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  
  const [errors, setErrors] = React.useState<{ name?: string; phone?: string; email?: string }>({});

  const validate = (): boolean => {
    const newErrors: { name?: string; phone?: string; email?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Vui lòng điền họ và tên';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Họ và tên phải dài từ 2 ký tự trở lên';
    }

    // Vietnam phone regex: starts with 0 or +84, followed by 9 digits
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phone.trim()) {
      newErrors.phone = 'Vui lòng điền số điện thoại';
    } else if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ (ví dụ: 0987654321)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Vui lòng điền địa chỉ email';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Địa chỉ email không đúng định dạng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ name, phone, email }).then(() => {
        // Clear form fields on successful submit
        setName('');
        setPhone('');
        setEmail('');
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10 max-w-lg w-full mx-auto relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: themeColor }} />
      
      {!hasScriptUrl && (
        <div className="mb-6 p-4.5 bg-amber-50/80 border border-amber-100 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <p className="font-semibold text-amber-950">Chưa cấu hình Google Sheets URL</p>
            <p className="mt-0.5">
              Dữ liệu của bạn sẽ chỉ được lưu tạm thời vào Lịch sử. Nhấp để{' '}
              <button
                type="button"
                onClick={onOpenSettings}
                className="font-bold underline hover:text-amber-700 cursor-pointer"
                id="link-script-warning"
              >
                Cài đặt Google Apps Script URL
              </button>{' '}
              để ghi dữ liệu trực tiếp vào Google Trang tính.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" id="checkin-form">
        {/* HỌ VÀ TÊN */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1" htmlFor="fullname-input">
            Họ và tên <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4.5 pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </span>
            <input
              id="fullname-input"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              placeholder="Nguyễn Văn A"
              className={`w-full pl-11 pr-5 py-4 bg-slate-50 border rounded-xl text-sm transition-all outline-hidden text-slate-700 placeholder:text-slate-300 ${
                errors.name
                  ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
              }`}
              disabled={isLoading}
              style={{
                borderColor: !errors.name && name ? themeColor : undefined,
                boxShadow: !errors.name && name ? `0 0 0 3px ${themeColor}15` : undefined,
              }}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-0.5 ml-1" id="fullname-error">
              {errors.name}
            </p>
          )}
        </div>

        {/* SỐ ĐIỆN THOẠI */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1" htmlFor="phone-input">
            Số điện thoại <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4.5 pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </span>
            <input
              id="phone-input"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors({ ...errors, phone: undefined });
              }}
              placeholder="0901 234 567"
              className={`w-full pl-11 pr-5 py-4 bg-slate-50 border rounded-xl text-sm transition-all outline-hidden text-slate-700 placeholder:text-slate-300 ${
                errors.phone
                  ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
              }`}
              disabled={isLoading}
              style={{
                borderColor: !errors.phone && phone ? themeColor : undefined,
                boxShadow: !errors.phone && phone ? `0 0 0 3px ${themeColor}15` : undefined,
              }}
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-0.5 ml-1" id="phone-error">
              {errors.phone}
            </p>
          )}
        </div>

        {/* EMAIL */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1" htmlFor="email-input">
            Địa chỉ Email <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4.5 pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </span>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              placeholder="nguyenvana@gmail.com"
              className={`w-full pl-11 pr-5 py-4 bg-slate-50 border rounded-xl text-sm transition-all outline-hidden text-slate-700 placeholder:text-slate-300 ${
                errors.email
                  ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
              }`}
              disabled={isLoading}
              style={{
                borderColor: !errors.email && email ? themeColor : undefined,
                boxShadow: !errors.email && email ? `0 0 0 3px ${themeColor}15` : undefined,
              }}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-0.5 ml-1" id="email-error">
              {errors.email}
            </p>
          )}
        </div>

        {/* NÚT GỬI THÔNG TIN */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full relative px-6 py-4 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-lg active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none overflow-hidden flex items-center justify-center gap-2 group focus:outline-hidden"
            style={{ 
              backgroundColor: themeColor,
              boxShadow: `${themeColor}2c 0rem 0.625rem 1.25rem -0.1875rem`
            }}
            id="submit-checkin-btn"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Đang xử lý check-in...</span>
              </>
            ) : (
              <>
                <span>XÁC NHẬN GỬI THÔNG TIN</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
