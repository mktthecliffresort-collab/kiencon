import React, { useState } from 'react';
import { Lesson, Subject, UserProfile, KHTNDomain } from '../types';
import { ALLIES } from '../data/mockData';
import { Clock, Award, Play, CheckCircle, Sparkles, BookOpen, Compass, List } from 'lucide-react';
import { audioService } from '../services/audioService';
import { DragScrollContainer } from './DragScrollContainer';
import { AntLearningPath } from './AntLearningPath';

interface LessonListViewProps {
  lessons: Lesson[];
  subject: Subject | null;
  selectedDomain?: KHTNDomain;
  user: UserProfile;
  onStartLesson: (lesson: Lesson) => void;
  onOpenRiddles?: () => void;
  onOpenArena?: () => void;
}

export const LessonListView: React.FC<LessonListViewProps> = ({
  lessons,
  subject,
  selectedDomain,
  user,
  onStartLesson,
  onOpenRiddles,
  onOpenArena,
}) => {
  const [viewMode, setViewMode] = useState<'path' | 'list'>('path');
  const [selectedThemeFilter, setSelectedThemeFilter] = useState<string>('all');

  // Filter lessons by domain if KHTN Grade 8, and by theme if selected
  const filteredLessons = lessons.filter((lesson) => {
    if (subject?.isIntegrated && selectedDomain) {
      if (lesson.domainBranch !== selectedDomain) return false;
    }
    if (selectedThemeFilter !== 'all') {
      if (!lesson.unit.includes(selectedThemeFilter)) return false;
    }
    return true;
  });

  const themes = [
    { id: 'all', label: 'Tất cả' },
    { id: 'Chủ đề 1', label: 'CĐ 1: Ôn tập' },
    { id: 'Chủ đề 2', label: 'CĐ 2: Số thập phân' },
    { id: 'Chủ đề 3', label: 'CĐ 3: Đo diện tích' },
    { id: 'Chủ đề 4', label: 'CĐ 4: Phép tính STP' },
    { id: 'Chủ đề 5', label: 'CĐ 5: Hình phẳng' },
    { id: 'Chủ đề 6', label: 'CĐ 6: Ôn tập HK1' },
  ];

  if (!subject) {
    return null;
  }

  // If path mode is active, render Sinuous Ant Path component
  if (viewMode === 'path') {
    return (
      <AntLearningPath
        lessons={lessons}
        subject={subject}
        selectedDomain={selectedDomain}
        user={user}
        onStartLesson={onStartLesson}
        onOpenRiddles={onOpenRiddles}
        onOpenArena={onOpenArena}
        onSwitchViewToList={() => setViewMode('list')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Subject Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              {subject.code}
            </span>
            <span className="text-xs font-semibold text-stone-500">
              Chương trình Lớp {subject.grade}
            </span>
            <button
              onClick={() => {
                audioService.playBoingPop();
                setViewMode('path');
              }}
              className="flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300 hover:bg-emerald-100 transition-all"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Bản đồ hành trình 🐜</span>
            </button>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900">{subject.name}</h2>
          <p className="text-sm text-stone-600 max-w-2xl">{subject.description}</p>
        </div>

        <div className="flex items-center gap-4 bg-stone-50 rounded-2xl p-4 border border-stone-200/80 self-start md:self-auto">
          <div className="text-right">
            <div className="text-xs text-stone-500 font-medium">Mức độ thành thạo</div>
            <div className="text-2xl font-black text-stone-900">
              {user.subjectMastery[subject.id] || 0}%
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 flex items-center justify-center font-bold text-xs text-amber-700">
            {user.completedLessons.filter((id) => id.includes(subject.id)).length}/
            {filteredLessons.length || 1}
          </div>
        </div>
      </div>


      {/* Lesson List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-lg text-stone-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            Khởi động: Các bài học trọng tâm SGK
          </h3>
          <span className="text-xs text-stone-500 font-medium">
            {filteredLessons.length} bài học khả dụng
          </span>
        </div>

        {/* If Grade 5 Math: Textbook Units Filter Bar */}
        {subject.id === 'toan_5' && (
          <DragScrollContainer
            id="lesson-theme-filter-drag"
            fadeColorClass="from-stone-50"
            className="mb-4"
          >
            <div className="flex items-center gap-2 pb-2 px-1">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  id={`theme-btn-${theme.id}`}
                  onClick={() => {
                    audioService.playBoingPop();
                    setSelectedThemeFilter(theme.id);
                  }}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all active:translate-y-1 ${
                    selectedThemeFilter === theme.id
                      ? 'bg-amber-500 text-white border-b-4 border-amber-700 shadow-md scale-105'
                      : 'bg-white text-stone-700 hover:bg-amber-50 border-2 border-stone-200'
                  }`}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </DragScrollContainer>
        )}

        {filteredLessons.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border-3 border-dashed border-amber-300 p-8 shadow-sm">
            <div className="text-5xl mb-3 animate-bounce-short">🐜</div>
            <h4 className="font-black text-stone-900 text-lg sm:text-xl">Bài học đang được chuẩn bị!</h4>
            <p className="text-sm font-bold text-stone-600 mt-2 max-w-md mx-auto">
              Kiến Con đang chuẩn bị các thử thách mới. Bạn hãy thử chọn môn học khác hoặc làm các bài luyện tập nhé!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredLessons.map((lesson) => {
              const isCompleted = user.completedLessons.includes(lesson.id);
              const ally = ALLIES[lesson.allyId] || ALLIES.kien;

              const lessonEmoji =
                lesson.domainBranch === 'vat_li'
                  ? '⚡'
                  : lesson.domainBranch === 'hoa_hoc'
                  ? '🧪'
                  : lesson.domainBranch === 'sinh_hoc'
                  ? '🌱'
                  : subject.icon;

              return (
                <div
                  key={lesson.id}
                  className={`group relative bg-white rounded-3xl p-5 sm:p-7 border-3 transition-all hover:shadow-lg overflow-hidden ${
                    isCompleted
                      ? 'border-emerald-300 bg-gradient-to-br from-white via-emerald-50/20 to-white'
                      : 'border-stone-200 hover:border-amber-400'
                  }`}
                >
                  {/* Soft, non-distracting background motif */}
                  <div className="absolute -right-4 -bottom-4 text-7xl select-none pointer-events-none opacity-[0.06] group-hover:opacity-[0.12] transition-opacity">
                    {lessonEmoji}
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
                    {/* Left: Info & Unit */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          {lesson.unit}
                        </span>
                        {lesson.domainBranch && (
                          <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300">
                            {lesson.domainBranch === 'vat_li'
                              ? '⚡ Vật lí'
                              : lesson.domainBranch === 'hoa_hoc'
                              ? '🧪 Hóa học'
                              : '🌱 Sinh học'}
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-emerald-600" /> Đã Hoàn Thành ⭐
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xl sm:text-2xl font-black text-stone-950 group-hover:text-amber-600 transition-colors">
                          {lesson.title}
                        </h4>
                        <p className="text-sm sm:text-base font-bold text-stone-600 mt-1 leading-snug">
                          {lesson.subtitle}
                        </p>
                      </div>

                      {/* 4-Stage Learning Loop Micro-Pills */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs font-black">
                        <span className="px-2.5 py-1 rounded-xl bg-sky-100 text-sky-900">
                          1️⃣ Khám Phá
                        </span>
                        <span className="text-stone-300">→</span>
                        <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900">
                          2️⃣ Luyện Tập
                        </span>
                        <span className="text-stone-300">→</span>
                        <span className="px-2.5 py-1 rounded-xl bg-orange-100 text-orange-900">
                          3️⃣ Vận Dụng
                        </span>
                        <span className="text-stone-300">→</span>
                        <span className="px-2.5 py-1 rounded-xl bg-purple-100 text-purple-900">
                          4️⃣ Giảng Lại (AI)
                        </span>
                      </div>
                    </div>

                    {/* Right: Ally avatar, rewards & Action Button */}
                    <div className="flex items-center justify-between lg:justify-end gap-4 border-t-2 lg:border-t-0 pt-4 lg:pt-0 border-stone-100 flex-wrap sm:flex-nowrap">
                      {/* Ally badge */}
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-12 h-12 rounded-2xl ${ally.avatarColor} text-white flex items-center justify-center text-2xl shadow-md border-2 border-white`}
                          title={`Bạn đồng hành: ${ally.name}`}
                        >
                          {ally.icon}
                        </div>
                        <div className="text-left">
                          <div className="text-[10px] uppercase tracking-wider text-stone-400 font-black">Đồng hành</div>
                          <div className="text-xs sm:text-sm font-black text-stone-900">{ally.name}</div>
                        </div>
                      </div>

                      {/* Meta stats */}
                      <div className="flex items-center gap-2 text-xs font-black">
                        <span className="flex items-center gap-1 bg-stone-100 px-2.5 py-1.5 rounded-xl text-stone-700">
                          <Clock className="w-4 h-4 text-stone-500" />
                          {lesson.estimatedMinutes}p
                        </span>
                        <span className="flex items-center gap-1 text-amber-900 bg-amber-100 px-2.5 py-1.5 rounded-xl border border-amber-300">
                          <Award className="w-4 h-4 text-amber-600" />
                          +{lesson.xpReward} XP
                        </span>
                      </div>

                      {/* Launch button */}
                      <button
                        onClick={() => {
                          audioService.playBoingPop();
                          onStartLesson(lesson);
                        }}
                        className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm sm:text-base transition-all active:translate-y-1 active:border-b-0 ${
                          isCompleted
                            ? 'bg-stone-800 hover:bg-stone-900 text-white border-b-4 border-black shadow-md'
                            : lesson.grade === 5
                            ? 'bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 border-b-4 border-amber-700 shadow-md'
                            : 'bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-b-4 border-blue-800 shadow-md'
                        }`}
                      >
                        <Play className="w-5 h-5 fill-current" />
                        <span>{isCompleted ? 'Ôn Tập Lại' : 'Khám Phá Ngay'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
