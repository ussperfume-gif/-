export type ProblemType = 'add' | 'sub';

export type ProblemCategory = 
  | 'add_simple' 
  | 'add_10s' 
  | 'add_carry' 
  | 'add_2digit_0' 
  | 'add_2digit_1digit_no_carry'
  | 'sub_simple' 
  | 'sub_10s' 
  | 'sub_borrow'
  | 'sub_2digit_0'
  | 'sub_2digit_1digit_no_borrow';

export interface Problem {
  id: number;
  num1: number;
  num2: number;
  operator: '+' | '-';
  answer: number;
  category: ProblemCategory;
}

export interface HistoryEntry {
  id: string;
  date: string;
  correct: number;
  total: number;
  score: number;
  timeMs: number;
}
