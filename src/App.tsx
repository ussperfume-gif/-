import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, CheckCircle2, Timer, RotateCcw, Award, ChevronRight, ChevronLeft, History, Trash2 } from 'lucide-react';
import { Problem, HistoryEntry } from './types';
import { generateProblems } from './utils/mathGenerator';

export default function App() {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [userAnswers, setUserAnswers] = useState<string[]>(new Array(50).fill(''));
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const PROBLEMS_PER_PAGE = 10;

  useEffect(() => {
    const savedHistory = localStorage.getItem('math_knock_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setCurrentTime(Date.now() - startTime);
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, startTime]);

  const startGame = () => {
    const newProblems = generateProblems(50);
    setProblems(newProblems);
    setUserAnswers(new Array(50).fill(''));
    setStartTime(Date.now());
    setCurrentTime(0);
    setGameState('playing');
    setCurrentPage(0);
    setScore(null);
  };

  const finishGame = () => {
    const end = Date.now();
    setEndTime(end);
    setGameState('finished');
    
    let correctCount = 0;
    problems.forEach((p, index) => {
      if (parseInt(userAnswers[index]) === p.answer) {
        correctCount++;
      }
    });
    const calculatedScore = Math.round((correctCount / problems.length) * 100);
    const newScore = { correct: correctCount, total: problems.length, score: calculatedScore };
    setScore(newScore);

    // Save to history
    const timeMs = end - startTime;
    const newEntry: HistoryEntry = {
      id: crypto.randomUUID(),
      date: new Date().toLocaleString('ja-JP'),
      correct: correctCount,
      total: problems.length,
      score: calculatedScore,
      timeMs: timeMs
    };
    const updatedHistory = [newEntry, ...history].slice(0, 50); // Keep last 50
    setHistory(updatedHistory);
    localStorage.setItem('math_knock_history', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    if (window.confirm('きろくを ぜんぶ けしても いいですか？')) {
      setHistory([]);
      localStorage.removeItem('math_knock_history');
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...userAnswers];
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      newAnswers[index] = value;
      setUserAnswers(newAnswers);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}分${seconds.toString().padStart(2, '0')}秒`;
  };

  const renderIdle = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-4"
    >
      <div className="flex flex-col items-center justify-center text-center p-6 md:p-8 bg-white rounded-3xl shadow-sm border border-stone-200">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <Award className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-stone-800 mb-3 font-sans tracking-tight">
          1年生のさんすう<br />50問ノック
        </h1>
        <p className="text-stone-500 mb-6 max-w-md leading-relaxed text-sm">
          たしざんと ひきざんの もんだいが 50もん でるよ！<br />
          ぜんぶ ときおわったら 「おわり」ボタンを おしてね。
        </p>
        <button
          onClick={startGame}
          className="group flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all shadow-lg hover:shadow-emerald-200 active:scale-95"
        >
          <Play className="w-5 h-5 fill-current" />
          はじめ！
        </button>
      </div>

      {history.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-stone-700 font-bold text-lg">
              <History className="w-5 h-5 text-emerald-500" />
              これまでの きろく
            </div>
            <button 
              onClick={clearHistory}
              className="flex items-center gap-1 text-stone-400 hover:text-red-500 text-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              きろくをけす
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-stone-400 text-xs uppercase tracking-wider border-b border-stone-100">
                  <th className="pb-2 font-bold">いつ</th>
                  <th className="pb-2 font-bold">てんすう</th>
                  <th className="pb-2 font-bold">じかん</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {history.map((entry) => (
                  <tr key={entry.id} className="group hover:bg-stone-50 transition-colors">
                    <td className="py-2 text-stone-600 text-sm">{entry.date}</td>
                    <td className="py-2">
                      <span className={`font-mono font-bold text-base ${entry.score === 100 ? 'text-emerald-500' : 'text-stone-700'}`}>
                        {entry.score}
                      </span>
                      <span className="text-stone-400 text-xs"> てん</span>
                      <span className="text-stone-300 text-[10px] ml-1">({entry.correct}/50)</span>
                    </td>
                    <td className="py-2 font-mono text-stone-600 text-sm">{formatTime(entry.timeMs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderPlaying = () => {
    const startIndex = currentPage * PROBLEMS_PER_PAGE;
    const pageProblems = problems.slice(startIndex, startIndex + PROBLEMS_PER_PAGE);

    return (
      <div className="max-w-4xl mx-auto">
        <div className="sticky top-4 z-10 flex items-center justify-between bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-sm border border-stone-200 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-xl text-stone-600 font-mono font-bold">
              <Timer className="w-5 h-5" />
              {formatTime(currentTime)}
            </div>
            <div className="text-stone-400 text-sm font-medium">
              しんちょく: {userAnswers.filter(a => a !== '').length} / 50
            </div>
          </div>
          <button
            onClick={finishGame}
            className="bg-stone-800 hover:bg-black text-white px-6 py-2 rounded-xl font-bold transition-all active:scale-95"
          >
            おわり！
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          {pageProblems.map((p, i) => {
            const actualIndex = startIndex + i;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between bg-white py-2 px-4 rounded-2xl border border-stone-100 shadow-sm hover:border-emerald-200 transition-colors"
              >
                <div className="flex items-center gap-3 text-xl font-mono font-bold text-stone-700">
                  <span className="text-stone-300 text-sm w-6">{actualIndex + 1}</span>
                  <span>{p.num1}</span>
                  <span className="text-emerald-500">{p.operator}</span>
                  <span>{p.num2}</span>
                  <span className="text-stone-300">=</span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={userAnswers[actualIndex]}
                  onChange={(e) => handleAnswerChange(actualIndex, e.target.value)}
                  className="w-20 h-12 text-center text-xl font-mono font-bold bg-stone-50 border-2 border-stone-100 rounded-xl focus:border-emerald-400 focus:bg-white outline-none transition-all"
                  placeholder="?"
                />
              </motion.div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(p => p - 1)}
            className="p-3 rounded-full bg-white border border-stone-200 disabled:opacity-30 hover:bg-stone-50 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`w-10 h-10 rounded-xl font-bold transition-all ${
                  currentPage === i 
                    ? 'bg-emerald-500 text-white shadow-md' 
                    : 'bg-white text-stone-400 border border-stone-100 hover:bg-stone-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            disabled={currentPage === 4}
            onClick={() => setCurrentPage(p => p + 1)}
            className="p-3 rounded-full bg-white border border-stone-200 disabled:opacity-30 hover:bg-stone-50 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  };

  const renderFinished = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden"
    >
      <div className="bg-emerald-500 p-6 md:p-8 text-center text-white">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-1">おつかれさまでした！</h2>
        <p className="opacity-80 text-sm">さいごまで よく がんばったね！</p>
      </div>
      
      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4 bg-stone-50 rounded-2xl">
            <div className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">てんすう</div>
            <div className="text-4xl font-mono font-black text-emerald-600">
              {score?.score} <span className="text-xl text-stone-400">てん</span>
            </div>
          </div>
          <div className="text-center p-4 bg-stone-50 rounded-2xl">
            <div className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">せいかいすう</div>
            <div className="text-4xl font-mono font-black text-stone-700">
              {score?.correct} <span className="text-xl text-stone-400">/ 50</span>
            </div>
          </div>
          <div className="text-center p-4 bg-stone-50 rounded-2xl">
            <div className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">かかったじかん</div>
            <div className="text-3xl font-mono font-black text-stone-800">
              {formatTime(endTime - startTime)}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={startGame}
            className="w-full flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl text-lg font-bold transition-all shadow-lg hover:shadow-emerald-200 active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            もういちど チャレンジ！
          </button>
          <button
            onClick={() => setGameState('idle')}
            className="w-full text-stone-400 hover:text-stone-600 font-bold py-2 transition-colors text-sm"
          >
            タイトルに もどる
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-stone-800 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <AnimatePresence mode="wait">
          {gameState === 'idle' && renderIdle()}
          {gameState === 'playing' && renderPlaying()}
          {gameState === 'finished' && renderFinished()}
        </AnimatePresence>
      </div>
      
      <footer className="fixed bottom-4 left-0 right-0 text-center text-stone-400 text-xs pointer-events-none">
        © 2024 1年生のさんすう 50問ノック
      </footer>
    </div>
  );
}
