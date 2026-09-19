import React, { useState } from 'react';
import { LessonPractice, AntAlly, MathInteractiveTask } from '../../types';
import { Check, HelpCircle, ArrowRight, Sparkles, CheckCircle2, Award, ChevronRight } from 'lucide-react';
import { audioService } from '../../services/audioService';
import { fireGrandCelebration, fireSmallConfetti } from '../../utils/confettiHelper';

interface StagePracticeGrade5Props {
  practice: LessonPractice;
  ally: AntAlly;
  onSuccess: () => void;
  onRequestHint: (stage: number, userChoice: string) => void;
}

export const StagePracticeGrade5: React.FC<StagePracticeGrade5Props> = ({
  practice,
  ally,
  onSuccess,
  onRequestHint,
}) => {
  // If this lesson is cake slicing (Bài về phân số bằng nhau)
  const isFractionCake = practice.type === 'fraction_cake' && practice.fractionData;

  // Fraction Cake Slicer States
  const fractionData = practice.fractionData || {
    targetFraction: { num: 2, den: 4 },
    slicesAvailable: [2, 4, 6, 8],
    equivalentFractions: [
      { num: 1, den: 2, isEquivalent: true, label: '1/2 (Một nửa)' },
      { num: 3, den: 6, isEquivalent: true, label: '3/6 (Ba phần sáu)' },
      { num: 4, den: 8, isEquivalent: true, label: '4/8 (Bốn phần tám)' },
      { num: 2, den: 6, isEquivalent: false, label: '2/6 (Hai phần sáu)' },
      { num: 3, den: 4, isEquivalent: false, label: '3/4 (Ba phần tư)' },
    ],
  };

  const [totalSlices, setTotalSlices] = useState<number>(4);
  const [selectedSlices, setSelectedSlices] = useState<number[]>([0, 1]);
  const [testedFractionId, setTestedFractionId] = useState<string | null>(null);
  const [cakeResult, setCakeResult] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [cakeCanProceed, setCakeCanProceed] = useState<boolean>(false);

  // General Math Interactive Tasks State (For SGK lessons)
  const tasks: MathInteractiveTask[] = practice.mathTasks && practice.mathTasks.length > 0
    ? practice.mathTasks
    : [
        {
          id: 'task_default',
          title: practice.challengeTitle || 'Bài tập vận dụng',
          prompt: practice.instructions || 'Hãy chọn đáp án đúng nhất để cùng Kiến Con vượt qua thử thách!',
          type: 'multiple_choice',
          options: practice.genericQuestion?.options?.map(o => ({
            id: o.id,
            text: o.text,
            isCorrect: o.isCorrect
          })) || [
            { id: 'opt_a', text: 'Đáp án A', isCorrect: true },
            { id: 'opt_b', text: 'Đáp án B', isCorrect: false },
          ],
          socraticClue: practice.hintStage1 || 'Hãy đọc kĩ đề bài và quan sát các dữ kiện.',
          explanation: practice.hintStage2 || 'Rất tuyệt vời! Bạn đã áp dụng đúng quy tắc toán học.'
        }
      ];

  const [activeTaskIdx, setActiveTaskIdx] = useState<number>(0);
  const [taskAnswers, setTaskAnswers] = useState<Record<string, { value: string; isSubmitted: boolean; isCorrect: boolean; feedback: string }>>({});
  const [inputVal, setInputVal] = useState<string>('');
  const [selectedOptId, setSelectedOptId] = useState<string | null>(null);

  const currentTask = tasks[activeTaskIdx] || tasks[0];
  const currentTaskState = taskAnswers[currentTask.id];

  // Check how many tasks completed
  const completedTasksCount = Object.values(taskAnswers).filter((a: { isCorrect: boolean }) => a.isCorrect).length;
  const allTasksFinished = tasks.length > 0 && completedTasksCount === tasks.length;

  // Fraction cake handlers
  const handleToggleSlice = (index: number) => {
    audioService.playClick();
    setSelectedSlices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleChangeSlices = (slices: number) => {
    audioService.playClick();
    setTotalSlices(slices);
    const half = Math.floor(slices / 2);
    setSelectedSlices(Array.from({ length: half }, (_, i) => i));
  };

  const handleSelectEquivalent = (item: { num: number; den: number; isEquivalent: boolean; label: string }, idx: number) => {
    setTestedFractionId(`frac_${idx}`);

    if (item.isEquivalent) {
      audioService.playCelebrationBurst();
      fireGrandCelebration();
      setCakeResult({
        isCorrect: true,
        message: `🎉 CHÍNH XÁC RỒI BẠN ƠI! ${item.num}/${item.den} bằng đúng với 2/4 (tức là 1/2 chiếc bánh kem)! Quá xuất sắc!`,
      });
      setCakeCanProceed(true);
    } else {
      audioService.playBoingPop();
      audioService.playHintChime();
      setCakeResult({
        isCorrect: false,
        message: `Kiến Con đang cùng bạn quan sát nè: Phân số ${item.num}/${item.den} chưa bằng với 2/4 đâu nha. Hãy đếm lại xem phần bánh đó có đúng bằng một nửa không nhé!`,
      });
      onRequestHint(2, `${item.num}/${item.den}`);
    }
  };

  // Math Interactive Submission Handler
  const handleCheckAnswer = (overrideOptId?: string) => {
    const optId = overrideOptId || selectedOptId;

    if (currentTask.type === 'multiple_choice' || currentTask.type === 'true_false') {
      const chosenOption = currentTask.options?.find(o => o.id === optId);
      if (!chosenOption) return;

      if (chosenOption.isCorrect) {
        audioService.playCelebrationBurst();
        fireGrandCelebration();
        setTaskAnswers(prev => ({
          ...prev,
          [currentTask.id]: {
            value: chosenOption.text,
            isSubmitted: true,
            isCorrect: true,
            feedback: `🎉 KIẾN CON REO VANG: ĐÚNG RỒI! BẠN LÀM QUÁ ĐỈNH! ${currentTask.explanation}`
          }
        }));
      } else {
        audioService.playBoingPop();
        audioService.playHintChime();
        setTaskAnswers(prev => ({
          ...prev,
          [currentTask.id]: {
            value: chosenOption.text,
            isSubmitted: true,
            isCorrect: false,
            feedback: `🐜 Kiến Con thì thầm: Hãy cùng mình suy nghĩ thêm một chút nhé: ${currentTask.socraticClue}`
          }
        }));
        onRequestHint(2, chosenOption.text);
      }
    } else if (currentTask.type === 'number_input') {
      const cleanInput = inputVal.trim().replace(',', '.');
      const cleanCorrect = (currentTask.correctAnswer || '').trim().replace(',', '.');
      const acceptable = (currentTask.acceptableAnswers || []).map(a => a.trim().replace(',', '.'));

      const isCorrect = cleanInput === cleanCorrect || acceptable.includes(cleanInput);

      if (isCorrect) {
        audioService.playCelebrationBurst();
        fireGrandCelebration();
        setTaskAnswers(prev => ({
          ...prev,
          [currentTask.id]: {
            value: inputVal,
            isSubmitted: true,
            isCorrect: true,
            feedback: `🎉 KIẾN CON REO VANG: CHUẨN XÁC 100%! ${currentTask.explanation}`
          }
        }));
      } else {
        audioService.playBoingPop();
        audioService.playHintChime();
        setTaskAnswers(prev => ({
          ...prev,
          [currentTask.id]: {
            value: inputVal,
            isSubmitted: true,
            isCorrect: false,
            feedback: `🐜 Kiến Con gợi ý: ${currentTask.socraticClue}`
          }
        }));
        onRequestHint(2, inputVal);
      }
    }
  };

  // Render SVG cake slices
  const renderCakeSlices = () => {
    const radius = 110;
    const center = 130;
    const slices = [];

    for (let i = 0; i < totalSlices; i++) {
      const startAngle = (i * 360) / totalSlices - 90;
      const endAngle = ((i + 1) * 360) / totalSlices - 90;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);

      const largeArc = 360 / totalSlices > 180 ? 1 : 0;
      const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      const isSelected = selectedSlices.includes(i);

      slices.push(
        <path
          key={i}
          d={pathData}
          onClick={() => handleToggleSlice(i)}
          className={`cursor-pointer transition-all duration-200 ${
            isSelected
              ? 'fill-amber-400 stroke-amber-600 hover:fill-amber-300'
              : 'fill-amber-100 stroke-amber-300 hover:fill-amber-200'
          }`}
          strokeWidth="3"
        />
      );
    }
    return slices;
  };

  // ================= RENDER FRACTION CAKE =================
  if (isFractionCake) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-extrabold text-sm">
                2
              </span>
              <span className="font-extrabold text-stone-900 tracking-tight text-base sm:text-lg">
                CHẶNG 2: THỰC HÀNH MÔ PHỎNG (PRACTICE)
              </span>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
              Xưởng Cắt Bánh Sinh Nhật
            </span>
          </div>

          <p className="text-sm text-stone-600 leading-relaxed">
            {practice.instructions}
          </p>

          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 flex flex-col md:flex-row items-center justify-around gap-8">
            <div className="flex flex-col items-center">
              <div className="relative">
                <svg width="260" height="260" className="drop-shadow-xs">
                  <circle cx="130" cy="130" r="116" fill="#fef3c7" stroke="#fde68a" strokeWidth="6" />
                  {renderCakeSlices()}
                  <circle cx="130" cy="130" r="18" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
                  <text x="130" y="135" textAnchor="middle" fontSize="14" fill="#ffffff">
                    🍓
                  </text>
                </svg>
              </div>

              <span className="text-xs text-stone-500 mt-2 font-medium">
                *Nhấp vào từng miếng bánh để chọn/bỏ chọn
              </span>

              <div className="flex items-center gap-2 mt-4">
                <span className="text-xs font-bold text-stone-600">Số phần chia:</span>
                {fractionData.slicesAvailable.map((count) => (
                  <button
                    key={count}
                    onClick={() => handleChangeSlices(count)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      totalSlices === count
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {count} phần
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center space-y-4 bg-white p-6 rounded-2xl border border-stone-200 w-full md:w-56 shadow-xs">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                Phân số đang biểu diễn
              </span>

              <div className="flex flex-col items-center justify-center font-black">
                <span className="text-4xl text-amber-600">{selectedSlices.length}</span>
                <div className="w-16 h-1 bg-stone-800 my-1 rounded-full" />
                <span className="text-4xl text-stone-800">{totalSlices}</span>
              </div>

              <div className="text-xs font-medium text-stone-600">
                = <strong className="text-amber-700 font-bold">{selectedSlices.length} miếng</strong> trên tổng số{' '}
                <strong>{totalSlices} miếng bằng nhau</strong>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Thử thách: Phân số nào dưới đây bằng với 2/4 (tức 1/2)?
              </span>
              <button
                type="button"
                id="btn-ask-ant-fraction-hint"
                onClick={() => onRequestHint(1, 'Gợi ý phân số')}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-950 border border-amber-300/80 shadow-xs hover:scale-105 active:scale-95 transition-all text-xs font-bold"
                title="Bấm vào chú Kiến vẫy chào để hỏi gợi ý nhé!"
              >
                <span className="text-base inline-block animate-wiggle select-none">🐜</span>
                <span className="text-xs select-none">👋</span>
                <span className="hidden sm:inline font-bold text-xs text-amber-900">Gợi ý</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {fractionData.equivalentFractions.map((item, idx) => {
                const isSelectedThis = testedFractionId === `frac_${idx}`;

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectEquivalent(item, idx)}
                    className={`p-3.5 rounded-2xl border text-left font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-between ${
                      isSelectedThis
                        ? item.isEquivalent
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs'
                          : 'bg-amber-50 border-amber-300 text-stone-800 shadow-xs'
                        : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black">{item.num}/{item.den}</span>
                      <span className="text-xs font-normal text-stone-500">({item.label})</span>
                    </div>
                    {isSelectedThis && item.isEquivalent && (
                      <Check className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>
                );
              })}
            </div>

            {cakeResult && (
              <div
                className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium flex items-start gap-3 animate-fadeIn ${
                  cakeResult.isCorrect
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                <div className="text-xl flex-shrink-0">🐜</div>
                <p className="leading-relaxed">{cakeResult.message}</p>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-stone-100">
            <span className="text-xs text-stone-400">
              {cakeCanProceed ? '🎉 Bạn đã nắm vững khái niệm!' : 'Hãy tìm đúng phân số bằng nhau để mở khóa Chặng 3'}
            </span>
            <button
              onClick={() => {
                audioService.playClick();
                onSuccess();
              }}
              disabled={!cakeCanProceed}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm text-white transition-all shadow-xs active:scale-95 ${
                cakeCanProceed
                  ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
                  : 'bg-stone-300 cursor-not-allowed text-stone-500 shadow-none'
              }`}
            >
              <span>Tiếp tục: Chặng 3 - Vận Dụng</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= RENDER GENERAL SGK MATH INTERACTIVE TASKS =================
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
        {/* Step Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-extrabold text-sm">
              2
            </span>
            <div>
              <span className="font-extrabold text-stone-900 tracking-tight text-base sm:text-lg block">
                CHẶNG 2: THỰC HÀNH BÀI TẬP SGK (PRACTICE)
              </span>
              <span className="text-xs text-stone-500 font-medium">
                {practice.challengeTitle}
              </span>
            </div>
          </div>

          {/* Task Stepper Tabs */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-stone-100 p-1.5 rounded-2xl">
            {tasks.map((t, idx) => {
              const isTaskDone = taskAnswers[t.id]?.isCorrect;
              const isCurrent = activeTaskIdx === idx;

              return (
                <button
                  key={t.id}
                  onClick={() => {
                    audioService.playClick();
                    setActiveTaskIdx(idx);
                    setInputVal('');
                    setSelectedOptId(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isCurrent
                      ? 'bg-white text-stone-900 shadow-xs font-black'
                      : isTaskDone
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <span>Bài {idx + 1}</span>
                  {isTaskDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Instructions description */}
        <div className="text-xs sm:text-sm text-stone-600 bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80 flex items-start gap-2.5">
          <span className="text-base flex-shrink-0">🐜</span>
          <p className="leading-relaxed">
            <strong className="text-amber-900 font-bold">Nhiệm vụ cùng Kiến Con:</strong> {practice.instructions}
          </p>
        </div>

        {/* Active Task Card */}
        <div className="space-y-4 bg-stone-50/80 rounded-2xl p-5 sm:p-6 border border-stone-200">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 max-w-[70%] truncate sm:max-w-none">
              {currentTask.title}
            </span>
            <button
              type="button"
              id="btn-ask-ant-task-hint"
              onClick={() => onRequestHint(1, currentTask.prompt)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-950 border border-amber-300/80 shadow-xs hover:scale-105 active:scale-95 transition-all text-xs font-bold"
              title="Bấm vào chú Kiến vẫy chào để hỏi gợi ý nhé!"
            >
              <span className="text-base inline-block animate-wiggle select-none">🐜</span>
              <span className="text-xs select-none">👋</span>
              <span className="hidden sm:inline font-bold text-xs text-amber-900">Gợi ý</span>
            </button>
          </div>

          <p className="text-base font-bold text-stone-900 leading-relaxed whitespace-pre-line">
            {currentTask.prompt}
          </p>

          {/* Question Input Type 1: Multiple Choice or True/False */}
          {(currentTask.type === 'multiple_choice' || currentTask.type === 'true_false') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentTask.options?.map((opt) => {
                const isSelected = selectedOptId === opt.id;
                const isAnsweredThis = currentTaskState?.isSubmitted && currentTaskState.value === opt.text;

                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSelectedOptId(opt.id);
                      handleCheckAnswer(opt.id);
                    }}
                    className={`p-4 rounded-2xl border text-left font-bold text-sm transition-all flex items-start justify-between gap-3 ${
                      isSelected || isAnsweredThis
                        ? currentTaskState?.isCorrect
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs ring-2 ring-emerald-400/30'
                          : 'bg-amber-50 border-amber-300 text-stone-900'
                        : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800 hover:border-amber-400'
                    }`}
                  >
                    <span className="leading-snug">{opt.text}</span>
                    {currentTaskState?.isCorrect && (isSelected || isAnsweredThis) && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Question Input Type 2: Number Input (Mobile Responsive Fix) */}
          {currentTask.type === 'number_input' && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full max-w-md">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCheckAnswer();
                    }}
                    placeholder="Nhập kết quả..."
                    className="flex-1 min-w-0 w-full px-4 py-3 bg-white border border-stone-300 rounded-2xl text-sm font-bold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-xs"
                  />
                  {currentTask.unit && (
                    <span className="shrink-0 text-xs sm:text-sm font-black text-stone-700 bg-stone-200/90 px-3.5 py-3 rounded-2xl border border-stone-300/80">
                      {currentTask.unit}
                    </span>
                  )}
                </div>
                <button
                  id="btn-check-task-answer"
                  onClick={() => handleCheckAnswer()}
                  className="w-full sm:w-auto shrink-0 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Kiểm tra</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Feedback Area */}
          {currentTaskState?.isSubmitted && (
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium flex items-start gap-3 animate-fadeIn ${
                currentTaskState.isCorrect
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              <div className="text-2xl flex-shrink-0">🐜</div>
              <div className="space-y-1">
                <p className="leading-relaxed">{currentTaskState.feedback}</p>
                {currentTaskState.isCorrect && activeTaskIdx < tasks.length - 1 && (
                  <button
                    onClick={() => {
                      audioService.playClick();
                      setActiveTaskIdx(activeTaskIdx + 1);
                      setInputVal('');
                      setSelectedOptId(null);
                    }}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-black text-emerald-800 hover:underline bg-emerald-100/80 px-3 py-1.5 rounded-xl"
                  >
                    <span>Làm tiếp Bài {activeTaskIdx + 2}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Task Completion Progress and Continue Button */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-stone-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-600">Tiến độ bài tập:</span>
            <div className="flex items-center gap-1.5">
              {tasks.map((t, idx) => (
                <div
                  key={t.id}
                  className={`w-3 h-3 rounded-full ${
                    taskAnswers[t.id]?.isCorrect ? 'bg-emerald-500' : 'bg-stone-200'
                  }`}
                  title={`Bài ${idx + 1}`}
                />
              ))}
            </div>
            <span className="text-xs text-stone-400">
              ({completedTasksCount}/{tasks.length} bài)
            </span>
          </div>

          <button
            onClick={() => {
              audioService.playClick();
              onSuccess();
            }}
            disabled={!allTasksFinished}
            className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm text-white transition-all shadow-xs active:scale-95 ${
              allTasksFinished
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200 cursor-pointer'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
            }`}
          >
            <span>{allTasksFinished ? 'Tiếp tục: Chặng 3 - Vận Dụng' : 'Hoàn thành các bài tập để tiếp tục'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
