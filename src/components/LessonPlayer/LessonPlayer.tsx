import React, { useState } from 'react';
import { Lesson, Subject, UserProfile, AntAlly } from '../../types';
import { ALLIES } from '../../data/alliesData';
import { StageDiscover } from './StageDiscover';
import { StagePracticeGrade5 } from './StagePracticeGrade5';
import { StagePracticeGrade8 } from './StagePracticeGrade8';
import { StagePracticeMatching } from './StagePracticeMatching';
import { StageApply } from './StageApply';
import { StageTeachBack } from './StageTeachBack';
import { SocraticHintModal } from './SocraticHintModal';
import { LessonSuccessModal } from './LessonSuccessModal';
import { SocraticTutorWidget } from './SocraticTutorWidget';
import { geminiService } from '../../services/geminiService';
import { audioService } from '../../services/audioService';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

interface LessonPlayerProps {
  lesson: Lesson;
  subject: Subject;
  user: UserProfile;
  onClose: () => void;
  onLessonComplete: (lessonId: string, subjectId: string, xpEarned: number, masteryDelta: number) => void;
}

export const LessonPlayer: React.FC<LessonPlayerProps> = ({
  lesson,
  subject,
  user,
  onClose,
  onLessonComplete,
}) => {
  const [currentStage, setCurrentStage] = useState<number>(1); // 1: Discover, 2: Practice, 3: Apply, 4: Teach-Back
  const [leaves, setLeaves] = useState<number>(5);
  const [hintModalOpen, setHintModalOpen] = useState<boolean>(false);
  const [hintStage, setHintStage] = useState<number>(1);
  const [hintText, setHintText] = useState<string>('');
  const [hintClueWord, setHintClueWord] = useState<string>('');
  const [userAttempt, setUserAttempt] = useState<string>('');
  const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);
  const [earnedBadge, setEarnedBadge] = useState<string>('');
  const [evaluationScore, setEvaluationScore] = useState<number>(85);
  // Default closed on mobile screens to prevent blocking bottom lesson controls, open on desktop
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  );

  const ally: AntAlly = ALLIES[lesson.allyId] || ALLIES.kien;

  const getQuestionContext = () => {
    switch (currentStage) {
      case 1:
        return `Khám phá câu chuyện: "${lesson.discover.storyTitle}". Câu hỏi mở đầu: "${lesson.discover.promptQuestion}". Bối cảnh thực tế: "${lesson.discover.realWorldContext}".`;
      case 2:
        return `Thực hành tương tác: "${lesson.practice.challengeTitle}". Nhiệm vụ: "${lesson.practice.instructions}".`;
      case 3:
        return `Tình huống vận dụng thực tế: "${lesson.apply.dilemmaTitle}". Tình huống: "${lesson.apply.situation}". Thách thức: "${lesson.apply.question}".`;
      case 4:
        return `Thử thách giảng lại (Teach-Back): "${lesson.teachBack.promptTitle}". Câu hỏi định hướng: "${lesson.teachBack.guidingQuestion}".`;
      default:
        return `Bài học: ${lesson.title}`;
    }
  };

  // Socratic Hint request handler
  const handleRequestHint = async (stage: number, currentAttemptValue: string) => {
    setHintStage(stage);
    setUserAttempt(currentAttemptValue);
    setIsTutorOpen(true);

    // Initial fallback while fetching
    const fallbackText =
      stage === 2
        ? lesson.grade === 5
          ? lesson.practice.hintStage2
          : lesson.practice.hintStage2
        : lesson.practice.hintStage1;

    setHintText(fallbackText);
    setHintModalOpen(true);

    try {
      const hintRes = await geminiService.getSocraticHint({
        grade: lesson.grade,
        subject: subject.name,
        question: lesson.discover.promptQuestion,
        currentAttempt: currentAttemptValue,
        stage,
      });

      if (hintRes && hintRes.antSpeech) {
        setHintText(hintRes.antSpeech);
        setHintClueWord(hintRes.clueWord || '');
      }
    } catch (e) {
      console.warn('Hint fetch fallback used', e);
    }
  };

  const handleFinishLesson = (score: number, badge: string) => {
    setEvaluationScore(score);
    setEarnedBadge(badge);
    setSuccessModalOpen(true);
  };

  const handleCompleteAndClose = () => {
    setSuccessModalOpen(false);
    onLessonComplete(lesson.id, subject.id, lesson.xpReward, 15);
  };

  const stagesList = [
    { num: 1, title: 'Khám Phá' },
    { num: 2, title: 'Mô Phỏng' },
    { num: 3, title: 'Vận Dụng' },
    { num: 4, title: 'Giảng Lại' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-stone-100 overflow-y-auto soft-scrollbar flex flex-col">
      {/* Top sticky navigation bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-stone-200 px-3 sm:px-8 py-3 flex items-center justify-between gap-2">
        <button
          onClick={() => {
            audioService.playClick();
            onClose();
          }}
          className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 font-bold text-xs sm:text-sm px-2.5 py-1.5 rounded-xl hover:bg-stone-100 transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Thoát bài học</span>
          <span className="sm:hidden">Thoát</span>
        </button>

        {/* 4-Stage Step Stepper & Duolingo Progress Capsule */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2">
            {stagesList.map((step) => {
              const isDone = currentStage > step.num;
              const isCurrent = currentStage === step.num;

              return (
                <div key={step.num} className="flex items-center gap-1">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm transition-all ${
                      isCurrent
                        ? 'bg-amber-500 text-white shadow-md border-b-2 border-amber-700'
                        : isDone
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4 stroke-[3]" /> : step.num}
                  </div>
                  <span
                    className={`text-xs hidden md:inline font-bold ${
                      isCurrent ? 'text-stone-900' : 'text-stone-400'
                    }`}
                  >
                    {step.title}
                  </span>
                  {step.num < 4 && <span className="text-stone-300 text-xs hidden sm:inline">→</span>}
                </div>
              );
            })}
          </div>

          {/* Progress Pill Bar */}
          <div className="hidden sm:block w-20 md:w-28 bg-stone-200 h-2.5 rounded-full overflow-hidden p-0.5 border border-stone-300/60">
            <div
              className="bg-gradient-to-r from-amber-400 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(currentStage / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Right side controls: 5 Leaves + Tutor toggle + Ally badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 5 Energy Leaves (🍃 Lá Sinh Mệnh) */}
          <div 
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-black text-xs shadow-2xs select-none"
            title="5 Lá Sinh Mệnh Vương Quốc - Giúp bạn kiên trì thử thách"
          >
            <span className="text-sm animate-leaf-flutter inline-block">🍃</span>
            <span>{leaves}/5</span>
          </div>

          <button
            id="header-toggle-socratic-tutor"
            onClick={() => {
              audioService.playClick();
              setIsTutorOpen(!isTutorOpen);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all border ${
              isTutorOpen
                ? lesson.grade === 5
                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                  : 'bg-blue-100 text-blue-900 border-blue-300 shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
            }`}
            title="Bấm vào chú Kiến vẫy chào để mở gia sư Socratic"
          >
            <span className="text-base inline-block animate-wiggle">🐜</span>
            <span className="text-xs">👋</span>
            <span className="hidden sm:inline">Hỏi Kiến Con</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {/* Ally badge */}
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl ${ally.avatarColor} text-white flex items-center justify-center text-sm shadow-2xs`}
            >
              {ally.icon}
            </div>
            <span className="text-xs font-bold text-stone-700 hidden sm:inline">
              {ally.name.split(' ')[0]}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area & Socratic Tutor Beside Lesson */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 sm:pb-12 flex flex-col lg:flex-row gap-6 items-start">
        <main className="flex-1 w-full min-w-0">
          {currentStage === 1 && (
            <StageDiscover
              discover={lesson.discover}
              ally={ally}
              grade={lesson.grade}
              onContinue={() => setCurrentStage(2)}
            />
          )}

          {currentStage === 2 && (
            lesson.practice.type === 'matching' ? (
              <StagePracticeMatching
                practice={lesson.practice}
                ally={ally}
                onSuccess={() => setCurrentStage(3)}
                onRequestHint={handleRequestHint}
              />
            ) : lesson.grade === 5 ? (
              <StagePracticeGrade5
                practice={lesson.practice}
                ally={ally}
                onSuccess={() => setCurrentStage(3)}
                onRequestHint={handleRequestHint}
              />
            ) : (
              <StagePracticeGrade8
                practice={lesson.practice}
                ally={ally}
                onSuccess={() => setCurrentStage(3)}
                onRequestHint={handleRequestHint}
              />
            )
          )}

          {currentStage === 3 && (
            <StageApply
              apply={lesson.apply}
              ally={ally}
              grade={lesson.grade}
              onSuccess={() => setCurrentStage(4)}
              onRequestHint={handleRequestHint}
            />
          )}

          {currentStage === 4 && (
            <StageTeachBack
              teachBack={lesson.teachBack}
              ally={ally}
              grade={lesson.grade}
              subjectName={subject.name}
              lessonTitle={lesson.title}
              onFinishLesson={handleFinishLesson}
            />
          )}
        </main>

        {/* Expandable Socratic AI Tutor Widget */}
        <SocraticTutorWidget
          grade={lesson.grade}
          subjectName={subject.name}
          currentTopic={lesson.title}
          questionContext={getQuestionContext()}
          ally={ally}
          isOpen={isTutorOpen}
          onToggle={() => setIsTutorOpen(!isTutorOpen)}
        />
      </div>

      {/* Socratic Hint Dialog */}
      <SocraticHintModal
        isOpen={hintModalOpen}
        onClose={() => setHintModalOpen(false)}
        grade={lesson.grade}
        stage={hintStage}
        hintText={hintText}
        clueWord={hintClueWord}
        userAttempt={userAttempt}
      />

      {/* Completion & Reward Dialog */}
      <LessonSuccessModal
        isOpen={successModalOpen}
        onClose={handleCompleteAndClose}
        lessonTitle={lesson.title}
        grade={lesson.grade}
        ally={ally}
        xpEarned={lesson.xpReward}
        badgeTitle={earnedBadge}
        score={evaluationScore}
      />
    </div>
  );
};
