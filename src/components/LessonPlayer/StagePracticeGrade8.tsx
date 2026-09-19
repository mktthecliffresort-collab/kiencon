import React, { useState } from 'react';
import { LessonPractice, AntAlly } from '../../types';
import { Zap, HelpCircle, ArrowRight, Check, Gauge, Sparkles, Activity } from 'lucide-react';
import { audioService } from '../../services/audioService';
import { fireGrandCelebration } from '../../utils/confettiHelper';

interface StagePracticeGrade8Props {
  practice: LessonPractice;
  ally: AntAlly;
  onSuccess: () => void;
  onRequestHint: (stage: number, userChoice: string) => void;
}

export const StagePracticeGrade8: React.FC<StagePracticeGrade8Props> = ({
  practice,
  ally,
  onSuccess,
  onRequestHint,
}) => {
  const physicsData = practice.physicsData || {
    riderMassKg: 65,
    sandBearingLimitPa: 140000,
    tires: [
      {
        id: 'road_narrow',
        name: 'Lốp Road Đua (25mm)',
        widthMm: 25,
        contactAreaCm2: 45,
        treadType: 'smooth' as const,
        frictionCoeff: 0.28,
        description: 'Lốp trơn, diện tích tiếp xúc rất nhỏ.',
      },
      {
        id: 'gravel_medium',
        name: 'Lốp Gravel Địa Hình (45mm)',
        widthMm: 45,
        contactAreaCm2: 85,
        treadType: 'grooved' as const,
        frictionCoeff: 0.52,
        description: 'Gai nhỏ, diện tích tiếp xúc trung bình.',
      },
      {
        id: 'fatbike_wide',
        name: 'Lốp Béo Fat-Tire (100mm)',
        widthMm: 100,
        contactAreaCm2: 190,
        treadType: 'deep_lug' as const,
        frictionCoeff: 0.78,
        description: 'Bản siêu rộng, diện tích tiếp xúc cực lớn trên cát.',
      },
    ],
  };

  const [selectedTireId, setSelectedTireId] = useState<string>('road_narrow');
  const [tirePsi, setTirePsi] = useState<number>(35); // 15 to 60 PSI
  const [tested, setTested] = useState<boolean>(false);
  const [attemptCount, setAttemptCount] = useState<number>(0);

  const currentTire = physicsData.tires.find((t) => t.id === selectedTireId) || physicsData.tires[0];

  // Dynamic Contact Area calculation based on tire width & PSI deflation
  // Lower PSI increases tire deformation area
  const psiDeflationFactor = (60 - tirePsi) / 60; // 0 (stiff) to ~0.75 (soft)
  const effectiveAreaCm2PerTire = currentTire.contactAreaCm2 * (1 + psiDeflationFactor * 0.6);
  // Total contact area for both tires in m^2
  const totalAreaM2 = (effectiveAreaCm2PerTire * 2) / 10000;

  // Total force F = m * g = 65 * 9.8 ~ 637 N
  const totalForceN = physicsData.riderMassKg * 9.8;

  // Pressure p = F / S (Pa)
  const calculatedPressurePa = Math.round(totalForceN / totalAreaM2);
  const calculatedPressureKPa = (calculatedPressurePa / 1000).toFixed(1);

  // Sinking depth calculation based on pressure exceeding sand limit (140 kPa)
  const excessRatio = calculatedPressurePa / physicsData.sandBearingLimitPa;
  const sinkingDepthCm = excessRatio > 1 ? Math.min(10, ((excessRatio - 1) * 7.5 + 1.2)).toFixed(1) : (0.4).toFixed(1);

  const isSandTraversable = calculatedPressurePa < physicsData.sandBearingLimitPa && currentTire.frictionCoeff >= 0.5;

  const handleRunSimulation = () => {
    setTested(true);
    setAttemptCount((c) => c + 1);

    if (isSandTraversable) {
      audioService.playCelebrationBurst();
      fireGrandCelebration();
    } else {
      audioService.playBoingPop();
      audioService.playHintChime();
      onRequestHint(
        attemptCount >= 1 ? 2 : 1,
        `Lốp: ${currentTire.name}, Áp suất: ${calculatedPressureKPa} kPa, Lún: ${sinkingDepthCm} cm`
      );
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Practice Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm">
              2
            </span>
            <span className="font-extrabold text-stone-900 tracking-tight text-base sm:text-lg">
              CHẶNG 2: MÔ PHỎNG VẬT LÍ KHTN 8 (PRACTICE)
            </span>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> Thí nghiệm Đồi Cát Mũi Né
          </span>
        </div>

        <p className="text-sm text-stone-600 leading-relaxed">
          {practice.instructions}
        </p>

        {/* Physics Formula Box */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              p
            </div>
            <div>
              <div className="text-xs font-bold text-blue-900">Công thức Áp suất Chất rắn:</div>
              <div className="font-mono text-base font-black text-blue-950">
                p = F / S = (m · g) / S
              </div>
            </div>
          </div>
          <div className="text-xs text-blue-800 font-medium bg-white/80 px-3 py-1.5 rounded-xl border border-blue-200">
            Giới hạn chịu lực của cát rời Mũi Né: <strong className="text-blue-950">140 kPa</strong>
          </div>
        </div>

        {/* Interactive Tire & PSI Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tire Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
              1. Chọn Loại Lốp Xe:
            </label>
            <div className="space-y-2">
              {physicsData.tires.map((tire) => (
                <button
                  key={tire.id}
                  onClick={() => {
                    audioService.playClick();
                    setSelectedTireId(tire.id);
                    setTested(false);
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                    selectedTireId === tire.id
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300 shadow-sm'
                      : 'bg-white hover:bg-stone-50 border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-stone-900">{tire.name}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                      Bản rộng: {tire.widthMm}mm
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">{tire.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* PSI Slider & Live Telemetry */}
          <div className="space-y-4 bg-stone-50 p-5 rounded-2xl border border-stone-200">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1">
                <span>2. Áp Suất Bơm Lốp (PSI):</span>
                <span className="text-blue-700 font-extrabold">{tirePsi} PSI</span>
              </div>
              <input
                type="range"
                min="12"
                max="60"
                value={tirePsi}
                onChange={(e) => {
                  setTirePsi(Number(e.target.value));
                  setTested(false);
                }}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                <span>12 PSI (Mềm, lốp bè rộng)</span>
                <span>60 PSI (Cực căng, diện tích nhỏ)</span>
              </div>
            </div>

            {/* Calculated Physical Metrics */}
            <div className="pt-2 border-t border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Diện tích tiếp xúc (S):</span>
                <span className="font-mono font-bold text-stone-800">
                  {(totalAreaM2 * 10000).toFixed(0)} cm² ({totalAreaM2.toFixed(4)} m²)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Áp lực đè xuống (F):</span>
                <span className="font-mono font-bold text-stone-800">{totalForceN.toFixed(0)} N</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="font-bold text-stone-700">Áp suất thực tế (p):</span>
                <span
                  className={`font-mono text-base font-black px-2 py-0.5 rounded-lg ${
                    Number(calculatedPressureKPa) < 140
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {calculatedPressureKPa} kPa
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Dune Cross-Section Simulation */}
        <div className="bg-gradient-to-b from-sky-100 to-amber-100/60 p-6 rounded-2xl border border-amber-200 relative overflow-hidden">
          <div className="text-xs font-bold text-stone-700 mb-3 flex items-center justify-between">
            <span>Mô phỏng mặt cắt Đồi cát Mũi Né:</span>
            <span className="text-stone-500 font-normal">
              Độ lún cát: <strong className="text-stone-800">{sinkingDepthCm} cm</strong>
            </span>
          </div>

          <div className="relative h-28 flex items-end justify-center">
            {/* Sand Layer Ground */}
            <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400 rounded-b-xl border-t-2 border-amber-500/60">
              <div className="text-[10px] text-amber-900/60 font-mono px-3 py-1">
                Lớp cát rời rạc (Ngưỡng lún 140 kPa)
              </div>
            </div>

            {/* Bicycle Wheel Representation */}
            <div
              className="relative transition-all duration-300 flex flex-col items-center"
              style={{
                transform: `translateY(${Math.min(35, Number(sinkingDepthCm) * 3.5)}px)`,
              }}
            >
              {/* Wheel circle */}
              <div
                className={`rounded-full border-4 flex items-center justify-center transition-all ${
                  selectedTireId === 'fatbike_wide'
                    ? 'w-20 h-20 border-stone-800 bg-stone-700'
                    : selectedTireId === 'gravel_medium'
                    ? 'w-16 h-16 border-stone-700 bg-stone-600'
                    : 'w-14 h-14 border-stone-900 bg-stone-800'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-stone-400" />
              </div>
              <span className="text-[11px] font-extrabold text-stone-800 mt-1 bg-white/80 px-2 py-0.5 rounded shadow-xs">
                {currentTire.name.split('(')[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: Test Configuration */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            onClick={() => {
              audioService.playClick();
              onRequestHint(1, `Thử nghiệm p=${calculatedPressureKPa} kPa`);
            }}
            className="text-xs text-blue-700 font-semibold hover:underline flex items-center gap-1"
          >
            <HelpCircle className="w-4 h-4" /> Tham vấn Kiến Con
          </button>

          <button
            onClick={handleRunSimulation}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Gauge className="w-4 h-4" />
            <span>Thực Nghiệm Chạy Thử Trên Cát</span>
          </button>
        </div>

        {/* Test Result Message */}
        {tested && (
          <div
            className={`p-5 rounded-2xl border text-sm font-medium flex items-start gap-3 animate-fadeIn ${
              isSandTraversable
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            <div className="text-2xl flex-shrink-0">⚡</div>
            <div className="space-y-1">
              <h5 className="font-bold">
                {isSandTraversable
                  ? 'Tuyệt vời! Xe lướt êm ái vượt đồi cát Mũi Né!'
                  : 'Cảnh báo lún cát từ Kiến Con:'}
              </h5>
              <p className="leading-relaxed text-xs sm:text-sm">
                {isSandTraversable
                  ? `Nhờ bản lốp rộng ${currentTire.widthMm}mm và áp suất ${tirePsi} PSI, diện tích tiếp xúc tăng lên ${(totalAreaM2 * 10000).toFixed(0)} cm², kéo áp suất p xuống chỉ còn ${calculatedPressureKPa} kPa (dưới ngưỡng 140 kPa). Xe không bị lún!`
                  : `Áp suất hiện tại ${calculatedPressureKPa} kPa đã vượt ngưỡng chịu lực của cát (140 kPa), khiến bánh xe bị lún sâu ${sinkingDepthCm}cm. Hãy tăng diện tích tiếp xúc S bằng lốp bản rộng hơn hoặc giảm bớt PSI!`}
              </p>
            </div>
          </div>
        )}

        {/* Next Stage Navigation */}
        <div className="pt-4 flex justify-between items-center border-t border-stone-100">
          <span className="text-xs text-stone-400">
            {isSandTraversable ? 'Hoàn thành thử thách vật lí!' : 'Đạt thông số an toàn (p < 140 kPa) để mở khóa Chặng 3'}
          </span>
          <button
            onClick={() => {
              audioService.playClick();
              onSuccess();
            }}
            disabled={!isSandTraversable}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm text-white transition-all shadow-md active:scale-95 ${
              isSandTraversable
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
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
};
