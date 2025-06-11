export interface Apostle {
  id: string;
  name: string;
  archetype: string;
  virtue: string;
  description: string;
  personality: string;
  color: string;
  icon: string;
}

export const APOSTLES: Apostle[] = [
  {
    id: 'peter',
    name: 'Пётр Непоколебимый',
    archetype: 'Камень',
    virtue: 'Дисциплина и стойкость',
    description: 'Апостол стойкости и дисциплины. Поможет обрести внутреннюю силу и устойчивость перед лицом трудностей.',
    personality: 'Строгий, но справедливый наставник. Говорит прямо, без прикрас. Ценит постоянство и целеустремленность.',
    color: '#8B4513', // Коричневый - цвет камня и земли
    icon: '🗿'
  },
  {
    id: 'john',
    name: 'Иоанн Размышляющий',
    archetype: 'Созерцатель',
    virtue: 'Осознанность и внутренний покой',
    description: 'Апостол созерцания и внутреннего мира. Научит находить покой в суете и глубже понимать себя.',
    personality: 'Мудрый и спокойный собеседник. Любит философские беседы. Помогает найти ответы через размышления.',
    color: '#4169E1', // Королевский синий - цвет глубины и мудрости
    icon: '🧘‍♂️'
  },
  {
    id: 'matthew',
    name: 'Матфей Счётный',
    archetype: 'Мыслитель',
    virtue: 'Ответственность и расчётливость',
    description: 'Апостол порядка и планирования. Поможет структурировать жизнь и принимать взвешенные решения.',
    personality: 'Практичный и организованный. Любит структуру и ясность. Поможет разложить проблемы по полочкам.',
    color: '#228B22', // Лесной зеленый - цвет роста и стабильности
    icon: '📊'
  }
];

export const getApostleById = (id: string): Apostle | undefined => {
  return APOSTLES.find(apostle => apostle.id === id);
};

export const getRandomApostle = (): Apostle => {
  return APOSTLES[Math.floor(Math.random() * APOSTLES.length)];
}; 