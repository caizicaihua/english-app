export interface EnglishActivityQuestion {
  id: string
  type: 'listen' | 'reply'
  prompt: string
  translation: string
  options: string[]
  correctAnswer: string
}

export interface EnglishActivity {
  id: string
  gradeId: 2
  unitId: number
  title: string
  emoji: string
  description: string
  questions: EnglishActivityQuestion[]
  speaking: { prompt: string; example: string; parentHint: string }
}

function listen(id: string, prompt: string, translation: string, distractors: string[]): EnglishActivityQuestion {
  return { id, type: 'listen', prompt, translation, options: [translation, ...distractors], correctAnswer: translation }
}

function reply(id: string, prompt: string, translation: string, correctAnswer: string, distractors: string[]): EnglishActivityQuestion {
  return { id, type: 'reply', prompt, translation, options: [correctAnswer, ...distractors], correctAnswer }
}

export const englishActivities: EnglishActivity[] = [
  {
    id: 'grade2-family',
    gradeId: 2,
    unitId: 1,
    title: '我的家人',
    emoji: '👪',
    description: '听懂家庭短句，给问句找到合适的回答',
    questions: [
      listen('family-listen-1', 'This is my uncle.', '这是我的叔叔。', ['这是我的阿姨。', '这是我的奶奶。']),
      listen('family-listen-2', 'My grandma is happy.', '我的奶奶很开心。', ['我的奶奶很累。', '我的爷爷很开心。']),
      listen('family-listen-3', 'My parents are at home.', '我的父母在家。', ['我的父母在学校。', '我的表亲在家。']),
      reply('family-reply-1', "Who's this?", '这是谁？', 'This is my aunt.', ['I like toast.', 'It is red.']),
      reply('family-reply-2', 'Is this your cousin?', '这是你的表亲吗？', 'Yes, it is.', ['I am seven.', 'At school.']),
      reply('family-reply-3', 'Where is your grandpa?', '你的爷爷在哪里？', 'He is at home.', ['He is happy.', 'This is my bag.']),
    ],
    speaking: {
      prompt: '选一张家庭照片，用英语介绍一位家人。',
      example: 'This is my grandma.',
      parentHint: '能用 This is my… 说出照片里的家人即可；称谓可以按自己的家庭替换。',
    },
  },
  {
    id: 'grade2-food',
    gradeId: 2,
    unitId: 3,
    title: '一起吃早餐',
    emoji: '🥪',
    description: '听懂食物和饮料，练习点餐与表达喜好',
    questions: [
      listen('food-listen-1', 'I like fried rice.', '我喜欢炒饭。', ['我喜欢吐司。', '我不喜欢炒饭。']),
      listen('food-listen-2', 'I want some orange juice.', '我想要一些橙汁。', ['我想要一些柠檬水。', '我想要一些酸奶。']),
      listen('food-listen-3', 'The rice noodles are hot.', '米线是热的。', ['米线是凉的。', '纸杯蛋糕很甜。']),
      reply('food-reply-1', 'What would you like to drink?', '你想喝什么？', 'Orange juice, please.', ['A cupcake, please.', 'This is my uncle.']),
      reply('food-reply-2', 'Do you like toast?', '你喜欢吐司吗？', 'Yes, I do.', ['It is a book.', 'I am at home.']),
      reply('food-reply-3', 'Would you like some yogurt?', '你想要一些酸奶吗？', 'Yes, please.', ['She is my aunt.', 'It is blue.']),
    ],
    speaking: {
      prompt: '想一想今天的早餐，用英语说说你喜欢什么。',
      example: 'I like toast. Orange juice, please.',
      parentHint: '能用 I like… 表达一种食物的喜好，或用… please 礼貌点餐即可。',
    },
  },
  {
    id: 'grade2-classroom',
    gradeId: 2,
    unitId: 8,
    title: '课堂小游戏',
    emoji: '👏',
    description: '听懂课堂指令，练习简短问答',
    questions: [
      listen('classroom-listen-1', 'Please clap your hands.', '请拍拍手。', ['请转过身来。', '请读这本书。']),
      listen('classroom-listen-2', 'Point to the door.', '指一指门。', ['摸摸桌子。', '给星星涂色。']),
      listen('classroom-listen-3', 'Write your name, please.', '请写下你的名字。', ['请拼写这个单词。', '请数一数苹果。']),
      reply('classroom-reply-1', 'Can you read this word?', '你会读这个单词吗？', 'Yes, I can.', ['I like milk.', 'It is my uncle.']),
      reply('classroom-reply-2', 'How do you spell cat?', 'cat 怎么拼写？', 'C-A-T.', ['It is a dog.', 'I have a pen.']),
      reply('classroom-reply-3', 'May I ask a question?', '我可以问一个问题吗？', 'Yes, please.', ['I like toast.', 'It is red.']),
    ],
    speaking: {
      prompt: '当一次小老师，用英语请家人做一个动作。',
      example: 'Please clap your hands. Point to the door.',
      parentHint: '能说出一条清楚的课堂指令即可；可以先一起跟读，再请孩子试一次。',
    },
  },
]

export function getEnglishActivity(id: string | undefined): EnglishActivity | undefined {
  return englishActivities.find(activity => activity.id === id)
}

export function getEnglishActivityForUnit(unitId: number): EnglishActivity | undefined {
  return englishActivities.find(activity => activity.unitId === unitId)
}
