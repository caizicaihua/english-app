export interface Word {
  id: string
  en: string
  zh: string
  emoji: string
  example?: {
    en: string
    zh: string
  }
}

export interface DialogueLine {
  speaker: string
  en: string
  zh: string
}

export interface Dialogue {
  title: string
  lines: DialogueLine[]
}

export interface Unit {
  id: number
  name: string
  nameZh: string
  words: Word[]
  dialogues?: Dialogue[]
}

export interface Grade {
  id: number
  name: string
  color: string
  emoji: string
  units: Unit[]
}

function createWord(
  id: string,
  en: string,
  zh: string,
  emoji: string,
  exampleEn: string,
  exampleZh: string,
): Word {
  return {
    id,
    en,
    zh,
    emoji,
    example: {
      en: exampleEn,
      zh: exampleZh,
    },
  }
}

function createDialogue(title: string, lines: DialogueLine[]): Dialogue {
  return { title, lines }
}

export const grades: Grade[] = [
  {
    id: 1, name: '一年级', color: '#ef4444', emoji: '🌟',
    units: [
      {
        id: 1, name: 'Starter Words & Numbers', nameZh: '启蒙词与数字',
        words: [
          createWord('1-1-1', 'apple', '苹果', '🍎', 'This is an apple.', '这是一个苹果。'),
          createWord('1-1-2', 'ball', '球', '⚽', 'I have a ball.', '我有一个球。'),
          createWord('1-1-3', 'cat', '猫', '🐱', 'The cat is small.', '这只猫很小。'),
          createWord('1-1-4', 'dog', '狗', '🐶', 'The dog can run.', '这只狗会跑。'),
          createWord('1-1-5', 'egg', '鸡蛋', '🥚', 'I see an egg.', '我看见一个鸡蛋。'),
          createWord('1-1-6', 'fish', '鱼', '🐟', 'I see a fish.', '我看见一条鱼。'),
          createWord('1-1-7', 'one', '一', '1️⃣', 'One apple.', '一个苹果。'),
          createWord('1-1-8', 'two', '二', '2️⃣', 'Two ducks.', '两只鸭子。'),
          createWord('1-1-9', 'three', '三', '3️⃣', 'Three cats.', '三只猫。'),
          createWord('1-1-10', 'four', '四', '4️⃣', 'Four balls.', '四个球。'),
        ],
        dialogues: [
          createDialogue('认识物品', [
            { speaker: 'A', en: 'What is this?', zh: '这是什么？' },
            { speaker: 'B', en: 'It is a ball.', zh: '它是一个球。' },
            { speaker: 'A', en: 'How many balls?', zh: '有几个球？' },
            { speaker: 'B', en: 'Two balls.', zh: '两个球。' },
          ]),
          createDialogue('认识动物', [
            { speaker: 'A', en: 'Is it a cat?', zh: '它是一只猫吗？' },
            { speaker: 'B', en: 'Yes, it is.', zh: '是的，它是。' },
            { speaker: 'A', en: 'Is it a dog?', zh: '它是一只狗吗？' },
            { speaker: 'B', en: 'No, it is not.', zh: '不，它不是。' },
          ]),
        ],
      },
      {
        id: 2, name: 'Colors', nameZh: '颜色',
        words: [
          createWord('1-2-1', 'red', '红色', '🔴', 'It is red.', '它是红色的。'),
          createWord('1-2-2', 'blue', '蓝色', '🔵', 'The sky is blue.', '天空是蓝色的。'),
          createWord('1-2-3', 'green', '绿色', '🟢', 'Leaves are green.', '树叶是绿色的。'),
          createWord('1-2-4', 'yellow', '黄色', '🟡', 'The sun is yellow.', '太阳是黄色的。'),
          createWord('1-2-5', 'white', '白色', '⚪', 'The snow is white.', '雪是白色的。'),
          createWord('1-2-6', 'black', '黑色', '⚫', 'My bag is black.', '我的书包是黑色的。'),
          createWord('1-2-7', 'pink', '粉色', '🩷', 'The flower is pink.', '这朵花是粉色的。'),
          createWord('1-2-8', 'orange', '橙色', '🟠', 'The orange is orange.', '这个橙子是橙色的。'),
          createWord('1-2-9', 'purple', '紫色', '🟣', 'The grape is purple.', '葡萄是紫色的。'),
          createWord('1-2-10', 'brown', '棕色', '🟤', 'The bear is brown.', '熊是棕色的。'),
        ],
        dialogues: [
          createDialogue('问颜色', [
            { speaker: 'A', en: 'What color is it?', zh: '它是什么颜色？' },
            { speaker: 'B', en: 'It is yellow.', zh: '它是黄色的。' },
            { speaker: 'A', en: 'I like yellow.', zh: '我喜欢黄色。' },
            { speaker: 'B', en: 'Me too.', zh: '我也是。' },
          ]),
          createDialogue('我的东西', [
            { speaker: 'A', en: 'My bag is black.', zh: '我的书包是黑色的。' },
            { speaker: 'B', en: 'My pencil is blue.', zh: '我的铅笔是蓝色的。' },
            { speaker: 'A', en: 'They are nice.', zh: '它们很好看。' },
          ]),
        ],
      },
      {
        id: 3, name: 'Animals', nameZh: '动物',
        words: [
          createWord('1-3-1', 'bird', '鸟', '🐦', 'A bird can fly.', '鸟会飞。'),
          createWord('1-3-2', 'duck', '鸭子', '🦆', 'I see a duck.', '我看见一只鸭子。'),
          createWord('1-3-3', 'pig', '猪', '🐷', 'The pig is fat.', '这只猪胖胖的。'),
          createWord('1-3-4', 'hen', '母鸡', '🐔', 'The hen is small.', '这只母鸡很小。'),
          createWord('1-3-5', 'cow', '牛', '🐮', 'The cow is big.', '这头牛很大。'),
          createWord('1-3-6', 'rabbit', '兔子', '🐰', 'The rabbit can jump.', '兔子会跳。'),
          createWord('1-3-7', 'bear', '熊', '🐻', 'The bear is brown.', '熊是棕色的。'),
          createWord('1-3-8', 'monkey', '猴子', '🐵', 'The monkey is funny.', '猴子很有趣。'),
          createWord('1-3-9', 'panda', '熊猫', '🐼', 'The panda is cute.', '熊猫很可爱。'),
          createWord('1-3-10', 'tiger', '老虎', '🐯', 'The tiger is strong.', '老虎很强壮。'),
        ],
        dialogues: [
          createDialogue('认识动物', [
            { speaker: 'A', en: 'What animal is it?', zh: '它是什么动物？' },
            { speaker: 'B', en: 'It is a panda.', zh: '它是一只熊猫。' },
            { speaker: 'A', en: 'Is it cute?', zh: '它可爱吗？' },
            { speaker: 'B', en: 'Yes, it is.', zh: '是的，它很可爱。' },
          ]),
          createDialogue('我喜欢的动物', [
            { speaker: 'A', en: 'Do you like rabbits?', zh: '你喜欢兔子吗？' },
            { speaker: 'B', en: 'Yes, I do.', zh: '是的，我喜欢。' },
            { speaker: 'A', en: 'I like pandas.', zh: '我喜欢熊猫。' },
          ]),
        ],
      },
      {
        id: 4, name: 'Fruits', nameZh: '水果',
        words: [
          createWord('1-4-1', 'banana', '香蕉', '🍌', 'This is a banana.', '这是一个香蕉。'),
          createWord('1-4-2', 'pear', '梨', '🍐', 'I eat a pear.', '我吃一个梨。'),
          createWord('1-4-3', 'grape', '葡萄', '🍇', 'The grapes are sweet.', '葡萄很甜。'),
          createWord('1-4-4', 'peach', '桃子', '🍑', 'This peach is soft.', '这个桃子很软。'),
          createWord('1-4-5', 'mango', '芒果', '🥭', 'The mango is yellow.', '芒果是黄色的。'),
          createWord('1-4-6', 'lemon', '柠檬', '🍋', 'The lemon is sour.', '柠檬是酸的。'),
          createWord('1-4-7', 'cherry', '樱桃', '🍒', 'I like cherries.', '我喜欢樱桃。'),
          createWord('1-4-8', 'melon', '甜瓜', '🍈', 'The melon is big.', '这个甜瓜很大。'),
          createWord('1-4-9', 'strawberry', '草莓', '🍓', 'This strawberry is red.', '这个草莓是红色的。'),
          createWord('1-4-10', 'watermelon', '西瓜', '🍉', 'The watermelon is green.', '西瓜是绿色的。'),
        ],
        dialogues: [
          createDialogue('问水果', [
            { speaker: 'A', en: 'What fruit is this?', zh: '这是什么水果？' },
            { speaker: 'B', en: 'It is a pear.', zh: '它是一个梨。' },
            { speaker: 'A', en: 'Do you like pears?', zh: '你喜欢梨吗？' },
            { speaker: 'B', en: 'Yes, I do.', zh: '是的，我喜欢。' },
          ]),
          createDialogue('分享水果', [
            { speaker: 'A', en: 'I want a banana.', zh: '我想要一个香蕉。' },
            { speaker: 'B', en: 'Here you are.', zh: '给你。' },
            { speaker: 'A', en: 'Thank you.', zh: '谢谢你。' },
          ]),
        ],
      },
      {
        id: 5, name: 'Classroom', nameZh: '课堂与文具',
        words: [
          createWord('1-5-1', 'book', '书', '📘', 'Open your book.', '打开你的书。'),
          createWord('1-5-2', 'pen', '钢笔', '🖊️', 'This is my pen.', '这是我的钢笔。'),
          createWord('1-5-3', 'pencil', '铅笔', '✏️', 'I have a pencil.', '我有一支铅笔。'),
          createWord('1-5-4', 'ruler', '尺子', '📏', 'The ruler is long.', '这把尺子很长。'),
          createWord('1-5-5', 'bag', '书包', '🎒', 'My bag is blue.', '我的书包是蓝色的。'),
          createWord('1-5-6', 'desk', '课桌', '🪑', 'The desk is clean.', '课桌很干净。'),
          createWord('1-5-7', 'chair', '椅子', '🪑', 'Sit on the chair.', '坐在椅子上。'),
          createWord('1-5-8', 'teacher', '老师', '👩‍🏫', 'My teacher is kind.', '我的老师很亲切。'),
          createWord('1-5-9', 'school', '学校', '🏫', 'I go to school.', '我去学校。'),
          createWord('1-5-10', 'class', '班级', '👨‍🎓', 'Our class is happy.', '我们的班级很快乐。'),
        ],
        dialogues: [
          createDialogue('课堂指令', [
            { speaker: 'Teacher', en: 'Open your book, please.', zh: '请打开你的书。' },
            { speaker: 'Student', en: 'Okay, teacher.', zh: '好的，老师。' },
            { speaker: 'Teacher', en: 'Read after me.', zh: '跟我读。' },
          ]),
          createDialogue('文具问答', [
            { speaker: 'A', en: 'What is this?', zh: '这是什么？' },
            { speaker: 'B', en: 'It is a ruler.', zh: '它是一把尺子。' },
            { speaker: 'A', en: 'Is it your ruler?', zh: '它是你的尺子吗？' },
            { speaker: 'B', en: 'Yes, it is.', zh: '是的，它是。' },
          ]),
        ],
      },
      {
        id: 6, name: 'Greetings & Family', nameZh: '问候与家庭',
        words: [
          createWord('1-6-1', 'hello', '你好', '👋', 'Hello, Tom.', '你好，汤姆。'),
          createWord('1-6-2', 'bye', '再见', '🙋', 'Bye, teacher.', '再见，老师。'),
          createWord('1-6-3', 'please', '请', '🙏', 'Please sit down.', '请坐下。'),
          createWord('1-6-4', 'thanks', '谢谢', '😊', 'Thanks, Mum.', '谢谢，妈妈。'),
          createWord('1-6-5', 'father', '爸爸', '👨', 'This is my father.', '这是我的爸爸。'),
          createWord('1-6-6', 'mother', '妈妈', '👩', 'This is my mother.', '这是我的妈妈。'),
          createWord('1-6-7', 'brother', '兄弟', '👦', 'My brother can run.', '我的兄弟会跑。'),
          createWord('1-6-8', 'sister', '姐妹', '👧', 'My sister can sing.', '我的姐妹会唱歌。'),
          createWord('1-6-9', 'friend', '朋友', '🤝', 'He is my friend.', '他是我的朋友。'),
          createWord('1-6-10', 'family', '家庭', '👨‍👩‍👧‍👦', 'I love my family.', '我爱我的家。'),
        ],
        dialogues: [
          createDialogue('打招呼', [
            { speaker: 'A', en: 'Hello!', zh: '你好！' },
            { speaker: 'B', en: 'Hello!', zh: '你好！' },
            { speaker: 'A', en: 'Who is she?', zh: '她是谁？' },
            { speaker: 'B', en: 'She is my sister.', zh: '她是我的姐姐。' },
          ]),
          createDialogue('认识家人', [
            { speaker: 'A', en: 'This is my father.', zh: '这是我的爸爸。' },
            { speaker: 'B', en: 'Nice to meet you.', zh: '很高兴见到你。' },
            { speaker: 'A', en: 'Nice to meet you too.', zh: '我也很高兴见到你。' },
          ]),
        ],
      },
      {
        id: 7, name: 'Actions', nameZh: '常用动作',
        words: [
          createWord('1-7-1', 'open', '打开', '📖', 'Open the book.', '打开书。'),
          createWord('1-7-2', 'close', '关闭', '📕', 'Close the door.', '关上门。'),
          createWord('1-7-3', 'sit', '坐', '🪑', 'Sit here, please.', '请坐这里。'),
          createWord('1-7-4', 'stand', '站立', '🧍', 'Stand up, please.', '请站起来。'),
          createWord('1-7-5', 'look', '看', '👀', 'Look at the bird.', '看那只鸟。'),
          createWord('1-7-6', 'listen', '听', '👂', 'Listen to me.', '听我说。'),
          createWord('1-7-7', 'help', '帮助', '🤲', 'Please help me.', '请帮助我。'),
          createWord('1-7-8', 'draw', '画', '🎨', 'I can draw a cat.', '我会画一只猫。'),
          createWord('1-7-9', 'sing', '唱歌', '🎤', 'We sing together.', '我们一起唱歌。'),
          createWord('1-7-10', 'dance', '跳舞', '💃', 'They dance happily.', '他们开心地跳舞。'),
        ],
        dialogues: [
          createDialogue('课堂动作', [
            { speaker: 'Teacher', en: 'Open your book, please.', zh: '请打开你的书。' },
            { speaker: 'Student', en: 'Okay.', zh: '好的。' },
            { speaker: 'Teacher', en: 'Look at the picture.', zh: '看这张图片。' },
            { speaker: 'Student', en: 'I see a cat.', zh: '我看见一只猫。' },
          ]),
          createDialogue('一起活动', [
            { speaker: 'A', en: 'Can you sing?', zh: '你会唱歌吗？' },
            { speaker: 'B', en: 'Yes, I can.', zh: '是的，我会。' },
            { speaker: 'A', en: 'Can you dance too?', zh: '你也会跳舞吗？' },
            { speaker: 'B', en: 'Yes, I can dance.', zh: '是的，我会跳舞。' },
          ]),
        ],
      },
      {
        id: 8, name: 'People & Descriptions', nameZh: '人物与描述',
        words: [
          createWord('1-8-1', 'boy', '男孩', '👦', 'The boy is my friend.', '这个男孩是我的朋友。'),
          createWord('1-8-2', 'girl', '女孩', '👧', 'The girl can read.', '这个女孩会读书。'),
          createWord('1-8-3', 'baby', '宝宝', '👶', 'The baby is small.', '这个宝宝很小。'),
          createWord('1-8-4', 'big', '大的', '🦁', 'The elephant is big.', '大象很大。'),
          createWord('1-8-5', 'small', '小的', '🐭', 'The mouse is small.', '老鼠很小。'),
          createWord('1-8-6', 'tall', '高的', '🦒', 'The giraffe is tall.', '长颈鹿很高。'),
          createWord('1-8-7', 'short', '矮的', '🧒', 'The boy is short.', '这个男孩个子矮。'),
          createWord('1-8-8', 'happy', '开心的', '😊', 'I am happy today.', '我今天很开心。'),
          createWord('1-8-9', 'sad', '难过的', '😢', 'The girl is sad.', '这个女孩很难过。'),
          createWord('1-8-10', 'good', '好的', '👍', 'You are a good boy.', '你是个好男孩。'),
        ],
        dialogues: [
          createDialogue('介绍朋友', [
            { speaker: 'A', en: 'Who is he?', zh: '他是谁？' },
            { speaker: 'B', en: 'He is a boy.', zh: '他是一个男孩。' },
            { speaker: 'A', en: 'Is he happy?', zh: '他开心吗？' },
            { speaker: 'B', en: 'Yes, he is happy.', zh: '是的，他很开心。' },
          ]),
          createDialogue('比一比', [
            { speaker: 'A', en: 'The giraffe is tall.', zh: '长颈鹿很高。' },
            { speaker: 'B', en: 'The mouse is small.', zh: '老鼠很小。' },
            { speaker: 'A', en: 'The elephant is big.', zh: '大象很大。' },
          ]),
        ],
      },
      {
        id: 9, name: 'Body & Face', nameZh: '身体与五官',
        words: [
          createWord('1-9-1', 'head', '头', '🗣️', 'This is my head.', '这是我的头。'),
          createWord('1-9-2', 'eye', '眼睛', '👁️', 'I have two eyes.', '我有两只眼睛。'),
          createWord('1-9-3', 'ear', '耳朵', '👂', 'My ears can hear.', '我的耳朵能听见。'),
          createWord('1-9-4', 'nose', '鼻子', '👃', 'This is my nose.', '这是我的鼻子。'),
          createWord('1-9-5', 'mouth', '嘴巴', '👄', 'Open your mouth.', '张开你的嘴巴。'),
          createWord('1-9-6', 'hand', '手', '✋', 'Raise your hand.', '举起你的手。'),
          createWord('1-9-7', 'foot', '脚', '🦶', 'My foot is small.', '我的脚很小。'),
          createWord('1-9-8', 'arm', '手臂', '💪', 'My arm is strong.', '我的手臂很有力。'),
          createWord('1-9-9', 'leg', '腿', '🦵', 'I have two legs.', '我有两条腿。'),
          createWord('1-9-10', 'face', '脸', '🙂', 'Wash your face.', '洗你的脸。'),
        ],
        dialogues: [
          createDialogue('认识身体', [
            { speaker: 'Teacher', en: 'Touch your nose.', zh: '摸摸你的鼻子。' },
            { speaker: 'Student', en: 'This is my nose.', zh: '这是我的鼻子。' },
            { speaker: 'Teacher', en: 'Raise your hand.', zh: '举起你的手。' },
            { speaker: 'Student', en: 'Okay!', zh: '好的！' },
          ]),
          createDialogue('我和你', [
            { speaker: 'A', en: 'I have two eyes.', zh: '我有两只眼睛。' },
            { speaker: 'B', en: 'I have two ears too.', zh: '我也有两只耳朵。' },
            { speaker: 'A', en: 'We all have a face.', zh: '我们都有一张脸。' },
          ]),
        ],
      },
      {
        id: 10, name: 'Food & Drinks', nameZh: '食物与饮料',
        words: [
          createWord('1-10-1', 'bread', '面包', '🍞', 'I like bread.', '我喜欢面包。'),
          createWord('1-10-2', 'rice', '米饭', '🍚', 'This is rice.', '这是米饭。'),
          createWord('1-10-3', 'milk', '牛奶', '🥛', 'I drink milk.', '我喝牛奶。'),
          createWord('1-10-4', 'water', '水', '💧', 'I want some water.', '我想喝点水。'),
          createWord('1-10-5', 'juice', '果汁', '🧃', 'The juice is sweet.', '果汁很甜。'),
          createWord('1-10-6', 'cake', '蛋糕', '🎂', 'This cake is nice.', '这个蛋糕很好吃。'),
          createWord('1-10-7', 'ice cream', '冰淇淋', '🍦', 'I like ice cream.', '我喜欢冰淇淋。'),
          createWord('1-10-8', 'tea', '茶', '🍵', 'My grandpa likes tea.', '我爷爷喜欢茶。'),
          createWord('1-10-9', 'soup', '汤', '🥣', 'The soup is hot.', '汤是热的。'),
          createWord('1-10-10', 'noodle', '面条', '🍜', 'The noodle is hot.', '面条是热的。'),
        ],
        dialogues: [
          createDialogue('点吃的', [
            { speaker: 'A', en: 'What do you want?', zh: '你想要什么？' },
            { speaker: 'B', en: 'I want some milk.', zh: '我想要一些牛奶。' },
            { speaker: 'A', en: 'Do you want bread too?', zh: '你也想要面包吗？' },
            { speaker: 'B', en: 'Yes, please.', zh: '是的，谢谢。' },
          ]),
          createDialogue('我喜欢的食物', [
            { speaker: 'A', en: 'I like ice cream.', zh: '我喜欢冰淇淋。' },
            { speaker: 'B', en: 'I like juice.', zh: '我喜欢果汁。' },
            { speaker: 'A', en: 'Cake is nice too.', zh: '蛋糕也很好吃。' },
          ]),
        ],
      },
      {
        id: 11, name: 'Weather & Time', nameZh: '天气与时间',
        words: [
          createWord('1-11-1', 'sunny', '晴天', '☀️', 'It is sunny today.', '今天天气晴朗。'),
          createWord('1-11-2', 'rainy', '下雨', '🌧️', 'It is rainy outside.', '外面在下雨。'),
          createWord('1-11-3', 'cloudy', '多云', '☁️', 'The sky is cloudy.', '天空多云。'),
          createWord('1-11-4', 'hot', '热的', '🔥', 'It is hot in summer.', '夏天很热。'),
          createWord('1-11-5', 'cold', '冷的', '🧊', 'It is cold today.', '今天很冷。'),
          createWord('1-11-6', 'morning', '早上', '🌅', 'Good morning, teacher.', '老师，早上好。'),
          createWord('1-11-7', 'afternoon', '下午', '🌤️', 'Good afternoon, Mum.', '妈妈，下午好。'),
          createWord('1-11-8', 'evening', '晚上', '🌙', 'Good evening, Dad.', '爸爸，晚上好。'),
          createWord('1-11-9', 'today', '今天', '📅', 'I am happy today.', '我今天很开心。'),
          createWord('1-11-10', 'tomorrow', '明天', '📆', 'See you tomorrow.', '明天见。'),
        ],
        dialogues: [
          createDialogue('问天气', [
            { speaker: 'A', en: 'How is the weather today?', zh: '今天天气怎么样？' },
            { speaker: 'B', en: 'It is sunny today.', zh: '今天是晴天。' },
            { speaker: 'A', en: 'Is it hot?', zh: '天气热吗？' },
            { speaker: 'B', en: 'No, it is not hot.', zh: '不，不热。' },
          ]),
          createDialogue('问候时间', [
            { speaker: 'A', en: 'Good morning!', zh: '早上好！' },
            { speaker: 'B', en: 'Good morning!', zh: '早上好！' },
            { speaker: 'A', en: 'See you tomorrow.', zh: '明天见。' },
            { speaker: 'B', en: 'See you!', zh: '再见！' },
          ]),
        ],
      },
      {
        id: 12, name: 'More Numbers & Toys', nameZh: '更多数字与玩具',
        words: [
          createWord('1-12-1', 'five', '五', '5️⃣', 'Five ducks.', '五只鸭子。'),
          createWord('1-12-2', 'six', '六', '6️⃣', 'Six books.', '六本书。'),
          createWord('1-12-3', 'seven', '七', '7️⃣', 'Seven birds.', '七只鸟。'),
          createWord('1-12-4', 'eight', '八', '8️⃣', 'Eight apples.', '八个苹果。'),
          createWord('1-12-5', 'nine', '九', '9️⃣', 'Nine balls.', '九个球。'),
          createWord('1-12-6', 'ten', '十', '🔟', 'Ten pencils.', '十支铅笔。'),
          createWord('1-12-7', 'toy', '玩具', '🧸', 'This is my toy.', '这是我的玩具。'),
          createWord('1-12-8', 'doll', '玩偶', '🪆', 'The doll is nice.', '这个玩偶很好看。'),
          createWord('1-12-9', 'kite', '风筝', '🪁', 'I can fly a kite.', '我会放风筝。'),
          createWord('1-12-10', 'robot', '机器人', '🤖', 'The robot can walk.', '这个机器人会走路。'),
        ],
        dialogues: [
          createDialogue('数一数', [
            { speaker: 'A', en: 'How many kites?', zh: '有多少个风筝？' },
            { speaker: 'B', en: 'Five kites.', zh: '五个风筝。' },
            { speaker: 'A', en: 'How many dolls?', zh: '有多少个玩偶？' },
            { speaker: 'B', en: 'Six dolls.', zh: '六个玩偶。' },
          ]),
          createDialogue('我喜欢的玩具', [
            { speaker: 'A', en: 'What is your favorite toy?', zh: '你最喜欢的玩具是什么？' },
            { speaker: 'B', en: 'My favorite toy is a robot.', zh: '我最喜欢的玩具是机器人。' },
            { speaker: 'A', en: 'I like kites.', zh: '我喜欢风筝。' },
          ]),
        ],
      },
    ],
  },
  {
    id: 2, name: '二年级', color: '#f97316', emoji: '⭐',
    units: [
      {
        id: 1, name: 'Family', nameZh: '家庭',
        words: [
          { id: '2-1-1', en: 'father', zh: '爸爸', emoji: '👨' },
          { id: '2-1-2', en: 'mother', zh: '妈妈', emoji: '👩' },
          { id: '2-1-3', en: 'brother', zh: '兄弟', emoji: '👦' },
          { id: '2-1-4', en: 'sister', zh: '姐妹', emoji: '👧' },
          { id: '2-1-5', en: 'grandpa', zh: '爷爷', emoji: '👴' },
          { id: '2-1-6', en: 'grandma', zh: '奶奶', emoji: '👵' },
          { id: '2-1-7', en: 'baby', zh: '宝宝', emoji: '👶' },
          { id: '2-1-8', en: 'family', zh: '家庭', emoji: '👪' },
        ],
      },
      {
        id: 2, name: 'Body', nameZh: '身体',
        words: [
          { id: '2-2-1', en: 'head', zh: '头', emoji: '🗣️' },
          { id: '2-2-2', en: 'eye', zh: '眼睛', emoji: '👁️' },
          { id: '2-2-3', en: 'nose', zh: '鼻子', emoji: '👃' },
          { id: '2-2-4', en: 'mouth', zh: '嘴巴', emoji: '👄' },
          { id: '2-2-5', en: 'ear', zh: '耳朵', emoji: '👂' },
          { id: '2-2-6', en: 'hand', zh: '手', emoji: '✋' },
          { id: '2-2-7', en: 'foot', zh: '脚', emoji: '🦶' },
          { id: '2-2-8', en: 'arm', zh: '手臂', emoji: '💪' },
        ],
      },
      {
        id: 3, name: 'Food', nameZh: '食物',
        words: [
          { id: '2-3-1', en: 'bread', zh: '面包', emoji: '🍞' },
          { id: '2-3-2', en: 'rice', zh: '米饭', emoji: '🍚' },
          { id: '2-3-3', en: 'milk', zh: '牛奶', emoji: '🥛' },
          { id: '2-3-4', en: 'cake', zh: '蛋糕', emoji: '🎂' },
          { id: '2-3-5', en: 'candy', zh: '糖果', emoji: '🍬' },
          { id: '2-3-6', en: 'juice', zh: '果汁', emoji: '🧃' },
          { id: '2-3-7', en: 'noodle', zh: '面条', emoji: '🍜' },
          { id: '2-3-8', en: 'water', zh: '水', emoji: '💧' },
        ],
      },
      {
        id: 4, name: 'Clothes', nameZh: '衣服',
        words: [
          { id: '2-4-1', en: 'hat', zh: '帽子', emoji: '🧢' },
          { id: '2-4-2', en: 'shirt', zh: '衬衫', emoji: '👕' },
          { id: '2-4-3', en: 'pants', zh: '裤子', emoji: '👖' },
          { id: '2-4-4', en: 'shoes', zh: '鞋子', emoji: '👟' },
          { id: '2-4-5', en: 'socks', zh: '袜子', emoji: '🧦' },
          { id: '2-4-6', en: 'dress', zh: '裙子', emoji: '👗' },
          { id: '2-4-7', en: 'coat', zh: '外套', emoji: '🧥' },
          { id: '2-4-8', en: 'bag', zh: '包', emoji: '🎒' },
        ],
      },
    ],
  },
  {
    id: 3, name: '三年级', color: '#eab308', emoji: '🌈',
    units: [
      {
        id: 1, name: 'School', nameZh: '学校',
        words: [
          { id: '3-1-1', en: 'book', zh: '书', emoji: '📖' },
          { id: '3-1-2', en: 'pen', zh: '钢笔', emoji: '🖊️' },
          { id: '3-1-3', en: 'pencil', zh: '铅笔', emoji: '✏️' },
          { id: '3-1-4', en: 'ruler', zh: '尺子', emoji: '📏' },
          { id: '3-1-5', en: 'eraser', zh: '橡皮', emoji: '🧹' },
          { id: '3-1-6', en: 'desk', zh: '书桌', emoji: '🪑' },
          { id: '3-1-7', en: 'teacher', zh: '老师', emoji: '👩‍🏫' },
          { id: '3-1-8', en: 'student', zh: '学生', emoji: '👩‍🎓' },
          { id: '3-1-9', en: 'classroom', zh: '教室', emoji: '🏫' },
          { id: '3-1-10', en: 'homework', zh: '作业', emoji: '📝' },
        ],
      },
      {
        id: 2, name: 'Weather & Time', nameZh: '天气与时间',
        words: [
          { id: '3-2-1', en: 'sunny', zh: '晴天', emoji: '☀️' },
          { id: '3-2-2', en: 'rainy', zh: '下雨', emoji: '🌧️' },
          { id: '3-2-3', en: 'cloudy', zh: '多云', emoji: '☁️' },
          { id: '3-2-4', en: 'windy', zh: '有风', emoji: '💨' },
          { id: '3-2-5', en: 'snowy', zh: '下雪', emoji: '❄️' },
          { id: '3-2-6', en: 'morning', zh: '早上', emoji: '🌅' },
          { id: '3-2-7', en: 'afternoon', zh: '下午', emoji: '🌤️' },
          { id: '3-2-8', en: 'evening', zh: '晚上', emoji: '🌙' },
          { id: '3-2-9', en: 'today', zh: '今天', emoji: '📅' },
          { id: '3-2-10', en: 'tomorrow', zh: '明天', emoji: '📆' },
        ],
      },
      {
        id: 3, name: 'Daily Life', nameZh: '日常生活',
        words: [
          { id: '3-3-1', en: 'eat', zh: '吃', emoji: '🍽️' },
          { id: '3-3-2', en: 'drink', zh: '喝', emoji: '🥤' },
          { id: '3-3-3', en: 'sleep', zh: '睡觉', emoji: '😴' },
          { id: '3-3-4', en: 'run', zh: '跑', emoji: '🏃' },
          { id: '3-3-5', en: 'read', zh: '阅读', emoji: '📚' },
          { id: '3-3-6', en: 'write', zh: '写', emoji: '✍️' },
          { id: '3-3-7', en: 'play', zh: '玩', emoji: '🎮' },
          { id: '3-3-8', en: 'sing', zh: '唱歌', emoji: '🎤' },
          { id: '3-3-9', en: 'dance', zh: '跳舞', emoji: '💃' },
          { id: '3-3-10', en: 'draw', zh: '画画', emoji: '🎨' },
        ],
      },
      {
        id: 4, name: 'Greetings', nameZh: '问候与对话',
        words: [
          { id: '3-4-1', en: 'hello', zh: '你好', emoji: '👋' },
          { id: '3-4-2', en: 'goodbye', zh: '再见', emoji: '👋' },
          { id: '3-4-3', en: 'please', zh: '请', emoji: '🙏' },
          { id: '3-4-4', en: 'thank you', zh: '谢谢', emoji: '😊' },
          { id: '3-4-5', en: 'sorry', zh: '对不起', emoji: '😔' },
          { id: '3-4-6', en: 'yes', zh: '是', emoji: '✅' },
          { id: '3-4-7', en: 'no', zh: '不', emoji: '❌' },
          { id: '3-4-8', en: 'friend', zh: '朋友', emoji: '🤝' },
        ],
      },
    ],
  },
  {
    id: 4, name: '四年级', color: '#22c55e', emoji: '🚀',
    units: [
      {
        id: 1, name: 'Places', nameZh: '地点与方位',
        words: [
          { id: '4-1-1', en: 'school', zh: '学校', emoji: '🏫' },
          { id: '4-1-2', en: 'hospital', zh: '医院', emoji: '🏥' },
          { id: '4-1-3', en: 'park', zh: '公园', emoji: '🏞️' },
          { id: '4-1-4', en: 'library', zh: '图书馆', emoji: '📚' },
          { id: '4-1-5', en: 'supermarket', zh: '超市', emoji: '🛒' },
          { id: '4-1-6', en: 'restaurant', zh: '餐厅', emoji: '🍽️' },
          { id: '4-1-7', en: 'left', zh: '左边', emoji: '⬅️' },
          { id: '4-1-8', en: 'right', zh: '右边', emoji: '➡️' },
          { id: '4-1-9', en: 'near', zh: '附近', emoji: '📍' },
          { id: '4-1-10', en: 'between', zh: '在...之间', emoji: '↔️' },
        ],
      },
      {
        id: 2, name: 'Jobs', nameZh: '职业',
        words: [
          { id: '4-2-1', en: 'doctor', zh: '医生', emoji: '👨‍⚕️' },
          { id: '4-2-2', en: 'nurse', zh: '护士', emoji: '👩‍⚕️' },
          { id: '4-2-3', en: 'police', zh: '警察', emoji: '👮' },
          { id: '4-2-4', en: 'farmer', zh: '农民', emoji: '👨‍🌾' },
          { id: '4-2-5', en: 'driver', zh: '司机', emoji: '🚗' },
          { id: '4-2-6', en: 'cook', zh: '厨师', emoji: '👨‍🍳' },
          { id: '4-2-7', en: 'pilot', zh: '飞行员', emoji: '👨‍✈️' },
          { id: '4-2-8', en: 'singer', zh: '歌手', emoji: '🎤' },
          { id: '4-2-9', en: 'writer', zh: '作家', emoji: '✍️' },
          { id: '4-2-10', en: 'scientist', zh: '科学家', emoji: '🔬' },
        ],
      },
      {
        id: 3, name: 'Activities', nameZh: '日常活动',
        words: [
          { id: '4-3-1', en: 'swimming', zh: '游泳', emoji: '🏊' },
          { id: '4-3-2', en: 'shopping', zh: '购物', emoji: '🛍️' },
          { id: '4-3-3', en: 'cooking', zh: '做饭', emoji: '🍳' },
          { id: '4-3-4', en: 'painting', zh: '画画', emoji: '🎨' },
          { id: '4-3-5', en: 'fishing', zh: '钓鱼', emoji: '🎣' },
          { id: '4-3-6', en: 'reading', zh: '阅读', emoji: '📖' },
          { id: '4-3-7', en: 'climbing', zh: '攀爬', emoji: '🧗' },
          { id: '4-3-8', en: 'camping', zh: '露营', emoji: '🏕️' },
          { id: '4-3-9', en: 'skating', zh: '溜冰', emoji: '⛸️' },
          { id: '4-3-10', en: 'hiking', zh: '远足', emoji: '🥾' },
        ],
      },
    ],
  },
  {
    id: 5, name: '五年级', color: '#3b82f6', emoji: '🎯',
    units: [
      {
        id: 1, name: 'Nature', nameZh: '自然',
        words: [
          { id: '5-1-1', en: 'mountain', zh: '山', emoji: '⛰️' },
          { id: '5-1-2', en: 'river', zh: '河流', emoji: '🏞️' },
          { id: '5-1-3', en: 'forest', zh: '森林', emoji: '🌲' },
          { id: '5-1-4', en: 'ocean', zh: '海洋', emoji: '🌊' },
          { id: '5-1-5', en: 'island', zh: '岛屿', emoji: '🏝️' },
          { id: '5-1-6', en: 'desert', zh: '沙漠', emoji: '🏜️' },
          { id: '5-1-7', en: 'lake', zh: '湖泊', emoji: '💧' },
          { id: '5-1-8', en: 'flower', zh: '花', emoji: '🌸' },
          { id: '5-1-9', en: 'grass', zh: '草', emoji: '🌿' },
          { id: '5-1-10', en: 'rainbow', zh: '彩虹', emoji: '🌈' },
        ],
      },
      {
        id: 2, name: 'Feelings', nameZh: '情感与感受',
        words: [
          { id: '5-2-1', en: 'happy', zh: '开心', emoji: '😊' },
          { id: '5-2-2', en: 'sad', zh: '伤心', emoji: '😢' },
          { id: '5-2-3', en: 'angry', zh: '生气', emoji: '😠' },
          { id: '5-2-4', en: 'tired', zh: '疲倦', emoji: '😫' },
          { id: '5-2-5', en: 'excited', zh: '兴奋', emoji: '🤩' },
          { id: '5-2-6', en: 'scared', zh: '害怕', emoji: '😨' },
          { id: '5-2-7', en: 'brave', zh: '勇敢', emoji: '💪' },
          { id: '5-2-8', en: 'kind', zh: '善良', emoji: '💝' },
          { id: '5-2-9', en: 'clever', zh: '聪明', emoji: '🧠' },
          { id: '5-2-10', en: 'beautiful', zh: '美丽', emoji: '🌺' },
        ],
      },
      {
        id: 3, name: 'Transport', nameZh: '交通工具',
        words: [
          { id: '5-3-1', en: 'bicycle', zh: '自行车', emoji: '🚲' },
          { id: '5-3-2', en: 'airplane', zh: '飞机', emoji: '✈️' },
          { id: '5-3-3', en: 'train', zh: '火车', emoji: '🚂' },
          { id: '5-3-4', en: 'subway', zh: '地铁', emoji: '🚇' },
          { id: '5-3-5', en: 'taxi', zh: '出租车', emoji: '🚕' },
          { id: '5-3-6', en: 'ship', zh: '轮船', emoji: '🚢' },
          { id: '5-3-7', en: 'motorcycle', zh: '摩托车', emoji: '🏍️' },
          { id: '5-3-8', en: 'helicopter', zh: '直升机', emoji: '🚁' },
          { id: '5-3-9', en: 'rocket', zh: '火箭', emoji: '🚀' },
          { id: '5-3-10', en: 'ambulance', zh: '救护车', emoji: '🚑' },
        ],
      },
    ],
  },
  {
    id: 6, name: '六年级', color: '#8b5cf6', emoji: '👑',
    units: [
      {
        id: 1, name: 'Subjects', nameZh: '学科与知识',
        words: [
          { id: '6-1-1', en: 'science', zh: '科学', emoji: '🔬' },
          { id: '6-1-2', en: 'history', zh: '历史', emoji: '📜' },
          { id: '6-1-3', en: 'geography', zh: '地理', emoji: '🌍' },
          { id: '6-1-4', en: 'music', zh: '音乐', emoji: '🎵' },
          { id: '6-1-5', en: 'mathematics', zh: '数学', emoji: '🔢' },
          { id: '6-1-6', en: 'language', zh: '语言', emoji: '🗣️' },
          { id: '6-1-7', en: 'computer', zh: '电脑', emoji: '💻' },
          { id: '6-1-8', en: 'experiment', zh: '实验', emoji: '🧪' },
          { id: '6-1-9', en: 'knowledge', zh: '知识', emoji: '📖' },
          { id: '6-1-10', en: 'education', zh: '教育', emoji: '🎓' },
        ],
      },
      {
        id: 2, name: 'Environment', nameZh: '环境与保护',
        words: [
          { id: '6-2-1', en: 'environment', zh: '环境', emoji: '🌍' },
          { id: '6-2-2', en: 'pollution', zh: '污染', emoji: '🏭' },
          { id: '6-2-3', en: 'recycle', zh: '回收', emoji: '♻️' },
          { id: '6-2-4', en: 'protect', zh: '保护', emoji: '🛡️' },
          { id: '6-2-5', en: 'energy', zh: '能源', emoji: '⚡' },
          { id: '6-2-6', en: 'animal', zh: '动物', emoji: '🦁' },
          { id: '6-2-7', en: 'plant', zh: '植物', emoji: '🌱' },
          { id: '6-2-8', en: 'weather', zh: '天气', emoji: '🌤️' },
          { id: '6-2-9', en: 'climate', zh: '气候', emoji: '🌡️' },
          { id: '6-2-10', en: 'nature', zh: '自然', emoji: '🍃' },
        ],
      },
      {
        id: 3, name: 'Future & Dreams', nameZh: '未来与梦想',
        words: [
          { id: '6-3-1', en: 'future', zh: '未来', emoji: '🔮' },
          { id: '6-3-2', en: 'dream', zh: '梦想', emoji: '💭' },
          { id: '6-3-3', en: 'goal', zh: '目标', emoji: '🎯' },
          { id: '6-3-4', en: 'success', zh: '成功', emoji: '🏆' },
          { id: '6-3-5', en: 'travel', zh: '旅行', emoji: '✈️' },
          { id: '6-3-6', en: 'adventure', zh: '冒险', emoji: '🗺️' },
          { id: '6-3-7', en: 'discover', zh: '发现', emoji: '🔍' },
          { id: '6-3-8', en: 'imagine', zh: '想象', emoji: '💡' },
          { id: '6-3-9', en: 'create', zh: '创造', emoji: '🎨' },
          { id: '6-3-10', en: 'universe', zh: '宇宙', emoji: '🌌' },
        ],
      },
    ],
  },
]

export function getGrade(id: number): Grade | undefined {
  return grades.find(g => g.id === id)
}

export function getUnit(gradeId: number, unitId: number): Unit | undefined {
  return getGrade(gradeId)?.units.find(u => u.id === unitId)
}

export function getWordById(id: string): Word | undefined {
  for (const grade of grades) {
    for (const unit of grade.units) {
      const word = unit.words.find(w => w.id === id)
      if (word) return word
    }
  }
  return undefined
}

export function getAllWords(): Word[] {
  return grades.flatMap(g => g.units.flatMap(u => u.words))
}
