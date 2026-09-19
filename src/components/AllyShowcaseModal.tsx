import React from 'react';
import { ALLIES } from '../data/mockData';
import { GradeLevel } from '../types';
import { Sparkles, X, Shield, BookOpen } from 'lucide-react';
import { audioService } from '../services/audioService';
import { fireButtonParticleBurst } from '../utils/confettiHelper';

interface AllyShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade: GradeLevel;
}

export const AllyShowcaseModal: React.FC<AllyShowcaseModalProps> = ({
  isOpen,
  onClose,
  grade,
}) => {
  if (!isOpen) return null;

  const alliesList = Object.values(ALLIES);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-stone-200 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            audioService.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐜</span>
            <h3 className="font-extrabold text-stone-900 text-xl sm:text-2xl">
              Vũ Trụ Đồng Hành "KIẾN HỌC"
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-stone-500">
            {grade === 5
              ? 'Gặp gỡ Kiến Con và những người bạn kiến thông thái trong tổ kiến tri thức!'
              : 'Hệ sinh thái đồng hành nghiên cứu và chinh phục kiến thức thú vị.'}
          </p>
        </div>

        {/* Tone Adaptation Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 text-xs text-stone-700 space-y-1">
          <div className="font-bold text-amber-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Cơ chế Thích ứng Độ tuổi (Adaptive Tone System):</span>
          </div>
          <p className="leading-relaxed">
            {grade === 5 ? (
              <>
                <strong className="text-amber-800">Lớp 5 (Kiến Con):</strong> Giọng điệu ấm áp, vui nhộn, giàu tính phiêu lưu, khích lệ tự tin. Không bao giờ dùng từ "Sai" để tránh làm nản lòng bạn học sinh.
              </>
            ) : (
              <>
                <strong className="text-blue-800">Lớp 8 (Kiến Con):</strong> Sắc sảo, ngôn từ chính xác, chú trọng tư duy phản biện, định luật tự nhiên và ứng dụng kỹ thuật thực tiễn.
              </>
            )}
          </p>
        </div>

        {/* Allies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {alliesList.map((ally) => (
            <div
              key={ally.id}
              className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 hover:border-amber-300 transition-colors space-y-2.5"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl ${ally.avatarColor} text-white flex items-center justify-center text-2xl shadow-xs`}
                >
                  {ally.icon}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-900 leading-tight">{ally.name}</h4>
                  <span className="text-[11px] font-semibold text-stone-500 block">{ally.role}</span>
                </div>
              </div>

              <div className="text-xs font-bold text-amber-700 bg-white px-2.5 py-1 rounded-lg border border-stone-200/60 inline-block">
                {ally.domain}
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                {ally.description}
              </p>

              <blockquote className="text-[11px] text-stone-500 italic border-l-2 border-stone-300 pl-2">
                "{ally.quote}"
              </blockquote>

              <button
                type="button"
                onClick={(e) => {
                  audioService.playTinhTong();
                  fireButtonParticleBurst(e);
                }}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-white hover:bg-amber-50 text-amber-900 border border-amber-200/90 hover:border-amber-400 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
              >
                <span>✨ Chào {ally.name}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
