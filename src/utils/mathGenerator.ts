import { Problem, ProblemCategory } from '../types';

function generateSingleProblem(id: number): Problem {
  const categories: ProblemCategory[] = [
    'add_simple', 'add_10s', 'add_carry', 'add_2digit_0', 'add_2digit_1digit_no_carry',
    'sub_simple', 'sub_10s', 'sub_borrow', 'sub_2digit_0', 'sub_2digit_1digit_no_borrow'
  ];
  const category = categories[Math.floor(Math.random() * categories.length)];

  let n1 = 0, n2 = 0, operator: '+' | '-' = '+', answer = 0;

  switch (category) {
    case 'add_simple':
      n1 = Math.floor(Math.random() * 9) + 1;
      n2 = Math.floor(Math.random() * (10 - n1)) + 1;
      operator = '+';
      break;
    case 'add_10s':
      n1 = 10;
      n2 = Math.floor(Math.random() * 9) + 1;
      operator = '+';
      break;
    case 'add_carry':
      n1 = Math.floor(Math.random() * 8) + 2;
      n2 = Math.floor(Math.random() * 8) + 2;
      if (n1 + n2 <= 10) n1 = 9;
      if (n1 + n2 > 20) n1 = 10;
      operator = '+';
      break;
    case 'add_2digit_0':
      // 一の位が０の2位数同士の加法
      n1 = (Math.floor(Math.random() * 8) + 1) * 10; // 10, 20, ..., 80
      n2 = (Math.floor(Math.random() * ((90 - n1) / 10 - 1)) + 1) * 10;
      if (n2 <= 0) n2 = 10;
      operator = '+';
      break;
    case 'add_2digit_1digit_no_carry':
      // 繰り上がりのない2位数と一位数の加法
      n1 = Math.floor(Math.random() * 80) + 11; // 11-90
      n2 = Math.floor(Math.random() * (9 - (n1 % 10)));
      if (n2 === 0) n2 = 1;
      operator = '+';
      break;
    case 'sub_simple':
      n1 = Math.floor(Math.random() * 9) + 2;
      n2 = Math.floor(Math.random() * (n1 - 1)) + 1;
      operator = '-';
      break;
    case 'sub_10s':
      n1 = 11 + Math.floor(Math.random() * 9);
      n2 = Math.floor(Math.random() * (n1 - 10)) + 1;
      operator = '-';
      break;
    case 'sub_borrow':
      n1 = Math.floor(Math.random() * 9) + 11;
      n2 = Math.floor(Math.random() * 9) + 1;
      if (n1 % 10 >= n2) n2 = (n1 % 10) + 1;
      if (n1 - n2 < 0) n2 = n1;
      operator = '-';
      break;
    case 'sub_2digit_0':
      // 一の位が０の2位数同士の減法
      n1 = (Math.floor(Math.random() * 8) + 2) * 10; // 20, 30, ..., 90
      n2 = (Math.floor(Math.random() * (n1 / 10 - 1)) + 1) * 10;
      operator = '-';
      break;
    case 'sub_2digit_1digit_no_borrow':
      // 繰り下がりのない2位数と一位数の減法
      n1 = Math.floor(Math.random() * 80) + 11; // 11-90
      while (n1 % 10 === 0) n1 = Math.floor(Math.random() * 80) + 11;
      n2 = Math.floor(Math.random() * (n1 % 10)) + 1;
      operator = '-';
      break;
  }

  answer = operator === '+' ? n1 + n2 : n1 - n2;

  return { id, num1: n1, num2: n2, operator, answer, category };
}

export function generateProblems(count: number = 50): Problem[] {
  const problems: Problem[] = [];
  for (let i = 0; i < count; i++) {
    problems.push(generateSingleProblem(i));
  }
  return problems;
}
