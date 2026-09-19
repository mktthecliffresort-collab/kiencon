import React from 'react';
import { Subject, KHTNDomain, GradeLevel } from '../types';
import {
  Calculator,
  Languages,
  FlaskConical,
  Compass,
  Cpu,
  Atom,
  Binary,
  Globe,
  Wrench,
  Terminal,
  Zap,
  FlaskRound,
  Leaf,
  Layers,
} from 'lucide-react';
import { audioService } from '../services/audioService';
import { DragScrollContainer } from './DragScrollContainer';

interface SubjectNavProps {
  subjects: Subject[];
  selectedSubjectId: string;
  onSelectSubject: (subjectId: string) => void;
  selectedDomain?: KHTNDomain;
  onSelectDomain?: (domain: KHTNDomain) => void;
  grade: GradeLevel;
  subjectMastery: Record<string, number>;
}

const ICONS_MAP: Record<string, React.ReactNode> = {
  Calculator: <Calculator className="w-5 h-5" />,
  Languages: <Languages className="w-5 h-5" />,
  FlaskConical: <FlaskConical className="w-5 h-5" />,
  Compass: <Compass className="w-5 h-5" />,
  Cpu: <Cpu className="w-5 h-5" />,
  Atom: <Atom className="w-5 h-5" />,
  Binary: <Binary className="w-5 h-5" />,
  Globe: <Globe className="w-5 h-5" />,
  Wrench: <Wrench className="w-5 h-5" />,
  Terminal: <Terminal className="w-5 h-5" />,
};

export const SubjectNav: React.FC<SubjectNavProps> = ({
  subjects,
  selectedSubjectId,
  onSelectSubject,
  selectedDomain,
  onSelectDomain,
  grade,
  subjectMastery,
}) => {
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="space-y-4">
      {/* Subject Chips / Draggable Tabs Bar */}
      <DragScrollContainer
        id="subject-nav-drag-container"
        fadeColorClass="from-stone-50"
        innerClassName="py-1"
      >
        <div className="flex items-center gap-2.5 pb-2 px-1">
          {subjects.map((subj) => {
            const isSelected = subj.id === selectedSubjectId;
            const mastery = subjectMastery[subj.id] || 0;

            // Playful subject theme colors
            const themeClass =
              subj.id.startsWith('toan')
                ? isSelected
                  ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-amber-950 border-b-4 border-amber-700 shadow-md scale-105'
                  : 'bg-white text-stone-800 hover:bg-amber-50 border-2 border-amber-200'
                : subj.id.startsWith('khtn')
                ? isSelected
                  ? 'bg-gradient-to-b from-emerald-400 to-emerald-500 text-emerald-950 border-b-4 border-emerald-700 shadow-md scale-105'
                  : 'bg-white text-stone-800 hover:bg-emerald-50 border-2 border-emerald-200'
                : subj.id.startsWith('ls')
                ? isSelected
                  ? 'bg-gradient-to-b from-orange-400 to-orange-500 text-orange-950 border-b-4 border-orange-700 shadow-md scale-105'
                  : 'bg-white text-stone-800 hover:bg-orange-50 border-2 border-orange-200'
                : isSelected
                ? 'bg-gradient-to-b from-sky-400 to-sky-500 text-sky-950 border-b-4 border-sky-700 shadow-md scale-105'
                : 'bg-white text-stone-800 hover:bg-sky-50 border-2 border-sky-200';

            return (
              <button
                key={subj.id}
                id={`subject-tab-${subj.id}`}
                onClick={() => {
                  audioService.playBoingPop();
                  onSelectSubject(subj.id);
                }}
                className={`relative overflow-hidden flex-shrink-0 flex items-center gap-3 px-4 sm:px-5 py-3 rounded-2xl font-black text-sm sm:text-base transition-all active:translate-y-1 ${themeClass}`}
              >
                {/* Subtle soft illustrated decorative background pattern */}
                <span className="absolute -right-2 -bottom-2 text-3xl opacity-15 pointer-events-none select-none">
                  {subj.id.startsWith('toan') ? '📐' : subj.id.startsWith('khtn') ? '🔬' : subj.id.startsWith('ls') ? '🧭' : '📖'}
                </span>
                <span className={`relative z-10 text-xl p-1.5 rounded-xl ${isSelected ? 'bg-white/30' : 'bg-stone-100'}`}>
                  {ICONS_MAP[subj.iconName] || <Layers className="w-5 h-5" />}
                </span>
                <div className="relative z-10 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="tracking-tight">{subj.name}</span>
                    {subj.isIntegrated && (
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-white/40 text-stone-900' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        Tích hợp
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold opacity-90">
                    <span>⭐ {mastery}% Hoàn thành</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </DragScrollContainer>

      {/* SPECIAL REQUIREMENT FOR GRADE 8 KHTN: Domain Branches (⚡ Vật lí, 🧪 Hóa học, 🌱 Sinh học) */}
      {grade === 8 && selectedSubject?.isIntegrated && selectedSubject.domainBranches && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 border border-blue-200/80 rounded-2xl p-4 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Atom className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm sm:text-base text-blue-950">
                  Cấu trúc Môn Tích hợp KHTN 8
                </h3>
              </div>
              <p className="text-xs text-blue-800/80 mt-0.5">
                Vật lí, Hóa học và Sinh học gắn kết chặt chẽ trong một môn học duy nhất. Chọn môn học để khám phá bài học:
              </p>
            </div>
            <span className="text-[11px] font-semibold text-blue-700 bg-white/80 px-2.5 py-1 rounded-full border border-blue-200 self-start sm:self-auto">
              Chuẩn liên môn
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {selectedSubject.domainBranches.map((branch) => {
              const isBranchActive = selectedDomain === branch.id;
              const branchIcon =
                branch.id === 'vat_li' ? (
                  <Zap className="w-4 h-4 text-amber-500" />
                ) : branch.id === 'hoa_hoc' ? (
                  <FlaskRound className="w-4 h-4 text-purple-500" />
                ) : (
                  <Leaf className="w-4 h-4 text-emerald-500" />
                );

              return (
                <button
                  key={branch.id}
                  onClick={() => {
                    audioService.playClick();
                    onSelectDomain?.(branch.id);
                  }}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                    isBranchActive
                      ? 'bg-white border-blue-500 shadow-sm ring-2 ring-blue-400/40 text-blue-950'
                      : 'bg-white/60 hover:bg-white border-blue-200/60 text-stone-700'
                  }`}
                >
                  <div className="mt-0.5 p-1 rounded-lg bg-stone-100">{branchIcon}</div>
                  <div>
                    <span className="font-bold text-xs sm:text-sm block">{branch.name}</span>
                    <span className="text-[11px] text-stone-500 line-clamp-1">{branch.description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
