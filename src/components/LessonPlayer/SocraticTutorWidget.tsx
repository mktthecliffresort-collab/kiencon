import React, { useState, useEffect, useRef } from 'react';
import { AntAlly, GradeLevel, TutorChatMessage } from '../../types';
import { geminiService } from '../../services/geminiService';
import { audioService } from '../../services/audioService';
import {
  Send,
  Sparkles,
  HelpCircle,
  Lightbulb,
  X,
  Minimize2,
  Maximize2,
  AlertTriangle,
  RotateCcw,
  Bot,
  BrainCircuit,
  MessageSquare
} from 'lucide-react';
import { DragScrollContainer } from '../DragScrollContainer';

interface SocraticTutorWidgetProps {
  grade: GradeLevel;
  subjectName: string;
  currentTopic: string;
  questionContext: string;
  ally: AntAlly;
  isOpen: boolean;
  onToggle: () => void;
}

export const SocraticTutorWidget: React.FC<SocraticTutorWidgetProps> = ({
  grade,
  subjectName,
  currentTopic,
  questionContext,
  ally,
  isOpen,
  onToggle,
}) => {
  const isGrade5 = grade === 5;
  const tutorName = 'Kiến Con';
  const roleLabel = isGrade5 ? 'Bạn Kiến Thông Thái' : 'Trợ lý Kiến Khoa Học';

  const [messages, setMessages] = useState<TutorChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const initialGreeting: TutorChatMessage = {
        id: 'init_welcome',
        sender: 'ant',
        text: isGrade5
          ? `Chào bạn nhỏ! Kiến Con đang theo sát bài học "${currentTopic}" cùng bạn nè. Khi gặp câu hỏi hóc búa, đừng lo nhé, Kiến Con sẽ không đưa đáp án ngay đâu mà cùng bạn mở từng manh mối thú vị!`
          : `Xin chào! Kiến Con đồng hành cùng bạn trong chuyên đề "${currentTopic}". Nếu bạn cần kiểm chứng lại các đại lượng hoặc phân tích hiện tượng, hãy đặt câu hỏi nhé!`,
        followUpQuestion: isGrade5
          ? 'Con đang gặp khó khăn ở bước nào của chiếc bánh/phân số?'
          : 'Hiện tượng bạn đang quan sát có liên quan đến đại lượng nào?',
        guidanceLevel: 1,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([initialGreeting]);
    }
  }, [grade, currentTopic, isGrade5, messages.length]);

  // Auto-scroll when messages change
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend || isLoading) return;

    audioService.playClick();
    const nextAttempt = attemptCount + 1;
    setAttemptCount(nextAttempt);

    const userMsg: TutorChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'student',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await geminiService.askSocraticTutor({
        studentGrade: grade,
        subject: subjectName,
        currentTopic,
        questionContext,
        studentInput: textToSend,
        attemptCount: nextAttempt,
      });

      audioService.playHintChime();

      const antMsg: TutorChatMessage = {
        id: `ant_${Date.now()}`,
        sender: 'ant',
        text: response.responseMessage,
        guidanceLevel: response.guidanceLevel,
        followUpQuestion: response.followUpQuestion,
        misconceptionDetected: response.misconceptionDetected,
        isLocalFallback: response.isLocalFallback,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, antMsg]);
    } catch (err) {
      console.warn('Tutor chat notice:', err);
      const errorMsg: TutorChatMessage = {
        id: `ant_err_${Date.now()}`,
        sender: 'ant',
        text: isGrade5
          ? 'Kiến Con vẫn đang ở đây cùng bạn nè! Bạn hãy đọc lại câu hỏi đề bài và quan sát hình ảnh thật kỹ nhé!'
          : 'Hệ thống gợi ý: Hãy quay lại phân tích mối liên hệ toán học giữa các biến số trong đề bài.',
        followUpQuestion: 'Con thấy chi tiết nào nổi bật nhất?',
        guidanceLevel: 1,
        isLocalFallback: true,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleResetChat = () => {
    audioService.playClick();
    setAttemptCount(0);
    setMessages([
      {
        id: `reset_${Date.now()}`,
        sender: 'ant',
        text: isGrade5
          ? `Kiến Con đã sẵn sàng hỗ trợ bạn cho câu hỏi tiếp theo! Cùng bắt đầu khám phá nào!`
          : `Đã làm mới phiên trò chuyện cùng Kiến Con. Bạn muốn tìm hiểu tiếp khía cạnh nào của bài học?`,
        followUpQuestion: isGrade5
          ? 'Con muốn hỏi về cách chia bánh hay quy tắc so sánh phân số?'
          : 'Bạn đang băn khoăn về áp suất, ma sát hay diện tích tiếp xúc?',
        guidanceLevel: 1,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Guidance level styling helper
  const renderGuidanceBadge = (level?: 1 | 2 | 3) => {
    if (!level) return null;
    if (level === 1) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Lightbulb className="w-3 h-3 text-emerald-600" />
          <span>Nấc 1: Gợi mở quan sát</span>
        </span>
      );
    }
    if (level === 2) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
          <Sparkles className="w-3 h-3 text-amber-600" />
          <span>Nấc 2: Ẩn dụ & Ví dụ thực tế</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
        <BrainCircuit className="w-3 h-3 text-purple-600" />
        <span>Nấc 3: Phân tích bản chất</span>
      </span>
    );
  };

  // If completely closed, show floating expandable trigger pill (compact & delicate on mobile)
  if (!isOpen) {
    return (
      <button
        id="tutor-widget-open-button"
        onClick={() => {
          audioService.playClick();
          onToggle();
        }}
        className={`fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-40 flex items-center gap-1.5 sm:gap-2.5 p-1.5 sm:px-4 sm:py-3 rounded-full sm:rounded-2xl shadow-lg sm:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 border ${
          isGrade5
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-300/90 shadow-amber-500/25'
            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-400/90 shadow-blue-600/25'
        }`}
        title="Bấm vào chú Kiến để hỏi gợi ý nhé!"
      >
        {/* Mobile: compact, delicate waving ant avatar that never covers action buttons */}
        <div className="flex sm:hidden items-center gap-1.5 pl-1 pr-2 py-0.5">
          <div className="relative w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-base">
            <span className="inline-block animate-wiggle">🐜</span>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-300 ring-2 ring-amber-500 animate-pulse" />
          </div>
          <div className="text-left leading-tight">
            <div className="text-xs font-black flex items-center gap-1">
              <span>Hỏi Kiến</span>
              <span className="text-[12px]">👋</span>
            </div>
          </div>
        </div>

        {/* Tablet & Desktop: fuller descriptive badge */}
        <div className="hidden sm:flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-lg animate-bounce">
            🐜
          </div>
          <div className="text-left">
            <div className="text-xs font-black uppercase tracking-wider opacity-90 flex items-center gap-1.5">
              <span>Hỏi chú Kiến</span>
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            </div>
            <div className="text-sm font-bold leading-none mt-0.5">Kiến Con trợ giúp</div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <aside
      id="socratic-tutor-docked-panel"
      className={`fixed lg:sticky top-auto lg:top-20 bottom-3 sm:bottom-4 lg:bottom-auto left-3 right-3 sm:left-auto sm:right-4 z-40 w-auto sm:w-[410px] bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col transition-all duration-300 overflow-hidden ${
        isMinimized ? 'h-16' : 'h-[580px] max-h-[82vh]'
      }`}
    >
      {/* Header */}
      <div
        id="tutor-widget-header"
        className={`px-4 py-3.5 flex items-center justify-between border-b transition-colors ${
          isGrade5
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-600'
            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-700'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shadow-inner">
            🐜
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">{tutorName}</h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-white/25 uppercase tracking-wider">
                Lớp {grade}
              </span>
            </div>
            <p className="text-xs text-white/80 font-medium">{roleLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            id="tutor-widget-reset-button"
            onClick={handleResetChat}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition-colors"
            title="Làm mới cuộc trò chuyện"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            id="tutor-widget-minimize-button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition-colors"
            title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            id="tutor-widget-close-button"
            onClick={() => {
              audioService.playClick();
              onToggle();
            }}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition-colors"
            title="Đóng bảng gia sư"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Sub-header context indicator */}
          <div className="bg-stone-50 border-b border-stone-200 px-3.5 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-stone-600 truncate max-w-[240px]">
              <Bot className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
              <span className="truncate font-semibold">{currentTopic}</span>
            </div>
            <span className="text-[11px] font-bold text-stone-600 bg-stone-200/70 px-2 py-0.5 rounded-full">
              Lượt hỏi: #{attemptCount}
            </span>
          </div>

          {/* Messages Stream */}
          <div
            id="tutor-widget-messages-container"
            className="flex-1 overflow-y-auto soft-scrollbar p-3.5 space-y-3.5 bg-stone-100/60"
          >
            {messages.map((msg) => {
              const isAnt = msg.sender === 'ant';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAnt ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[92%] rounded-2xl p-3.5 text-sm shadow-xs ${
                      isAnt
                        ? 'bg-white text-stone-800 border border-stone-200/80 rounded-tl-sm'
                        : isGrade5
                        ? 'bg-amber-500 text-white font-medium rounded-tr-sm'
                        : 'bg-blue-600 text-white font-medium rounded-tr-sm'
                    }`}
                  >
                    {isAnt && (
                      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-stone-100">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">🐜</span>
                          <span className="font-extrabold text-xs text-stone-800">{tutorName}</span>
                        </div>
                        {renderGuidanceBadge(msg.guidanceLevel)}
                      </div>
                    )}

                    {/* Main response message */}
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                    {/* Misconception detected callout */}
                    {isAnt && msg.misconceptionDetected && (
                      <div className="mt-2.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold">Lưu ý quan niệm sai: </strong>
                          <span>{msg.misconceptionDetected}</span>
                        </div>
                      </div>
                    )}

                    {/* Socratic Follow-up question box */}
                    {isAnt && msg.followUpQuestion && (
                      <div
                        className={`mt-2.5 p-2.5 rounded-xl border text-xs font-semibold ${
                          isGrade5
                            ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                            : 'bg-blue-50/70 border-blue-200 text-blue-900'
                        }`}
                      >
                        <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider mb-1 text-stone-500">
                          <HelpCircle className="w-3 h-3 text-amber-600" />
                          <span>Kiến Con hỏi lại bạn:</span>
                        </div>
                        <p className="font-bold text-stone-900 italic">"{msg.followUpQuestion}"</p>
                      </div>
                    )}

                    {/* Fallback indicator if running local */}
                    {isAnt && msg.isLocalFallback && (
                      <div className="mt-2 text-[10px] text-stone-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Chế độ đồng hành ngoại tuyến</span>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-stone-400 mt-1 px-1 font-medium">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-sm p-3 shadow-xs max-w-[85%]">
                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
                    <span className="text-base animate-spin">🐜</span>
                    <span>Kiến Con đang suy nghĩ câu hỏi gợi mở cho bạn...</span>
                  </div>
                  <div className="flex gap-1.5 mt-2 ml-6">
                    <span className="w-2 h-2 rounded-full bg-stone-300 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-stone-300 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-stone-300 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="bg-white border-t border-stone-200 px-2 pt-2 pb-1">
            <DragScrollContainer
              id="tutor-widget-quick-prompts"
              fadeColorClass="from-white"
            >
              <div className="flex items-center gap-1.5 pb-1 px-1">
                <button
                  id="prompt-chip-hint"
                  onClick={() => handleQuickPrompt('Gợi ý cho con')}
                  disabled={isLoading}
                  className="flex-shrink-0 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <Lightbulb className="w-3 h-3 text-amber-600" />
                  <span>Gợi ý cho con</span>
                </button>

                <button
                  id="prompt-chip-why"
                  onClick={() => handleQuickPrompt('Tại sao lại như vậy?')}
                  disabled={isLoading}
                  className="flex-shrink-0 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/80 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <HelpCircle className="w-3 h-3 text-blue-600" />
                  <span>Tại sao lại như vậy?</span>
                </button>

                <button
                  id="prompt-chip-example"
                  onClick={() => handleQuickPrompt('Cho con ví dụ thực tế')}
                  disabled={isLoading}
                  className="flex-shrink-0 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Cho con ví dụ thực tế</span>
                </button>
              </div>
            </DragScrollContainer>
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-stone-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                id="tutor-widget-text-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isGrade5
                    ? 'Hỏi chú Kiến hoặc chia sẻ suy nghĩ của con...'
                    : 'Đặt câu hỏi hoặc nhập suy luận của bạn...'
                }
                disabled={isLoading}
                className="flex-1 bg-stone-100 focus:bg-white border border-stone-200 focus:border-stone-400 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-800 placeholder-stone-400 outline-hidden transition-all disabled:opacity-60"
              />
              <button
                id="tutor-widget-send-button"
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className={`p-2 rounded-xl text-white font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  isGrade5
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                title="Gửi câu hỏi"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </aside>
  );
};
