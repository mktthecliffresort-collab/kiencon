import { IUserRepository } from './IUserRepository';
import { ICurriculumRepository } from './ICurriculumRepository';
import { IQuestRepository } from './IQuestRepository';
import { supabaseUserRepository } from './SupabaseUserRepository';
import { supabaseCurriculumRepository } from './SupabaseCurriculumRepository';
import { supabaseQuestRepository } from './SupabaseQuestRepository';

// Toàn bộ ứng dụng sử dụng các Repository tích hợp Supabase (với fallback local thông minh)
export const userRepository: IUserRepository = supabaseUserRepository;
export const curriculumRepository: ICurriculumRepository = supabaseCurriculumRepository;
export const questRepository: IQuestRepository = supabaseQuestRepository;

export * from './IUserRepository';
export * from './ICurriculumRepository';
export * from './IQuestRepository';
export * from './SupabaseUserRepository';
export * from './SupabaseCurriculumRepository';
export * from './SupabaseQuestRepository';
