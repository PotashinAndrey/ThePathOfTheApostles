// Структура обучающего пути
export interface PathTask {
  id: string;
  name: string;
  description: string;
  dayNumber: number;
  status: 'locked' | 'available' | 'active' | 'completed';
  motivationalPhrase: string;
}

export interface ApostleBlock {
  id: string;
  apostleId: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  tasks: PathTask[];
  isUnlocked: boolean;
  completedTasks: number;
  totalTasks: number;
  progress: number; // 0-100%
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  blocks: ApostleBlock[];
  currentBlock: number;
  totalProgress: number;
}

// Путь Петра - Неделя Стойкости
export const PETER_PATH_BLOCK: ApostleBlock = {
  id: 'peter-block',
  apostleId: 'peter',
  name: 'Пётр',
  title: 'Неделя Стойкости',
  description: 'Путь развития внутренней силы и непоколебимости',
  icon: '🗿',
  color: '#8B4513', // Коричневый цвет Петра
  order: 1,
  isUnlocked: true,
  completedTasks: 0,
  totalTasks: 7,
  progress: 0,
  tasks: [
    {
      id: 'peter-day-1',
      name: 'Принятие вызова',
      description: 'Найди одну привычку, которая тебе мешает, и откажись от неё на один день. Это может быть проверка соцсетей, сладости или что-то другое. Главное - осознанно выбрать и продержаться.',
      dayNumber: 1,
      status: 'available',
      motivationalPhrase: 'Путь в тысячу миль начинается с одного шага. Сделай его сегодня.'
    },
    {
      id: 'peter-day-2',
      name: 'Тело - храм силы',
      description: 'Выполни простое физическое упражнение, которое требует выносливости: 50 отжиманий (можно с колен), планка на 2 минуты или 500 приседаний в течение дня. Если это слишком легко - увеличь нагрузку. Если тяжело - сделай половину, но не сдавайся.',
      dayNumber: 2,
      status: 'locked',
      motivationalPhrase: 'Тело может вынести почти всё. Это разум нужно убедить.'
    },
    {
      id: 'peter-day-3',
      name: 'Укрощение бури',
      description: 'Сегодня, когда почувствуешь злость, раздражение или тревогу, сделай паузу на 30 секунд. Глубоко подыши и спроси себя: "Что я могу контролировать в этой ситуации?" Запиши вечером, сколько раз тебе это удалось.',
      dayNumber: 3,
      status: 'locked',
      motivationalPhrase: 'Не то, что с тобой происходит, определяет тебя, а то, как ты на это реагируешь.'
    },
    {
      id: 'peter-day-4',
      name: 'Концентрация воина',
      description: 'Выбери одну важную задачу и работай над ней непрерывно 25 минут без отвлечений (телефон в другой комнате, никаких уведомлений). После сделай 5-минутный перерыв. Повтори цикл 3 раза. Это твоя тренировка внимания.',
      dayNumber: 4,
      status: 'locked',
      motivationalPhrase: 'Дисциплина - это мост между целью и достижением.'
    },
    {
      id: 'peter-day-5',
      name: 'Мост через пропасть',
      description: 'Найди человека, с которым у тебя есть недопонимание или конфликт. Сделай первый шаг к примирению: позвони, напиши сообщение или встреться лично. Не ожидай немедленного результата - важна твоя готовность протянуть руку.',
      dayNumber: 5,
      status: 'locked',
      motivationalPhrase: 'Стойкость - не когда ты стоишь один, а когда ты протягиваешь руку другому.'
    },
    {
      id: 'peter-day-6',
      name: 'Корни глубокой веры',
      description: 'Проведи 15 минут в тишине, размышляя о том, что для тебя действительно важно в жизни. Можешь молиться, медитировать или просто думать. Запиши 3 главные ценности, которые будут твоими опорами в трудные времена.',
      dayNumber: 6,
      status: 'locked',
      motivationalPhrase: 'Знай, во что ты веришь, тогда буря не сможет тебя сломить.'
    },
    {
      id: 'peter-day-7',
      name: 'Сила через отдавание',
      description: 'Сделай что-то хорошее для другого человека, не ожидая благодарности. Помоги незнакомцу, поддержи друга, сделай добровольческую работу или просто искренне выслушай кого-то. Истинная стойкость рождается, когда мы думаем не только о себе.',
      dayNumber: 7,
      status: 'locked',
      motivationalPhrase: 'Истинная сила проявляется не в том, что ты можешь взять, а в том, что готов отдать.'
    }
  ]
};

// Заготовки для других апостолов (пока пустые)
export const LEARNING_PATH_BLOCKS: ApostleBlock[] = [
  PETER_PATH_BLOCK,
  // Здесь будут другие 11 блоков
];

export const MAIN_LEARNING_PATH: LearningPath = {
  id: 'main-path',
  name: 'Путь Апостолов',
  description: 'Главный путь духовного развития через учения 12 апостолов',
  blocks: LEARNING_PATH_BLOCKS,
  currentBlock: 0,
  totalProgress: 0
}; 