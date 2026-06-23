import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, Users, CheckSquare, PlusCircle, CheckCircle, Wifi, WifiOff, FileSpreadsheet, Sparkles, Calendar, CalendarDays, CodeXml 
} from 'lucide-react';

import { CheckInRecord, AppConfig } from './types';
import LogoSelector from './components/LogoSelector';
import CheckInForm from './components/CheckInForm';
import CheckInHistory from './components/CheckInHistory';
import ConfigModal from './components/ConfigModal';
import AppsScriptGuide from './components/AppsScriptGuide';

const STORAGE_RECORDS_KEY = 'gs_checkin_records_v1';
const STORAGE_CONFIG_KEY = 'gs_checkin_config_v1';

const DEFAULT_CONFIG: AppConfig = {
  scriptUrl: 'https://script.google.com/macros/s/AKfycbwvxpQndJNUoYjMBtOR-rx4ZsSlM_iP1aHHSSUJq0aUXUdd6tvoLySrpnMJTNfeX6La/exec',
  eventName: 'ĐÀO TẠO CHUYÊN SÂU - KỸ NĂNG TELESALE',
  eventDate: '24 tháng 6 năm 2026',
  logoType: 'custom',
  customLogoUrl: 'https://i.postimg.cc/90XZ40Sk/logo-nna.png',
  themeColor: '#2563eb',
};

const APPS_SCRIPT_CODE = `/**
 * Google Apps Script - Web App xử lý lưu trữ Check-in từ Form vào Google Sheet.
 * Hướng dẫn deploy chi tiết có sẵn ngay trong ứng dụng Form.
 */

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    
    // Tự động tạo dòng tiêu đề nếu trang tính mới trống rỗng
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Thời gian ghi nhận",
        "Mã Check-in",
        "Họ và tên",
        "Số điện thoại",
        "Email",
        "Trạng thái đồng bộ"
      ]);
      sheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#f8fafc");
    }
    
    var name = "";
    var phone = "";
    var email = "";
    var id = "CK-" + Math.floor(1000 + Math.random() * 9000);
    
    // Đọc dữ liệu từ form gửi lên
    if (e && e.postData && e.postData.contents) {
      var data = JSON.parse(e.postData.contents);
      name = data.name || "";
      phone = data.phone || "";
      email = data.email || "";
      id = data.id || id;
    } else if (e && e.parameter) {
      name = e.parameter.name || "";
      phone = e.parameter.phone || "";
      email = e.parameter.email || "";
      id = e.parameter.id || id;
    }
    
    // Ghi dữ liệu vào trang tính, định dạng cột phone dạng TEXT có dấu nháy lửng để tránh Excel xoá số 0 đầu
    sheet.appendRow([
      new Date(),
      id,
      name,
      "'" + phone,
      email,
      "Thành công"
    ]);
    
    // Trả kết quả thành công và cấu hình CORS
    return ContentService.createTextOutput(JSON.stringify({
      "status": "success",
      "message": "Check-in thành công!",
      "id": id
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error",
      "message": err.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
    });
  }
}

function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
}

function doGet(e) {
  return ContentService.createTextOutput("Google Sheets Web App hoạt động bình thường! Sẵn sàng nhận dữ liệu check-in.")
    .setMimeType(ContentService.MimeType.TEXT);
}`;

export default function App() {
  const [records, setRecords] = React.useState<CheckInRecord[]>([]);
  const [config, setConfig] = React.useState<AppConfig>(DEFAULT_CONFIG);
  const [isConfigOpen, setIsConfigOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab2] = React.useState<'form' | 'history'>('form');
  const [successRecord, setSuccessRecord] = React.useState<CheckInRecord | null>(null);
  const [isAdminMode, setIsAdminMode] = React.useState(false);

  // Load config & records on mount
  React.useEffect(() => {
    try {
      const storedRecords = localStorage.getItem(STORAGE_RECORDS_KEY);
      if (storedRecords) {
        setRecords(JSON.parse(storedRecords));
      }

      const storedConfig = localStorage.getItem(STORAGE_CONFIG_KEY);
      if (storedConfig) {
        const parsed = JSON.parse(storedConfig);
        if (parsed.eventName === 'Đại Hội Công Nghệ & Trí Tuệ Nhân Tạo 2026' || parsed.eventName === 'ĐÀO TẠO CHUYÊN SÂU') {
          parsed.eventName = 'ĐÀO TẠO CHUYÊN SÂU - KỸ NĂNG TELESALE';
        }
        if (parsed.eventDate === '22 tháng 6, 2026') {
          parsed.eventDate = '24 tháng 6 năm 2026';
        }
        // Always enforce the custom logo
        parsed.logoType = 'custom';
        parsed.customLogoUrl = 'https://i.postimg.cc/90XZ40Sk/logo-nna.png';
        setConfig(parsed);
      }
    } catch (e) {
      console.error('Lỗi khi tải dữ liệu từ localStorage', e);
    }
  }, []);

  // Sync to Sheets handler
  const sendToGoogleSheets = async (record: CheckInRecord, url: string): Promise<boolean> => {
    if (!url) return false;
    
    try {
      // We send simple JSON POST.
      // To strictly avoid CORS issues which block redirect payload inspections,
      // we use mode: 'no-cors'. This fires the request successfully to the Google Apps Script CDN, 
      // where it executes immediately. The response will be opaque.
      const payload = {
        id: record.id,
        name: record.name,
        phone: record.phone,
        email: record.email,
        timestamp: record.timestamp
      };

      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      // Since no-cors hides response, we assume successful write once request completes without throwing.
      return true;
    } catch (error) {
      console.warn('Cảnh báo mạng khi gửi tới Apps Script:', error);
      return false;
    }
  };

  // Submit check-in logic
  const handleCheckInSubmit = async (formData: { name: string; phone: string; email: string }) => {
    setLoading(true);
    
    // Generate unique registration ID/Code
    const id = `CK-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toISOString();
    
    const newRecord: CheckInRecord = {
      id,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      timestamp,
      synced: false
    };

    let syncResult = false;
    if (config.scriptUrl) {
      syncResult = await sendToGoogleSheets(newRecord, config.scriptUrl);
    }

    const finalizedRecord = { ...newRecord, synced: syncResult };

    // Append to local records and save
    const updatedRecords = [finalizedRecord, ...records];
    setRecords(updatedRecords);
    localStorage.setItem(STORAGE_RECORDS_KEY, JSON.stringify(updatedRecords));

    // Show beautiful success boarding pass
    setSuccessRecord(finalizedRecord);
    setLoading(false);
  };

  // Manual retry sync logic from History
  const handleSyncRecord = async (record: CheckInRecord) => {
    if (!config.scriptUrl) {
      alert('Vui lòng cài đặt Google Apps Script URL trước khi thực hiện đồng bộ lại!');
      setIsConfigOpen(true);
      return;
    }

    const success = await sendToGoogleSheets(record, config.scriptUrl);
    if (success) {
      const updated = records.map((r) => r.id === record.id ? { ...r, synced: true } : r);
      setRecords(updated);
      localStorage.setItem(STORAGE_RECORDS_KEY, JSON.stringify(updated));
    } else {
      alert('Không thể đồng bộ. Vui lòng kiểm tra lại đường dẫn Apps Script hoặc kết nối mạng!');
    }
  };

  const handleConfigSave = (newConfig: AppConfig) => {
    setConfig(newConfig);
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(newConfig));
  };

  const handleClearHistory = () => {
    setRecords([]);
    localStorage.setItem(STORAGE_RECORDS_KEY, JSON.stringify([]));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-16 relative">
      
      {/* Decorative colored grid underlay */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-linear-to-b from-indigo-50/70 to-transparent pointer-events-none -z-10" />

      {/* HEADER BAR */}
      {isAdminMode && (
        <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-40 transition-shadow">
          <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="p-1.5 rounded-lg text-white"
                style={{ backgroundColor: config.themeColor }}
              >
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <span className="font-display font-bold text-sm tracking-tight text-gray-800">
                G-Sheets Checkin Portal
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Sync status indicator */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-full text-xs font-semibold text-gray-500">
                {config.scriptUrl ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                    <span>Kênh gỡ lỗi .gs: Sẵn sàng</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                    <span>Chế độ kiểm thử (Offline)</span>
                  </>
                )}
              </div>

              <button
                onClick={() => setIsConfigOpen(true)}
                className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-50 border border-gray-100 rounded-xl transition-all cursor-pointer relative"
                title="Cài đặt hệ thống"
                id="header-settings-btn"
              >
                <Settings className="w-4 h-4" />
                {!config.scriptUrl && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white animate-ping" />
                )}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* CONTENT PORTAL CONTAINER */}
      <main className="max-w-3xl mx-auto px-4 pt-8 space-y-8">
        
        {/* EVENT PRESENTATION HERO CARD */}
        <div 
          className="text-center space-y-2.5 max-w-xl mx-auto select-none cursor-default"
          onDoubleClick={() => setIsAdminMode(prev => !prev)}
        >
          <LogoSelector 
            type={config.logoType} 
            customUrl={config.customLogoUrl} 
            className="mb-1"
          />
          
          <div className="space-y-1">
            {isAdminMode && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 border border-indigo-100/40 text-indigo-700 text-xs font-semibold rounded-full select-none shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 fill-indigo-200" />
                <span>Hệ Thống Check-in Sự Kiện</span>
              </span>
            )}
            <h1 className="font-display font-extrabold text-2xl md:text-3xl text-gray-900 tracking-tight leading-snug">
              {config.eventName}
            </h1>
            <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5 font-medium">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>{config.eventDate}</span>
            </p>
          </div>
        </div>

        {/* TABS SELECTOR */}
        {isAdminMode && (
          <div className="flex bg-white/80 p-1 border border-gray-100 rounded-2xl max-w-sm mx-auto shadow-xs">
            <button
              onClick={() => {
                setSuccessRecord(null);
                setActiveTab2('form');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'form' && !successRecord
                  ? 'bg-white shadow-sm font-extrabold text-slate-800 border-b border-gray-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              id="tab-form-btn"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Form Điền thông tin</span>
            </button>
            <button
              onClick={() => {
                setSuccessRecord(null);
                setActiveTab2('history');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'history' || successRecord
                  ? 'bg-white shadow-sm font-extrabold text-slate-800 border-b border-gray-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              id="tab-history-btn"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Lịch sử ({records.length})</span>
            </button>
          </div>
        )}

        {/* CORE VIEWS */}
        <div className="relative">
          <AnimatePresence mode="wait">
            
            {/* SUCCESS BOARDING PASS STATE */}
            {successRecord ? (
              <motion.div
                key="success-receipt"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="max-w-md mx-auto"
              >
                <div className="bg-white rounded-2xl border border-emerald-100 shadow-xl overflow-hidden relative">
                  
                  {/* Confetti-like ambient green banner */}
                  <div className="bg-emerald-500 text-white p-6 text-center space-y-1.5 relative">
                    <div className="absolute inset-0 bg-radial from-white/10 to-transparent opacity-30 pointer-events-none" />
                    <div className="inline-flex p-2 bg-white/20 rounded-full animate-bounce">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="font-display font-bold text-lg md:text-xl tracking-tight">Check-in thành công!</h2>
                    <p className="text-xs text-emerald-100 font-medium">Thông tin của bạn đã được ghi nhận</p>
                  </div>

                  {/* Boarding pass layout */}
                  <div className="p-6 md:p-8 space-y-6 relative">
                    
                    {/* Event name & details */}
                    <div className="border-b border-dashed border-gray-200 pb-4 text-center">
                      <p className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">Boarding Pass</p>
                      <h3 className="font-display font-extrabold text-slate-800 text-sm mt-0.5 line-clamp-1">
                        {config.eventName}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">{config.eventDate}</p>
                    </div>

                    {/* Guest details */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-semibold text-gray-400 block uppercase tracking-wider">Họ và tên</span>
                          <span className="text-sm font-bold text-gray-800 block line-clamp-1">{successRecord.name}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-semibold text-gray-400 block uppercase tracking-wider">Mã Check-in</span>
                          <span className="text-sm font-mono font-bold text-indigo-700 block" style={{ color: config.themeColor }}>
                            {successRecord.id}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-semibold text-gray-400 block uppercase tracking-wider">Số điện thoại</span>
                          <span className="text-sm font-medium font-mono text-gray-700 block">{successRecord.phone}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-semibold text-gray-400 block uppercase tracking-wider">Địa chỉ Email</span>
                          <span className="text-sm font-medium text-gray-700 block truncate" title={successRecord.email}>
                            {successRecord.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Barcode representation */}
                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center space-y-1.5">
                      <div className="flex items-center justify-between gap-1 w-full max-w-[200px] h-8 opacity-75">
                        {Array.from({ length: 28 }).map((_, i) => (
                          <div 
                            key={i} 
                            className="bg-black rounded-xs h-full" 
                            style={{ 
                              width: i % 3 === 0 ? '3px' : i % 5 === 0 ? '1px' : '2px',
                              opacity: i % 7 === 0 ? 0.3 : 1
                            }} 
                          />
                        ))}
                      </div>
                      <span className="text-[9px] font-mono tracking-[4px] text-gray-500 font-semibold uppercase">
                        {successRecord.id}
                      </span>
                    </div>

                    {/* Connection result notice */}
                    <div className="text-center text-xs">
                      {successRecord.synced ? (
                        <p className="text-emerald-700 font-semibold flex items-center justify-center gap-1 bg-emerald-50 py-2 rounded-lg">
                          <CheckCircle className="w-3.5 h-3.5" /> Mời anh/chị di chuyển lên phòng đào tạo tầng 2!
                        </p>
                      ) : (
                        <p className="text-amber-700 font-semibold flex items-center justify-center gap-1 bg-amber-50 py-2 rounded-lg">
                          <WifiOff className="w-3.5 h-3.5" /> Đã lưu tạm bộ nhớ (Cần đồng bộ)
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => {
                          setSuccessRecord(null);
                          setActiveTab2('form');
                        }}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl cursor-pointer transition-colors shadow-md hover:shadow-lg active:scale-[0.98]"
                        id="next-checkin-btn"
                      >
                        Check-in lượt tiếp theo
                      </button>
                      {isAdminMode && (
                        <button
                          onClick={() => {
                            setSuccessRecord(null);
                            setActiveTab2('history');
                          }}
                          className="px-4 py-3 border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold text-xs rounded-xl cursor-pointer transition-colors"
                          id="view-historic-from-success-btn"
                        >
                          Xem Lịch Sử
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'form' ? (
              <motion.div
                key="form-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <CheckInForm
                  onSubmit={handleCheckInSubmit}
                  isLoading={loading}
                  themeColor={config.themeColor}
                  hasScriptUrl={!!config.scriptUrl}
                  onOpenSettings={() => setIsConfigOpen(true)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="history-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <CheckInHistory
                  records={records}
                  onClearHistory={handleClearHistory}
                  onSyncRecord={handleSyncRecord}
                  isLoading={loading}
                  themeColor={config.themeColor}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* GOOGLE SHEET / APPS SCRIPT HOW-TO GUIDE - ALIGNED AT BOTTOM */}
        {isAdminMode && <AppsScriptGuide sheetWebhookExampleCode={APPS_SCRIPT_CODE} />}

      </main>

      {/* FOOTER */}
      {isAdminMode && (
        <footer className="text-center text-[11px] text-gray-400 pt-16 pb-4 select-none">
          <p className="font-semibold flex items-center justify-center gap-1 font-display">
            <CodeXml className="w-3.5 h-3.5 text-indigo-500" />
            <span>Biên soạn bởi Google AI Studio • Tích hợp Google Sheets</span>
          </p>
        </footer>
      )}

      {/* Subtle Admin Mode Floating Trigger - Completely Hidden */}

      {/* SETTINGS DIALOG POPUP */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={config}
        onSave={handleConfigSave}
      />

    </div>
  );
}
