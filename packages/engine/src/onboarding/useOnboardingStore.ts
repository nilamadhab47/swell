import { create } from 'zustand';

export interface OnboardingAnswers {
  habit: string;
  reason: string;
  cigs_per_day: string;
  cost_per_pack: string;
  quit_date: string | null;
}

const EMPTY_ANSWERS: OnboardingAnswers = {
  habit: '',
  reason: '',
  cigs_per_day: '',
  cost_per_pack: '',
  quit_date: null,
};

interface OnboardingStore {
  completed: boolean;
  answers: OnboardingAnswers;
  complete: (answers: OnboardingAnswers) => void;
  replay: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  completed: false,
  answers: EMPTY_ANSWERS,

  complete: (answers) => set({ completed: true, answers }),

  replay: () => set({ completed: false, answers: EMPTY_ANSWERS }),
}));
