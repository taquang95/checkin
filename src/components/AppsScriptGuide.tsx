import React from 'react';
import { Copy, Check, FileCode, CheckSquare, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

interface AppsScriptGuideProps {
  sheetWebhookExampleCode: string;
}

export default function AppsScriptGuide({ sheetWebhookExampleCode }: AppsScriptGuideProps) {
  const [copied, setCopied] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sheetWebhookExampleCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Không thể sao chép văn bản: ', err);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden mt-6 transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between bg-gray-50/50 hover:bg-gray-50 transition-colors text-left"
        id="toggle-guide-btn"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm md:text-base">Hướng dẫn liên kết Google Sheets (Apps Script)</h3>
            <p className="text-xs text-gray-500 mt-0.5">Lưu thông tin Check-in gửi tự động vào Trang tính của bạn</p>
          </div>
        </div>
        <div>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 border-t border-gray-100 bg-white space-y-6">
          {/* CÁC BƯỚC THỰC HIỆN */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2 mb-3">
              <CheckSquare className="w-4 h-4 text-emerald-500" /> Các bước thiết lập Google Sheets
            </h4>
            
            <ol className="relative border-l border-gray-100 pl-4 space-y-4 text-sm text-gray-600">
              <li className="relative">
                <span className="absolute -left-[24px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-700">
                  1
                </span>
                <p className="font-medium text-gray-800">Tạo Trang tính mới</p>
                <p className="text-xs text-gray-500 mt-0.5">Truy cập <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-medium">sheets.new</a> để mở một trang tính mới. Đặt tiêu đề (ví dụ: <code className="bg-gray-100 px-1 py-0.5 rounded text-rose-600">"Danh Sách Check-in"</code>).</p>
              </li>
              
              <li className="relative">
                <span className="absolute -left-[24px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-700">
                  2
                </span>
                <p className="font-medium text-gray-800">Mở Trình biên tập Tập lệnh (Apps Script)</p>
                <p className="text-xs text-gray-500 mt-0.5">Từ thanh Menu chọn <b className="text-gray-700">Tiện ích mở rộng</b> (Extensions) &rarr; <b className="text-gray-700">Apps Script</b>.</p>
              </li>

              <li className="relative">
                <span className="absolute -left-[24px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-700">
                  3
                </span>
                <p className="font-medium text-gray-800">Dán Mã code xử lý và lưu</p>
                <p className="text-xs text-gray-500 mt-0.5">Xóa sạch các dòng mặc định hoặc hàm <code className="bg-gray-100 px-1 py-0.5 rounded text-rose-600">myFunction()</code> và dán toàn bộ mã nguồn bên dưới vào file <code className="bg-gray-100 px-1 py-0.5 rounded">Mã.gs</code>. Nhấp biểu tượng đĩa mềm hoặc bấm nút Lưu.</p>
              </li>

              <li className="relative">
                <span className="absolute -left-[24px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-700">
                  4
                </span>
                <p className="font-medium text-gray-800">Triển khai dự án Web App</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Nhấp vào nút <b className="text-gray-700">Triển khai</b> (Deploy) ở góc trên bên phải &rarr; chọn <b className="text-gray-700">Cấu hình triển khai mới</b> (New deployment).
                </p>
              </li>

              <li className="relative">
                <span className="absolute -left-[24px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-700">
                  5
                </span>
                <p className="font-medium text-gray-800">Thay đổi Loại loại triển khai thành Web App</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Nhấp biểu tượng răng cưa &rarr; chọn <b className="text-indigo-600">Ứng dụng web</b> (Web app). 
                  Thiết lập chính xác:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-xs text-gray-500">
                  <li><b className="text-gray-600">Mô tả:</b> <span className="italic">Lấy dữ liệu check-in</span></li>
                  <li><b className="text-gray-600">Thực thi dưới tên:</b> <span className="font-semibold text-gray-700">Tôi (tài khoản email của bạn)</span></li>
                  <li><b className="text-gray-600">Ai có quyền truy cập:</b> <span className="font-semibold text-rose-600">Mọi người (Anyone)</span> <span className="text-gray-400 font-normal">*(Cực kỳ quan trọng để form hoạt động)</span></li>
                </ul>
              </li>

              <li className="relative">
                <span className="absolute -left-[24px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-700">
                  6
                </span>
                <p className="font-medium text-gray-800">Uỷ quyền truy cập và sao chép Web App URL</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Chọn <b className="text-gray-700">Triển khai</b>. Nhấp <b className="text-indigo-600">Cấp quyền truy cập</b> (Authorize access) khi được hỏi, chọn email của bạn, nhấp vào <b className="text-gray-700">Nâng cao</b> (Advanced) ở dưới, nhấp <b className="text-amber-600">Đi tới Google-Sheets-Checkin (unsafe)</b> và chọn <b className="text-gray-700">Cho phép</b> (Allow).
                  Sau đó sao chép đoạn <b className="text-emerald-700">URL Ứng dụng Web</b> xuất hiện.
                </p>
              </li>
            </ol>
          </div>

          {/* CODE SNIPPET */}
          <div className="space-y-2 border border-gray-100 rounded-xl overflow-hidden bg-slate-900 shadow-inner">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 text-slate-300 border-b border-slate-700 text-xs">
              <span className="flex items-center gap-1.5 font-mono text-slate-400">
                <FileCode className="w-3.5 h-3.5 text-yellow-500" /> Code.gs
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 hover:text-white bg-slate-700 hover:bg-slate-600 transition-colors px-2.5 py-1 rounded-md"
                id="copy-script-btn"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="p-4 overflow-x-auto text-[11px] font-mono text-teal-400 max-h-[300px] leading-relaxed">
              <pre className="text-left select-all whitespace-pre">{sheetWebhookExampleCode}</pre>
            </div>
          </div>

          <div className="flex gap-2.5 items-start p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-indigo-950">Mẹo thông minh: Đồng bộ an toàn</p>
              <p className="mt-0.5 text-indigo-800">
                Ứng dụng web này sử dụng bộ lưu trữ nội bộ cực kỳ an toàn. Kể cả khi bạn chưa cài cấu hình Google Sheets URL, bạn vẫn có thể nộp thử và xem trước lịch sử check-in ở tab "Lịch Sử Check-in"! Bạn có thể đồng bộ các dữ liệu này lên sheet sau khi hoàn tất gắn liên kết.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
