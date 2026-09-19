import React, { useState, useMemo } from 'react';
import { LessonPractice, AntAlly } from '../../types';
import { HelpCircle, ArrowRight, Sparkles, CheckCircle2, FlaskConical, Flame, RotateCcw } from 'lucide-react';
import { audioService } from '../../services/audioService';

interface StagePracticeMatchingProps {
  practice: LessonPractice;
  ally: AntAlly;
  onSuccess: () => void;
  onRequestHint: (stage: number, userChoice: string) => void;
}

export const StagePracticeMatching: React.FC<StagePracticeMatchingProps> = ({
  practice,
  ally,
  onSuccess,
  onRequestHint,
}) => {
  const defaultPairs = [
    {
      id: 'p1',
      fact: 'Chẻ nhỏ củi và dùng que cời nhóm bếp lò',
      factor: 'Tăng diện tích tiếp xúc bề mặt',
      explanation: 'Chẻ nhỏ giúp thanh củi tăng diện tích tiếp xúc với Oxygen trong không khí, giúp phản ứng cháy diễn ra nhanh hơn gấp nhiều lần!',
    },
    {
      id: 'p2',
      fact: 'Bảo quản thịt tươi, rau củ trong ngăn đông tủ lạnh',
      factor: 'Hạ nhiệt độ môi trường',
      explanation: 'Nhiệt độ thấp làm giảm chuyển động nhiệt của phân tử và kìm hãm tốc độ các phản ứng sinh hóa, giúp thức ăn lâu bị ôi thiu.',
    },
    {
      id: 'p3',
      fact: 'Dùng quạt thổi thêm không khí vào bếp than tổ ong đang bén',
      factor: 'Tăng nồng độ chất phản ứng (Oxygen)',
      explanation: 'Thổi quạt liên tục cung cấp lượng lớn khí O2 có nồng độ cao vào bề mặt than, tăng số lần va chạm hiệu quả giữa than và Oxygen.',
    },
    {
      id: 'p4',
      fact: 'Rắc men vi sinh khi làm sữa chua hoặc ủ rượu nếp',
      factor: 'Sử dụng chất xúc tác (Enzyme sinh học)',
      explanation: 'Enzyme men đóng vai trò chất xúc tác sinh học giúp đường lên men thần tốc mà chính nó không bị tiêu hao sau phản ứng!',
    },
  ];

  const pairs = practice.matchingData?.pairs || defaultPairs;

  // Shuffle right column once on mount so it's a real challenge
  const shuffledFactors = useMemo(() => {
    return [...pairs].sort(() => 0.5 - Math.random());
  }, [pairs]);

  const [selectedFactId, setSelectedFactId] = useState<string | null>(null);
  const [selectedFactorId, setSelectedFactorId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [latestExplanation, setLatestExplanation] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState<number>(0);

  const isCompleted = matchedIds.length === pairs.length;

  const handleSelectFact = (id: string) => {
    if (matchedIds.includes(id)) return;
    audioService.playClick();
    setSelectedFactId(id);

    // If factor is already selected, test match
    if (selectedFactorId) {
      evaluatePair(id, selectedFactorId);
    }
  };

  const handleSelectFactor = (id: string) => {
    if (matchedIds.includes(id)) return;
    audioService.playClick();
    setSelectedFactorId(id);

    // If fact is already selected, test match
    if (selectedFactId) {
      evaluatePair(selectedFactId, id);
    }
  };

  const evaluatePair = (factId: string, factorId: string) => {
    setAttemptCount((prev) => prev + 1);

    if (factId === factorId) {
      // MATCH!
      audioService.playSuccess();
      setMatchedIds((prev) => [...prev, factId]);
      const matchedPair = pairs.find((p) => p.id === factId);
      if (matchedPair?.explanation) {
        setLatestExplanation(matchedPair.explanation);
      }
      setSelectedFactId(null);
      setSelectedFactorId(null);
    } else {
      // Mismatch - Give gentle Socratic feedback
      audioService.playHintChime();
      const factItem = pairs.find((p) => p.id === factId);
      const factorItem = pairs.find((p) => p.id === factorId);

      onRequestHint(
        attemptCount >= 1 ? 2 : 1,
        `Ghép: "${factItem?.fact}" với "${factorItem?.factor}"`
      );

      // Deselect with brief visual delay
      setTimeout(() => {
        setSelectedFactId(null);
        setSelectedFactorId(null);
      }, 700);
    }
  };

  const handleReset = () => {
    audioService.playClick();
    setMatchedIds([]);
    setSelectedFactId(null);
    setSelectedFactorId(null);
    setLatestExplanation(null);
  };

  // Speed calculation for dynamic chemical flask animation
  const speedPercentage = (matchedIds.length / pairs.length) * 100;
  const speedLabel =
    matchedIds.length === 0
      ? 'Chưa kích hoạt (v = 0)'
      : matchedIds.length === 1
      ? 'Chậm (v1)'
      : matchedIds.length === 2
      ? 'Trung bình (v2)'
      : matchedIds.length === 3
      ? 'Nhanh (v3)'
      : 'Tối ưu vượt bậc (v_max)!';

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        {/* Stage Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-extrabold text-sm">
              2
            </span>
            <span className="font-extrabold text-stone-900 tracking-tight text-base sm:text-lg">
              CHẶNG 2: THỰC HÀNH MÔ PHỎNG (PRACTICE)
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 flex items-center gap-1">
            <FlaskConical className="w-3.5 h-3.5" />
            Thí nghiệm ghép nối hóa học
          </span>
        </div>

        {/* Instructions */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-stone-900">
            {practice.challengeTitle}
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            {practice.instructions}
          </p>
        </div>

        {/* Interactive Reaction Flask & Speed Gauge */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-stone-900 rounded-3xl p-6 text-white border border-purple-800 shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl relative">
                🧪
                {matchedIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500" />
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>TỐC ĐỘ PHẢN ỨNG TRONG BÌNH THỦY TINH:</span>
                </div>
                <div className="text-xl font-black text-white">{speedLabel}</div>
                <div className="text-xs text-stone-300">
                  Đã mở khóa: <strong>{matchedIds.length}/{pairs.length}</strong> yếu tố động học
                </div>
              </div>
            </div>

            <div className="w-full sm:w-48 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-purple-200">
                <span>Vận tốc phản ứng</span>
                <span>{speedPercentage}%</span>
              </div>
              <div className="w-full bg-white/10 h-3.5 rounded-full overflow-hidden p-0.5 border border-white/20">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 via-amber-400 to-emerald-400 transition-all duration-700 shadow-sm"
                  style={{ width: `${speedPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Matching Columns Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Chọn 1 hiện tượng thực tế và 1 yếu tố hóa học tương ứng:
            </span>
            {matchedIds.length > 0 && (
              <button
                onClick={handleReset}
                className="text-xs font-bold text-stone-500 hover:text-stone-800 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Ghép lại từ đầu
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {/* Left Column: Real-world facts */}
            <div className="space-y-3">
              <div className="text-xs font-extrabold text-stone-700 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200">
                🇻🇳 Hiện tượng dân gian & Đời sống
              </div>
              {pairs.map((item, idx) => {
                const isMatched = matchedIds.includes(item.id);
                const isSelected = selectedFactId === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectFact(item.id)}
                    disabled={isMatched}
                    className={`w-full text-left p-4 rounded-2xl border transition-all text-sm relative ${
                      isMatched
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold opacity-90'
                        : isSelected
                        ? 'bg-purple-50 border-purple-500 text-purple-950 shadow-md scale-[1.01] ring-2 ring-purple-300'
                        : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-snug flex-1">{item.fact}</span>
                      {isMatched && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Reaction factors */}
            <div className="space-y-3">
              <div className="text-xs font-extrabold text-purple-900 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
                🧪 Yếu tố điều khiển tốc độ phản ứng
              </div>
              {shuffledFactors.map((item) => {
                const isMatched = matchedIds.includes(item.id);
                const isSelected = selectedFactorId === item.id;

                return (
                  <button
                    key={`factor_${item.id}`}
                    onClick={() => handleSelectFactor(item.id)}
                    disabled={isMatched}
                    className={`w-full text-left p-4 rounded-2xl border transition-all text-sm relative ${
                      isMatched
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold opacity-90'
                        : isSelected
                        ? 'bg-purple-50 border-purple-500 text-purple-950 shadow-md scale-[1.01] ring-2 ring-purple-300'
                        : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                        ✨
                      </span>
                      <span className="leading-snug font-bold text-purple-950 flex-1">
                        {item.factor}
                      </span>
                      {isMatched && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Latest Matched Scientific Explanation Callout */}
        {latestExplanation && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-950 text-xs sm:text-sm space-y-1">
            <div className="font-extrabold flex items-center gap-1.5 text-emerald-800">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Khám phá cơ chế khoa học:</span>
            </div>
            <p className="leading-relaxed">{latestExplanation}</p>
          </div>
        )}

        {/* Bottom Bar: Socratic Hint Request & Continue */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => {
              audioService.playClick();
              onRequestHint(
                attemptCount >= 1 ? 2 : 1,
                'Tôi muốn tìm hiểu thêm về mối liên hệ giữa đời sống và tốc độ phản ứng'
              );
            }}
            className="flex items-center gap-2 text-stone-600 hover:text-purple-700 font-bold text-xs transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-purple-600" />
            <span>Gợi mở từ {ally.name}</span>
          </button>

          {isCompleted ? (
            <button
              onClick={() => {
                audioService.playLevelUp();
                onSuccess();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95 animate-bounce"
            >
              <span>Xuất sắc! Sang Chặng 3: Tình huống thực tế</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="text-xs text-stone-500 font-medium">
              Hãy ghép đúng cả {pairs.length} cặp để khởi động hoàn toàn lò phản ứng!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
