import React from 'react';
import { 
  History, Search, RefreshCw, Trash2, Download, Check, CloudAlert, CloudOff, CloudLightning 
} from 'lucide-react';
import { CheckInRecord } from '../types';

interface CheckInHistoryProps {
  records: CheckInRecord[];
  onClearHistory: () => void;
  onSyncRecord: (record: CheckInRecord) => Promise<void>;
  isLoading: boolean;
  themeColor: string;
}

export default function CheckInHistory({ 
  records, 
  onClearHistory, 
  onSyncRecord, 
  isLoading, 
  themeColor 
}: CheckInHistoryProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [syncingId, setSyncingId] = React.useState<string | null>(null);

  const filteredRecords = React.useMemo(() => {
    if (!searchTerm.trim()) return records;
    const term = searchTerm.toLowerCase();
    return records.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.phone.includes(term) ||
        r.email.toLowerCase().includes(term)
    );
  }, [records, searchTerm]);

  const handleSyncClick = async (record: CheckInRecord) => {
    if (isLoading || syncingId) return;
    setSyncingId(record.id);
    try {
      await onSyncRecord(record);
    } finally {
      setSyncingId(null);
    }
  };

  const handleExportCSV = () => {
    if (records.length === 0) return;
    
    // CSV Header with BOM for correct Vietnamese encoding in Excel
    const headers = ['Mã tham chiếu', 'Họ và tên', 'Số điện thoại', 'Email', 'Thời gian', 'Trạng thái đồng bộ'];
    const rows = records.map((r) => [
      r.id,
      r.name,
      r.phone,
      r.email,
      new Date(r.timestamp).toLocaleString('vi-VN'),
      r.synced ? 'Đã đồng bộ' : 'Chưa đồng bộ'
    ]);
    
    const csvContent = 
      '\uFEFF' // UTF-8 BOM
      + [headers.join(','), ...rows.map((row) => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
      
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `danh_sach_checkin_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-5 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl text-white" style={{ backgroundColor: themeColor }}>
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Danh sách đã check-in</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Đã ghi nhận <b className="text-gray-700 font-semibold">{records.length}</b> lượt check-in thành công
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {records.length > 0 && (
            <>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                title="Xuất file Excel/CSV"
                id="export-csv-btn"
              >
                <Download className="w-4 h-4" />
                <span>Xuất Excel</span>
              </button>
              
              <button
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử check-in nội bộ? Việc này không ảnh hưởng đến dữ liệu trên Google Sheets.')) {
                    onClearHistory();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-50/50 hover:bg-rose-50 text-rose-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                title="Xóa lịch sử cục bộ"
                id="clear-history-btn"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa hết</span>
              </button>
            </>
          )}
        </div>
      </div>

      {records.length > 0 && (
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tên, SĐT hoặc email..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50/50 hover:bg-gray-50 focus:bg-white text-gray-800 border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-xs transition-all outline-hidden font-medium"
            id="history-search-input"
          />
        </div>
      )}

      {/* DANH SÁCH BẢNG */}
      <div className="overflow-x-auto border border-gray-100 rounded-xl">
        {filteredRecords.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <History className="w-12 h-12 text-gray-200 stroke-[1.5] mb-3" />
            <p className="text-gray-400 text-sm font-medium">Chưa có lượt check-in nào được ghi nhận</p>
            <p className="text-gray-300 text-xs mt-0.5">Vui lòng điền form check-in ở trên để thêm lượt đầu tiên</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs text-gray-500 font-semibold tracking-wider">
                <th className="px-4 py-3">Khách mời</th>
                <th className="px-4 py-3">Thông tin liên hệ</th>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3 text-center">Đồng bộ Sheets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-gray-800 text-sm leading-tight">{r.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{r.id}</p>
                  </td>
                  <td className="px-4 py-3.5 space-y-0.5">
                    <p className="text-[13px] text-gray-600 font-medium font-mono">{r.phone}</p>
                    <p className="text-xs text-gray-400 font-medium">{r.email}</p>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">
                    {new Date(r.timestamp).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                    <span className="block text-[10px] text-gray-400 mt-0.5">
                      {new Date(r.timestamp).toLocaleDateString('vi-VN')}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {r.synced ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã đồng bộ</span>
                      </span>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 justify-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold">
                          <CloudOff className="w-3 h-3" />
                          <span>Chưa gửi</span>
                        </span>
                        <button
                          onClick={() => handleSyncClick(r)}
                          disabled={isLoading || syncingId === r.id}
                          className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-all border border-indigo-200/50 disabled:opacity-50 cursor-pointer"
                          id={`sync-btn-${r.id}`}
                        >
                          {syncingId === r.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin text-indigo-600" />
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}
                          <span>Gửi lại</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
