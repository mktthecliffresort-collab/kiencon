export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_id: string | null;
          full_name: string;
          nickname: string | null;
          current_grade: number;
          avatar: string;
          total_xp: number;
          streak_days: number;
          level: number;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_id?: string | null;
          full_name: string;
          nickname?: string | null;
          current_grade?: number;
          avatar?: string;
          total_xp?: number;
          streak_days?: number;
          level?: number;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_id?: string | null;
          full_name?: string;
          nickname?: string | null;
          current_grade?: number;
          avatar?: string;
          total_xp?: number;
          streak_days?: number;
          level?: number;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_inventory: {
        Row: {
          id: string;
          user_id: string;
          item_id: string;
          item_type: string;
          metadata: Json;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_id: string;
          item_type: string;
          metadata?: Json;
          unlocked_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          item_id?: string;
          item_type?: string;
          metadata?: Json;
          unlocked_at?: string;
        };
        Relationships: [];
      };
      courses: {
        Row: {
          id: string;
          grade_level: number;
          subject: string;
          title: string;
          color_theme: string;
          icon: string;
          description: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id: string;
          grade_level: number;
          subject: string;
          title: string;
          color_theme: string;
          icon: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          grade_level?: number;
          subject?: string;
          title?: string;
          color_theme?: string;
          icon?: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      topics: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          order_index: number;
          description: string | null;
          icon: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          course_id: string;
          title: string;
          order_index?: number;
          description?: string | null;
          icon?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          order_index?: number;
          description?: string | null;
          icon?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          topic_id: string;
          course_id: string;
          title: string;
          subtitle: string | null;
          order_index: number;
          is_premium: boolean;
          estimated_minutes: number;
          xp_reward: number;
          mascot_ally_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          topic_id: string;
          course_id: string;
          title: string;
          subtitle?: string | null;
          order_index?: number;
          is_premium?: boolean;
          estimated_minutes?: number;
          xp_reward?: number;
          mascot_ally_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          topic_id?: string;
          course_id?: string;
          title?: string;
          subtitle?: string | null;
          order_index?: number;
          is_premium?: boolean;
          estimated_minutes?: number;
          xp_reward?: number;
          mascot_ally_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      lesson_steps: {
        Row: {
          id: string;
          lesson_id: string;
          step_type: string;
          step_title: string;
          order_index: number;
          content: Json;
          xp_reward: number;
          time_estimate_mins: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          step_type: string;
          step_title: string;
          order_index: number;
          content?: Json;
          xp_reward?: number;
          time_estimate_mins?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          step_type?: string;
          step_title?: string;
          order_index?: number;
          content?: Json;
          xp_reward?: number;
          time_estimate_mins?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          question_type: string;
          usage_context: string[];
          grade_level: number;
          topic_id: string | null;
          difficulty: string;
          content: Json;
          options: Json | null;
          correct_answer: string;
          explanation: string | null;
          socratic_hints: Json | null;
          xp_reward: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          question_type: string;
          usage_context: string[];
          grade_level?: number;
          topic_id?: string | null;
          difficulty?: string;
          content: Json;
          options?: Json | null;
          correct_answer: string;
          explanation?: string | null;
          socratic_hints?: Json | null;
          xp_reward?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          question_type?: string;
          usage_context?: string[];
          grade_level?: number;
          topic_id?: string | null;
          difficulty?: string;
          content?: Json;
          options?: Json | null;
          correct_answer: string;
          explanation?: string | null;
          socratic_hints?: Json | null;
          xp_reward?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      question_tags: {
        Row: {
          id: number;
          question_id: string;
          tag_name: string;
        };
        Insert: {
          id?: number;
          question_id: string;
          tag_name: string;
        };
        Update: {
          id?: number;
          question_id?: string;
          tag_name?: string;
        };
        Relationships: [];
      };
      user_lesson_progress: {
        Row: {
          user_id: string;
          lesson_id: string;
          completed_steps: string[];
          total_stars: number;
          is_completed: boolean;
          last_synced_at: string;
        };
        Insert: {
          user_id: string;
          lesson_id: string;
          completed_steps?: string[];
          total_stars?: number;
          is_completed?: boolean;
          last_synced_at?: string;
        };
        Update: {
          user_id?: string;
          lesson_id?: string;
          completed_steps?: string[];
          total_stars?: number;
          is_completed?: boolean;
          last_synced_at?: string;
        };
        Relationships: [];
      };
      learning_sessions: {
        Row: {
          id: string;
          user_id: string;
          activity_type: string;
          target_id: string | null;
          duration_seconds: number;
          xp_earned: number;
          device_info: Json | null;
          start_time: string;
          end_time: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_type: string;
          target_id?: string | null;
          duration_seconds?: number;
          xp_earned?: number;
          device_info?: Json | null;
          start_time?: string;
          end_time?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_type?: string;
          target_id?: string | null;
          duration_seconds?: number;
          xp_earned?: number;
          device_info?: Json | null;
          start_time?: string;
          end_time?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      quests: {
        Row: {
          id: string;
          type: string;
          target_action: string;
          target_value: number;
          xp_reward: number;
          title: string;
          description: string;
          grade_level: number;
          icon: string;
        };
        Insert: {
          id: string;
          type: string;
          target_action: string;
          target_value: number;
          xp_reward: number;
          title: string;
          description: string;
          grade_level?: number;
          icon?: string;
        };
        Update: {
          id?: string;
          type?: string;
          target_action?: string;
          target_value?: number;
          xp_reward?: number;
          title?: string;
          description?: string;
          grade_level?: number;
          icon?: string;
        };
        Relationships: [];
      };
      user_quests: {
        Row: {
          id: number;
          user_id: string;
          quest_id: string;
          progress: number;
          status: string;
          quest_date: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          quest_id: string;
          progress?: number;
          status?: string;
          quest_date?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          quest_id?: string;
          progress?: number;
          status?: string;
          quest_date?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_weekly_leaderboard: {
        Args: {
          grade_filter: number;
          limit_rows?: number;
        };
        Returns: {
          user_id: string;
          full_name: string;
          weekly_xp: number;
          avatar: string;
          streak_days: number;
        }[];
      };
      get_overall_leaderboard: {
        Args: {
          grade_filter: number;
          limit_rows?: number;
        };
        Returns: {
          user_id: string;
          full_name: string;
          total_xp: number;
          avatar: string;
          streak_days: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
