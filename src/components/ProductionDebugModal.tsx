import React, { useState, useEffect } from 'react';
import {
  X,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Send,
  Copy,
  Download,
  Trash2,
  Database,
  Mail,
  Server,
  Key,
  ShieldCheck,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { debugLogger, DebugLogEntry } from '../services/debugLogger';
import {
  getSupabaseConfigInfo,
  checkSupabaseConnection,
  setCustomSupabaseConfig,
  clearCustomSupabaseConfig,
} from '../lib/supabase';

interface ProductionDebugModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductionDebugModal: React.FC<ProductionDebugModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'health' | 'logs' | 'guide'>('health');
  const [logs, setLogs] = useState<DebugLogEntry[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [copiedLogs, setCopiedLogs] = useState(false);

  // Health check state
  const [healthData, setHealthData] = useState<any>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [testEmail, setTestEmail] = useState('mkt.thecliffresort@gmail.com');
  const [isSendingTestMail, setIsSendingTestMail] = useState(false);
  const [testMailResult, setTestMailResult] = useState<{ success: boolean; message: string } | null>(null);

  // Supabase test state
  const [supabaseTest, setSupabaseTest] = useState<{ connected: boolean; message: string; latencyMs?: number } | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);

  // Manual fallback inputs
  const [customUrl, setCustomUrl] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [showManualDbInputs, setShowManualDbInputs] = useState(false);
  const [manualSaveSuccess, setManualSaveSuccess] = useState(false);

  const currentSbInfo = getSupabaseConfigInfo();

  useEffect(() => {
    if (!isOpen) return;
    // Subscribe to logs
    const unsubscribe = debugLogger.subscribe((newLogs) => {
      setLogs(newLogs);
    });

    // Run health check
    runHealthCheck();
    runSupabaseCheck();

    return () => unsubscribe();
  }, [isOpen]);

  const runHealthCheck = async () => {
    setIsLoadingHealth(true);
    setTestMailResult(null);
    try {
      const res = await fetch('/api/debug/system-health');
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
        debugLogger.success('SYSTEM', 'Kiểm tra trạng thái hệ thống thành công', data);
      } else {
        const errText = await res.text();
        setHealthData({
          status: 'ERROR',
          message: `Mã phản hồi HTTP ${res.status}: ${errText.slice(0, 100)}`,
        });
        debugLogger.error('SYSTEM', `Endpoint /api/debug/system-health trả về ${res.status}`, errText);
      }
    } catch (err: any) {
      setHealthData({
        status: 'NETWORK_ERROR',
        message: `Không thể kết nối đến máy chủ: ${err?.message}`,
      });
      debugLogger.error('SYSTEM', 'Lỗi kết nối /api/debug/system-health', err?.message);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  const runSupabaseCheck = async () => {
    setIsTestingSupabase(true);
    try {
      const result = await checkSupabaseConnection();
      setSupabaseTest(result);
      if (result.connected) {
        debugLogger.success('SUPABASE', 'Kiểm tra kết nối Supabase thành công!', result);
      } else {
        debugLogger.warn('SUPABASE', 'Kiểm tra kết nối Supabase thất bại', result);
      }
    } catch (err: any) {
      setSupabaseTest({
        connected: false,
        message: err?.message || 'Lỗi kiểm tra Supabase',
      });
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) return;
    setIsSendingTestMail(true);
    setTestMailResult(null);
    try {
      debugLogger.log('SMTP', `Yêu cầu gửi email kiểm tra đến ${testEmail}`);
      const res = await fetch('/api/debug/system-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_test_email',
          targetEmail: testEmail,
        }),
      });
      const data = await res.json();
      setTestMailResult(data);
      if (data.success) {
        debugLogger.success('SMTP', `Đã gửi thành công email test tới ${testEmail}`, data);
      } else {
        debugLogger.error('SMTP', `Thất bại khi gửi email test: ${data.message}`, data);
      }
    } catch (err: any) {
      setTestMailResult({
        success: false,
        message: `Lỗi kết nối: ${err?.message}`,
      });
      debugLogger.error('SMTP', 'Lỗi gọi API send_test_email', err?.message);
    } finally {
      setIsSendingTestMail(false);
    }
  };

  const handleSaveManualDb = () => {
    if (!customUrl || !customKey) return;
    setCustomSupabaseConfig(customUrl, customKey);
    setManualSaveSuccess(true);
    debugLogger.success('SYSTEM', 'Đã lưu cấu hình Supabase thủ công trực tiếp vào trình duyệt');
    runSupabaseCheck();
    setTimeout(() => setManualSaveSuccess(false), 3000);
  };

  const handleClearManualDb = () => {
    clearCustomSupabaseConfig();
    setCustomUrl('');
    setCustomKey('');
    debugLogger.log('SYSTEM', 'Đã xóa cấu hình Supabase thủ công');
    runSupabaseCheck();
  };

  const handleCopyLogs = () => {
    const text = debugLogger.exportAsText();
    navigator.clipboard.writeText(text);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  const handleDownloadLogs = () => {
    const text = debugLogger.exportAsText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kienhoc_logs_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const filteredLogs = filterCategory === 'ALL'
    ? logs
    : logs.filter((l) => l.category === filterCategory);

  return (
    <div
      id="production-debug-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        id="production-debug-modal-container"
        className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-amber-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-emerald-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl border border-white/30 backdrop-blur-md">
              🛠️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">Trung Tâm Chẩn Đoán & Logs Production</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 border border-white/30">
                  Vercel • Supabase • SMTP
                </span>
              </div>
              <p className="text-xs text-amber-100 font-medium">
                Kiểm tra trực tiếp biến môi trường, kết nối cơ sở dữ liệu và nhật ký gửi email OTP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-amber-50/70 border-b border-amber-200 px-6 pt-3 flex gap-2">
          <button
            onClick={() => setActiveTab('health')}
            className={`px-4 py-2.5 rounded-t-xl text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'health'
                ? 'bg-white text-amber-900 border-t-2 border-amber-600 shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-amber-100/50'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-600" />
            Kiểm Tra Hệ Thống (Health Check)
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2.5 rounded-t-xl text-sm font-bold flex items-center gap-2 transition-all relative ${
              activeTab === 'logs'
                ? 'bg-white text-amber-900 border-t-2 border-amber-600 shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-amber-100/50'
            }`}
          >
            <Server className="w-4 h-4 text-emerald-600" />
            Nhật Ký Sự Kiện (Live Logs)
            <span className="ml-1 px-2 py-0.2 rounded-full text-[10px] font-black bg-amber-200 text-amber-800">
              {logs.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2.5 rounded-t-xl text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'guide'
                ? 'bg-white text-amber-900 border-t-2 border-amber-600 shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-amber-100/50'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-blue-600" />
            Hướng Dẫn Cấu Hình Vercel
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50 space-y-6">
          {activeTab === 'health' && (
            <div className="space-y-6 animate-fade-in">
              {/* Quick Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                <div>
                  <div className="text-sm font-black text-stone-800">Trạng Thái Tổng Quát</div>
                  <div className="text-xs text-stone-500">
                    Môi trường: <span className="font-bold text-amber-700">{healthData?.runtime || 'Đang kiểm tra...'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      runHealthCheck();
                      runSupabaseCheck();
                    }}
                    disabled={isLoadingHealth || isTestingSupabase}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHealth || isTestingSupabase ? 'animate-spin' : ''}`} />
                    Quét Lại Toàn Bộ
                  </button>
                </div>
              </div>

              {/* CARD 1: Dịch Vụ Gửi Email (SMTP Gmail) */}
              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-stone-800">1. Dịch Vụ Gửi Email Tự Động (SMTP Gmail)</h3>
                      <p className="text-xs text-stone-500">Gửi mã OTP 6 số và liên kết kích hoạt đến email học sinh</p>
                    </div>
                  </div>

                  {healthData?.diagnostics?.smtp?.status === 'CONNECTED' ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Sẵn Sàng (Connected)
                    </span>
                  ) : healthData?.diagnostics?.smtp?.status === 'ERROR' ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Lỗi Xác Thực
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Chưa Cấu Hình
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <div className="text-stone-500 font-medium">Tài khoản gửi (GMAIL_USER):</div>
                    <div className="text-stone-800 font-bold mt-0.5 font-mono">
                      {healthData?.diagnostics?.smtp?.user || 'mkt.thecliffresort@gmail.com'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <div className="text-stone-500 font-medium">Mật khẩu ứng dụng (GMAIL_APP_PASSWORD):</div>
                    <div className="text-stone-800 font-bold mt-0.5">
                      {healthData?.diagnostics?.smtp?.configured ? (
                        <span className="text-emerald-700">✅ Đã cấu hình ({healthData?.diagnostics?.smtp?.sanitizedLength} ký tự)</span>
                      ) : (
                        <span className="text-rose-600">❌ Thiếu biến trên Vercel</span>
                      )}
                    </div>
                  </div>
                </div>

                {healthData?.diagnostics?.smtp?.message && (
                  <div className={`p-3 rounded-xl text-xs font-semibold ${
                    healthData.diagnostics.smtp.status === 'CONNECTED'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}>
                    {healthData.diagnostics.smtp.message}
                  </div>
                )}

                {/* Test Send Box */}
                <div className="pt-2 border-t border-stone-100">
                  <div className="text-xs font-bold text-stone-700 mb-2">Thử nghiệm gửi email thực tế:</div>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="Nhập email nhận thử nghiệm..."
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                    <button
                      onClick={handleSendTestEmail}
                      disabled={isSendingTestMail || !testEmail}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                    >
                      <Send className={`w-3.5 h-3.5 ${isSendingTestMail ? 'animate-pulse' : ''}`} />
                      {isSendingTestMail ? 'Đang gửi...' : 'Gửi Thử Email'}
                    </button>
                  </div>

                  {testMailResult && (
                    <div className={`mt-3 p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                      testMailResult.success
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border border-rose-300'
                    }`}>
                      {testMailResult.success ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                      <span>{testMailResult.message}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 2: Cơ Sở Dữ Liệu Supabase */}
              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-stone-800">2. Cơ Sở Dữ Liệu Supabase (public.users)</h3>
                      <p className="text-xs text-stone-500">Lưu trữ tài khoản, điểm số hạt đường và tiến độ học tập</p>
                    </div>
                  </div>

                  {supabaseTest?.connected ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Kết Nối Tốt ({supabaseTest.latencyMs}ms)
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Chưa Kết Nối
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <div className="text-stone-500 font-medium">Địa chỉ URL Supabase:</div>
                    <div className="text-stone-800 font-bold mt-0.5 font-mono truncate">
                      {currentSbInfo.maskedUrl}
                    </div>
                    <div className="text-[10px] text-stone-400 mt-1">Nguồn: {currentSbInfo.source}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <div className="text-stone-500 font-medium">Khóa Anon Key:</div>
                    <div className="text-stone-800 font-bold mt-0.5">
                      {currentSbInfo.keyConfigured ? (
                        <span className="text-emerald-700">✅ Đã có ({currentSbInfo.keyLength} ký tự)</span>
                      ) : (
                        <span className="text-rose-600">❌ Chưa cấu hình trên Vercel</span>
                      )}
                    </div>
                  </div>
                </div>

                {supabaseTest && (
                  <div className={`p-3 rounded-xl text-xs font-semibold ${
                    supabaseTest.connected
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}>
                    {supabaseTest.message}
                  </div>
                )}

                {/* Option to enter directly for immediate production testing */}
                <div className="pt-2 border-t border-stone-100">
                  <button
                    onClick={() => setShowManualDbInputs(!showManualDbInputs)}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                  >
                    <Key className="w-3.5 h-3.5" />
                    {showManualDbInputs ? 'Ẩn ô nhập thủ công' : '⚡ Muốn test ngay trên Vercel mà không cần chờ build lại? (Nhập URL & Key trực tiếp)'}
                  </button>

                  {showManualDbInputs && (
                    <div className="mt-3 p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          Supabase Project URL (ví dụ: https://uubaunirloppudcqitum.supabase.co)
                        </label>
                        <input
                          type="text"
                          value={customUrl}
                          onChange={(e) => setCustomUrl(e.target.value)}
                          placeholder="https://uubaunirloppudcqitum.supabase.co"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          Supabase Anon / Public Key (eyJhbGciOi...)
                        </label>
                        <input
                          type="text"
                          value={customKey}
                          onChange={(e) => setCustomKey(e.target.value)}
                          placeholder="eyJhbGciOi..."
                          className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white font-mono"
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={handleSaveManualDb}
                          className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-sm"
                        >
                          Lưu & Kích Hoạt Ngay
                        </button>
                        <button
                          onClick={handleClearManualDb}
                          className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-xs font-bold"
                        >
                          Xóa Cấu Hình Thủ Công
                        </button>
                        {manualSaveSuccess && (
                          <span className="text-xs text-emerald-700 font-bold flex items-center">
                            ✅ Đã áp dụng thành công!
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4 animate-fade-in">
              {/* Log Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {['ALL', 'AUTH', 'API', 'SUPABASE', 'SMTP', 'ERROR'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        filterCategory === cat
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLogs}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedLogs ? 'Đã sao chép!' : 'Sao Chép Logs'}
                  </button>
                  <button
                    onClick={handleDownloadLogs}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Tải File .txt
                  </button>
                  <button
                    onClick={() => debugLogger.clear()}
                    className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-all"
                    title="Xóa logs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Log List View */}
              <div className="bg-stone-900 rounded-2xl p-4 font-mono text-xs overflow-y-auto max-h-[500px] border border-stone-800 space-y-2">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-12 text-stone-500">
                    Chưa có nhật ký nào được ghi nhận. Hãy thử thao tác Đăng ký / Xác thực để xem logs trực tiếp!
                  </div>
                ) : (
                  filteredLogs.map((entry) => {
                    const badgeColor = {
                      info: 'text-blue-400',
                      success: 'text-emerald-400',
                      warn: 'text-amber-400',
                      error: 'text-rose-400 font-bold',
                    }[entry.level] || 'text-stone-400';

                    return (
                      <div
                        key={entry.id}
                        className="p-2 rounded-lg bg-stone-800/60 border border-stone-700/50 hover:bg-stone-800 transition-colors"
                      >
                        <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-amber-500 font-bold">[{entry.category}]</span>
                            <span className={badgeColor}>{entry.level.toUpperCase()}</span>
                          </div>
                          <span className="text-stone-500">{entry.timestamp}</span>
                        </div>
                        <div className="text-stone-200 leading-relaxed font-sans">{entry.message}</div>
                        {entry.details && (
                          <pre className="mt-1.5 p-2 rounded bg-black/40 text-[11px] text-stone-300 overflow-x-auto max-h-32">
                            {typeof entry.details === 'object'
                              ? JSON.stringify(entry.details, null, 2)
                              : String(entry.details)}
                          </pre>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-6 animate-fade-in text-stone-800">
              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-black text-amber-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  Các bước thiết lập bắt buộc trên Vercel Dashboard
                </h3>

                <p className="text-sm text-stone-600 leading-relaxed">
                  Để hệ thống trên trang web chính thức (<strong>https://kiencon.vercel.app</strong>) gửi được email OTP và lưu trữ người dùng vào Supabase, bạn cần cấu hình đủ <strong>4 biến môi trường</strong> sau trên Vercel:
                </p>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="flex items-center justify-between font-mono font-bold text-amber-900 text-sm mb-1">
                      <span>1. VITE_SUPABASE_URL</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-200">Client + Server</span>
                    </div>
                    <div className="text-xs text-stone-600 mb-2">Địa chỉ dự án Supabase của bạn</div>
                    <code className="text-xs bg-white px-2.5 py-1.5 rounded border border-amber-200 text-stone-800 font-mono block select-all">
                      https://uubaunirloppudcqitum.supabase.co
                    </code>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="flex items-center justify-between font-mono font-bold text-amber-900 text-sm mb-1">
                      <span>2. VITE_SUPABASE_ANON_KEY</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-200">Client + Server</span>
                    </div>
                    <div className="text-xs text-stone-600 mb-2">
                      Khóa public/anon key lấy từ Supabase (Project Settings ➔ API ➔ Project API keys ➔ anon public)
                    </div>
                    <code className="text-xs bg-white px-2.5 py-1.5 rounded border border-amber-200 text-stone-800 font-mono block select-all truncate">
                      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                    </code>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center justify-between font-mono font-bold text-emerald-900 text-sm mb-1">
                      <span>3. GMAIL_USER</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-200">Serverless Function</span>
                    </div>
                    <div className="text-xs text-stone-600 mb-2">Tài khoản Gmail dùng để phát thư</div>
                    <code className="text-xs bg-white px-2.5 py-1.5 rounded border border-emerald-200 text-stone-800 font-mono block select-all">
                      mkt.thecliffresort@gmail.com
                    </code>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center justify-between font-mono font-bold text-emerald-900 text-sm mb-1">
                      <span>4. GMAIL_APP_PASSWORD</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-200">Serverless Function</span>
                    </div>
                    <div className="text-xs text-stone-600 mb-2">
                      Mật khẩu ứng dụng 16 chữ cái tạo từ Google Account (Bảo mật 2 lớp ➔ Mật khẩu ứng dụng).
                    </div>
                    <div className="text-xs text-emerald-800 font-semibold">
                      💡 Mẹo: Có thể dán có dấu cách hoặc không dấu cách (hệ thống đã tự động lọc sạch).
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-sm text-rose-700">
                    <AlertTriangle className="w-4 h-4" />
                    LƯU Ý CỰC KỲ QUAN TRỌNG:
                  </div>
                  <p>
                    Sau khi thêm hoặc sửa bất kỳ biến môi trường nào trên Vercel, bạn <strong>BẮT BUỘC</strong> phải vào mục <strong>Deployments ➔ Bấm vào dấu 3 chấm (...) của bản deploy gần nhất ➔ Chọn "Redeploy"</strong> thì biến mới có hiệu lực!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <div>
            Hệ thống Kiến Học: Hỗ trợ cả xác thực qua OTP Email và mã dự phòng khẩn cấp <strong>123456</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold transition-all"
          >
            Đóng Trung Tâm Chẩn Đoán
          </button>
        </div>
      </div>
    </div>
  );
};
