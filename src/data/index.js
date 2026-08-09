import moviesQs from './movies';
import gkQs from './gk';
import historyQs from './history';
import riddlesQs from './riddles';
import techQs from './tech';

const buildDb = () => {
  let globalId = 1;
  const process = (arr, category, type = 'mcq') => arr.map(q => {
    // If it's a riddle and answer isn't explicitly defined, try to extract it from options
    let answerText = q.answer;
    if (type === 'riddle' && !answerText && q.options && typeof q.correctAnswer === 'number') {
      answerText = q.options[q.correctAnswer];
    }
    
    return {
      ...q,
      globalId: globalId++,
      category,
      type,
      points: 10,
      answer: answerText
    };
  });

  return [
    ...process(moviesQs, "MOVIES, WEB SERIES & ANIME"),
    ...process(gkQs, "GENERAL KNOWLEDGE"),
    ...process(historyQs, "HISTORY & MONUMENTS"),
    ...process(techQs, "TECH TRIVIA"),
    ...process(riddlesQs, "RIDDLES", "riddle")
  ];
};

export const questionDatabase = buildDb();
