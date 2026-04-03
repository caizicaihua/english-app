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

const baseGrades: Grade[] = [
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
          createDialogue('数字和食物', [
            { speaker: 'A', en: 'I have one apple.', zh: '我有一个苹果。' },
            { speaker: 'B', en: 'I see one egg.', zh: '我看见一个鸡蛋。' },
            { speaker: 'A', en: 'Look at the fish.', zh: '看这条鱼。' },
            { speaker: 'B', en: 'I see three fish and four balls.', zh: '我看见三条鱼和四个球。' },
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
          createDialogue('更多颜色', [
            { speaker: 'A', en: 'My apple is red and my leaf is green.', zh: '我的苹果是红色的，我的树叶是绿色的。' },
            { speaker: 'B', en: 'My paper is white and my flower is pink.', zh: '我的纸是白色的，我的花是粉色的。' },
            { speaker: 'A', en: 'My toy is orange.', zh: '我的玩具是橙色的。' },
            { speaker: 'B', en: 'The bear is brown and the grape is purple.', zh: '熊是棕色的，葡萄是紫色的。' },
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
          createDialogue('动物园里', [
            { speaker: 'A', en: 'I see a bird and a duck.', zh: '我看见一只鸟和一只鸭子。' },
            { speaker: 'B', en: 'I see a pig and a hen.', zh: '我看见一头猪和一只母鸡。' },
            { speaker: 'A', en: 'The cow is big and the rabbit can jump.', zh: '牛很大，兔子会跳。' },
            { speaker: 'B', en: 'The bear, the monkey, and the tiger are here.', zh: '熊、猴子和老虎都在这里。' },
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
          createDialogue('水果盘', [
            { speaker: 'A', en: 'This grape and this peach are sweet.', zh: '这个葡萄和这个桃子很甜。' },
            { speaker: 'B', en: 'I like mango and lemon.', zh: '我喜欢芒果和柠檬。' },
            { speaker: 'A', en: 'This cherry and this strawberry are red.', zh: '这个樱桃和这个草莓是红色的。' },
            { speaker: 'B', en: 'The melon and the watermelon are big.', zh: '甜瓜和西瓜都很大。' },
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
          createDialogue('教室里', [
            { speaker: 'A', en: 'This is my pen and pencil.', zh: '这是我的钢笔和铅笔。' },
            { speaker: 'B', en: 'My bag is on the desk.', zh: '我的书包在课桌上。' },
            { speaker: 'A', en: 'Sit on the chair, please.', zh: '请坐在椅子上。' },
            { speaker: 'B', en: 'I go to school with my class.', zh: '我和我的班级一起去学校。' },
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
          createDialogue('我的家人', [
            { speaker: 'A', en: 'Please meet my mother and my brother.', zh: '请认识一下我的妈妈和哥哥。' },
            { speaker: 'B', en: 'Thanks! They are a happy family.', zh: '谢谢！他们是一个快乐的家庭。' },
            { speaker: 'A', en: 'He is my friend too.', zh: '他也是我的朋友。' },
            { speaker: 'B', en: 'Bye!', zh: '再见！' },
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
          createDialogue('跟老师做', [
            { speaker: 'Teacher', en: 'Stand up and listen, please.', zh: '请站起来并认真听。' },
            { speaker: 'Student', en: 'Can I sit now?', zh: '我现在可以坐下吗？' },
            { speaker: 'Teacher', en: 'Close the book and draw a cat.', zh: '合上书，画一只猫。' },
            { speaker: 'Student', en: 'Please help me.', zh: '请帮帮我。' },
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
          createDialogue('介绍更多朋友', [
            { speaker: 'A', en: 'Who is she?', zh: '她是谁？' },
            { speaker: 'B', en: 'She is a girl.', zh: '她是一个女孩。' },
            { speaker: 'A', en: 'The baby is sad.', zh: '这个宝宝很难过。' },
            { speaker: 'B', en: 'He is short, but he is a good boy.', zh: '他个子矮，但他是个好男孩。' },
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
          createDialogue('做动作', [
            { speaker: 'Teacher', en: 'Touch your head, eye, and ear.', zh: '摸摸你的头、眼睛和耳朵。' },
            { speaker: 'Student', en: 'This is my mouth.', zh: '这是我的嘴巴。' },
            { speaker: 'Teacher', en: 'Stamp your foot and wave your arm.', zh: '跺跺脚，挥挥手臂。' },
            { speaker: 'Student', en: 'My leg is strong.', zh: '我的腿很有力。' },
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
          createDialogue('吃点东西', [
            { speaker: 'A', en: 'I want rice and soup.', zh: '我想要米饭和汤。' },
            { speaker: 'B', en: 'I want water and tea.', zh: '我想要水和茶。' },
            { speaker: 'A', en: 'The noodle is hot.', zh: '面条是热的。' },
            { speaker: 'B', en: 'Okay, let us eat.', zh: '好的，我们吃吧。' },
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
          createDialogue('天气变化', [
            { speaker: 'A', en: 'Is it rainy or cloudy?', zh: '是在下雨还是多云？' },
            { speaker: 'B', en: 'It is cloudy and cold.', zh: '今天多云而且很冷。' },
            { speaker: 'A', en: 'Good afternoon!', zh: '下午好！' },
            { speaker: 'B', en: 'Good evening!', zh: '晚上好！' },
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
          createDialogue('更多数字', [
            { speaker: 'A', en: 'I have seven balls and eight books.', zh: '我有七个球和八本书。' },
            { speaker: 'B', en: 'This doll and this kite are nice.', zh: '这个玩偶和这个风筝很好看。' },
            { speaker: 'A', en: 'I can count nine and ten.', zh: '我会数九和十。' },
            { speaker: 'B', en: 'Great!', zh: '太棒了！' },
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

const extraWordExamples: Record<string, NonNullable<Word['example']>> = {
  '2-1-1': { en: 'This is my father.', zh: '这是我的爸爸。' },
  '2-1-2': { en: 'This is my mother.', zh: '这是我的妈妈。' },
  '2-1-3': { en: 'My brother is kind.', zh: '我的哥哥很友好。' },
  '2-1-4': { en: 'My sister can sing.', zh: '我的姐姐会唱歌。' },
  '2-1-5': { en: 'My grandpa likes tea.', zh: '我爷爷喜欢喝茶。' },
  '2-1-6': { en: 'My grandma is happy.', zh: '我奶奶很开心。' },
  '2-1-7': { en: 'The baby is sleeping.', zh: '宝宝在睡觉。' },
  '2-1-8': { en: 'I love my family.', zh: '我爱我的家人。' },
  '2-2-1': { en: 'This is my head.', zh: '这是我的头。' },
  '2-2-2': { en: 'I have one eye in the picture.', zh: '图里我看到一只眼睛。' },
  '2-2-3': { en: 'Touch your nose.', zh: '摸摸你的鼻子。' },
  '2-2-4': { en: 'Open your mouth.', zh: '张开你的嘴巴。' },
  '2-2-5': { en: 'This is my ear.', zh: '这是我的耳朵。' },
  '2-2-6': { en: 'Raise your hand.', zh: '举起你的手。' },
  '2-2-7': { en: 'My foot is small.', zh: '我的脚很小。' },
  '2-2-8': { en: 'My arm is strong.', zh: '我的手臂很有力。' },
  '2-3-1': { en: 'I like bread.', zh: '我喜欢面包。' },
  '2-3-2': { en: 'This is rice.', zh: '这是米饭。' },
  '2-3-3': { en: 'I drink milk.', zh: '我喝牛奶。' },
  '2-3-4': { en: 'The cake is sweet.', zh: '蛋糕很甜。' },
  '2-3-5': { en: 'I have one candy.', zh: '我有一颗糖。' },
  '2-3-6': { en: 'The juice is cold.', zh: '果汁是凉的。' },
  '2-3-7': { en: 'The noodle is hot.', zh: '面条是热的。' },
  '2-3-8': { en: 'I want some water.', zh: '我想喝点水。' },
  '2-4-1': { en: 'This hat is blue.', zh: '这顶帽子是蓝色的。' },
  '2-4-2': { en: 'My shirt is white.', zh: '我的衬衫是白色的。' },
  '2-4-3': { en: 'These pants are long.', zh: '这条裤子很长。' },
  '2-4-4': { en: 'My shoes are clean.', zh: '我的鞋子很干净。' },
  '2-4-5': { en: 'These socks are warm.', zh: '这些袜子很暖和。' },
  '2-4-6': { en: 'The dress is pretty.', zh: '这条裙子很好看。' },
  '2-4-7': { en: 'Put on your coat.', zh: '穿上你的外套。' },
  '2-4-8': { en: 'My bag is on the chair.', zh: '我的包在椅子上。' },

  '3-1-1': { en: 'Open your book.', zh: '打开你的书。' },
  '3-1-2': { en: 'This is my pen.', zh: '这是我的钢笔。' },
  '3-1-3': { en: 'I have a pencil.', zh: '我有一支铅笔。' },
  '3-1-4': { en: 'The ruler is long.', zh: '尺子很长。' },
  '3-1-5': { en: 'Use the eraser, please.', zh: '请用橡皮。' },
  '3-1-6': { en: 'My desk is clean.', zh: '我的书桌很干净。' },
  '3-1-7': { en: 'Our teacher is kind.', zh: '我们的老师很亲切。' },
  '3-1-8': { en: 'The student is reading.', zh: '这个学生在读书。' },
  '3-1-9': { en: 'This classroom is bright.', zh: '这个教室很明亮。' },
  '3-1-10': { en: 'I finish my homework.', zh: '我完成了作业。' },
  '3-2-1': { en: 'It is sunny today.', zh: '今天天气晴朗。' },
  '3-2-2': { en: 'It is rainy now.', zh: '现在在下雨。' },
  '3-2-3': { en: 'The sky is cloudy.', zh: '天空是多云的。' },
  '3-2-4': { en: 'It is windy outside.', zh: '外面风很大。' },
  '3-2-5': { en: 'It is snowy in winter.', zh: '冬天下雪。' },
  '3-2-6': { en: 'Good morning, teacher.', zh: '老师，早上好。' },
  '3-2-7': { en: 'Good afternoon, Mum.', zh: '妈妈，下午好。' },
  '3-2-8': { en: 'Good evening, Dad.', zh: '爸爸，晚上好。' },
  '3-2-9': { en: 'I am busy today.', zh: '我今天很忙。' },
  '3-2-10': { en: 'See you tomorrow.', zh: '明天见。' },
  '3-3-1': { en: 'I eat an apple.', zh: '我吃一个苹果。' },
  '3-3-2': { en: 'I drink some water.', zh: '我喝一些水。' },
  '3-3-3': { en: 'I sleep at night.', zh: '我在晚上睡觉。' },
  '3-3-4': { en: 'I run in the park.', zh: '我在公园跑步。' },
  '3-3-5': { en: 'I read a book.', zh: '我读一本书。' },
  '3-3-6': { en: 'I write my name.', zh: '我写我的名字。' },
  '3-3-7': { en: 'I play with my friend.', zh: '我和朋友一起玩。' },
  '3-3-8': { en: 'We sing together.', zh: '我们一起唱歌。' },
  '3-3-9': { en: 'They dance happily.', zh: '他们开心地跳舞。' },
  '3-3-10': { en: 'I draw a flower.', zh: '我画一朵花。' },
  '3-4-1': { en: 'Hello, my friend.', zh: '你好，我的朋友。' },
  '3-4-2': { en: 'Goodbye, teacher.', zh: '老师，再见。' },
  '3-4-3': { en: 'Please sit down.', zh: '请坐下。' },
  '3-4-4': { en: 'Thank you very much.', zh: '非常感谢你。' },
  '3-4-5': { en: 'Sorry, I am late.', zh: '对不起，我迟到了。' },
  '3-4-6': { en: 'Yes, I can.', zh: '是的，我会。' },
  '3-4-7': { en: 'No, I do not know.', zh: '不，我不知道。' },
  '3-4-8': { en: 'He is my friend.', zh: '他是我的朋友。' },

  '4-1-1': { en: 'My school is near my home.', zh: '我的学校离家很近。' },
  '4-1-2': { en: 'The hospital is big.', zh: '医院很大。' },
  '4-1-3': { en: 'We play in the park.', zh: '我们在公园玩。' },
  '4-1-4': { en: 'I read in the library.', zh: '我在图书馆读书。' },
  '4-1-5': { en: 'Mum is in the supermarket.', zh: '妈妈在超市。' },
  '4-1-6': { en: 'We eat in the restaurant.', zh: '我们在餐厅吃饭。' },
  '4-1-7': { en: 'Turn left here.', zh: '在这里左转。' },
  '4-1-8': { en: 'Turn right there.', zh: '在那里右转。' },
  '4-1-9': { en: 'The shop is near the park.', zh: '商店在公园附近。' },
  '4-1-10': { en: 'The school is between two trees.', zh: '学校在两棵树之间。' },
  '4-2-1': { en: 'My uncle is a doctor.', zh: '我叔叔是一名医生。' },
  '4-2-2': { en: 'The nurse is kind.', zh: '这位护士很亲切。' },
  '4-2-3': { en: 'The police helps people.', zh: '警察帮助人们。' },
  '4-2-4': { en: 'The farmer works hard.', zh: '农民工作很努力。' },
  '4-2-5': { en: 'The driver is in the bus.', zh: '司机在公交车里。' },
  '4-2-6': { en: 'My father is a cook.', zh: '我爸爸是一名厨师。' },
  '4-2-7': { en: 'The pilot can fly high.', zh: '飞行员能飞得很高。' },
  '4-2-8': { en: 'The singer sings well.', zh: '歌手唱得很好。' },
  '4-2-9': { en: 'The writer writes stories.', zh: '作家写故事。' },
  '4-2-10': { en: 'The scientist likes experiments.', zh: '科学家喜欢做实验。' },
  '4-3-1': { en: 'I like swimming in summer.', zh: '我喜欢在夏天游泳。' },
  '4-3-2': { en: 'Mum is shopping now.', zh: '妈妈现在在购物。' },
  '4-3-3': { en: 'Dad is cooking dinner.', zh: '爸爸在做晚饭。' },
  '4-3-4': { en: 'She likes painting flowers.', zh: '她喜欢画花。' },
  '4-3-5': { en: 'Grandpa is fishing.', zh: '爷爷在钓鱼。' },
  '4-3-6': { en: 'My brother loves reading.', zh: '我哥哥喜欢阅读。' },
  '4-3-7': { en: 'They are climbing a hill.', zh: '他们在爬山。' },
  '4-3-8': { en: 'We go camping on Sunday.', zh: '我们周日去露营。' },
  '4-3-9': { en: 'The girl is skating.', zh: '那个女孩在滑冰。' },
  '4-3-10': { en: 'We are hiking together.', zh: '我们一起远足。' },

  '5-1-1': { en: 'There is a mountain far away.', zh: '远处有一座山。' },
  '5-1-2': { en: 'The river is long.', zh: '这条河很长。' },
  '5-1-3': { en: 'Many animals live in the forest.', zh: '许多动物生活在森林里。' },
  '5-1-4': { en: 'The ocean is blue.', zh: '海洋是蓝色的。' },
  '5-1-5': { en: 'The island is small.', zh: '这个岛很小。' },
  '5-1-6': { en: 'The desert is hot and dry.', zh: '沙漠又热又干。' },
  '5-1-7': { en: 'We walk by the lake.', zh: '我们沿着湖边散步。' },
  '5-1-8': { en: 'This flower is beautiful.', zh: '这朵花很漂亮。' },
  '5-1-9': { en: 'The grass is green.', zh: '草是绿色的。' },
  '5-1-10': { en: 'A rainbow is in the sky.', zh: '天空中有一道彩虹。' },
  '5-2-1': { en: 'I feel happy today.', zh: '我今天很开心。' },
  '5-2-2': { en: 'The boy looks sad.', zh: '这个男孩看起来很难过。' },
  '5-2-3': { en: 'Do not be angry.', zh: '不要生气。' },
  '5-2-4': { en: 'I am tired after class.', zh: '下课后我很累。' },
  '5-2-5': { en: 'We are excited about the trip.', zh: '我们对旅行很兴奋。' },
  '5-2-6': { en: 'The child is scared of the dark.', zh: '这个孩子害怕黑暗。' },
  '5-2-7': { en: 'The brave girl helps others.', zh: '这个勇敢的女孩帮助别人。' },
  '5-2-8': { en: 'My teacher is kind.', zh: '我的老师很善良。' },
  '5-2-9': { en: 'That clever boy answers quickly.', zh: '那个聪明的男孩回答得很快。' },
  '5-2-10': { en: 'The garden is beautiful.', zh: '花园很美。' },
  '5-3-1': { en: 'I go to school by bicycle.', zh: '我骑自行车去上学。' },
  '5-3-2': { en: 'The airplane is in the sky.', zh: '飞机在天空中。' },
  '5-3-3': { en: 'The train is fast.', zh: '火车很快。' },
  '5-3-4': { en: 'We take the subway downtown.', zh: '我们乘地铁去市中心。' },
  '5-3-5': { en: 'The taxi is yellow.', zh: '出租车是黄色的。' },
  '5-3-6': { en: 'The ship is on the sea.', zh: '轮船在海上。' },
  '5-3-7': { en: 'The motorcycle is loud.', zh: '摩托车声音很大。' },
  '5-3-8': { en: 'A helicopter flies over us.', zh: '一架直升机从我们上方飞过。' },
  '5-3-9': { en: 'The rocket goes into space.', zh: '火箭飞向太空。' },
  '5-3-10': { en: 'The ambulance comes quickly.', zh: '救护车很快就来了。' },

  '6-1-1': { en: 'Science is interesting.', zh: '科学很有趣。' },
  '6-1-2': { en: 'I learn history at school.', zh: '我在学校学习历史。' },
  '6-1-3': { en: 'Geography teaches us about the world.', zh: '地理教我们了解世界。' },
  '6-1-4': { en: 'Music makes me happy.', zh: '音乐让我开心。' },
  '6-1-5': { en: 'Mathematics is my favorite subject.', zh: '数学是我最喜欢的学科。' },
  '6-1-6': { en: 'Language helps us communicate.', zh: '语言帮助我们交流。' },
  '6-1-7': { en: 'This computer is new.', zh: '这台电脑是新的。' },
  '6-1-8': { en: 'The experiment is exciting.', zh: '这个实验很令人兴奋。' },
  '6-1-9': { en: 'Reading brings knowledge.', zh: '阅读带来知识。' },
  '6-1-10': { en: 'Education changes lives.', zh: '教育改变人生。' },
  '6-2-1': { en: 'We care about the environment.', zh: '我们关心环境。' },
  '6-2-2': { en: 'Pollution is a big problem.', zh: '污染是一个大问题。' },
  '6-2-3': { en: 'We recycle paper and bottles.', zh: '我们回收纸张和瓶子。' },
  '6-2-4': { en: 'We protect wild animals.', zh: '我们保护野生动物。' },
  '6-2-5': { en: 'Clean energy is important.', zh: '清洁能源很重要。' },
  '6-2-6': { en: 'Every animal needs a home.', zh: '每种动物都需要一个家。' },
  '6-2-7': { en: 'This plant needs water.', zh: '这株植物需要水。' },
  '6-2-8': { en: 'The weather changes quickly.', zh: '天气变化很快。' },
  '6-2-9': { en: 'Climate affects our lives.', zh: '气候影响我们的生活。' },
  '6-2-10': { en: 'Nature is full of beauty.', zh: '大自然充满美丽。' },
  '6-3-1': { en: 'The future is bright.', zh: '未来是光明的。' },
  '6-3-2': { en: 'My dream is big.', zh: '我的梦想很大。' },
  '6-3-3': { en: 'I work hard for my goal.', zh: '我为目标努力。' },
  '6-3-4': { en: 'Success comes from hard work.', zh: '成功来自努力。' },
  '6-3-5': { en: 'I want to travel the world.', zh: '我想环游世界。' },
  '6-3-6': { en: 'Adventure is waiting for us.', zh: '冒险在等着我们。' },
  '6-3-7': { en: 'We discover new things every day.', zh: '我们每天发现新事物。' },
  '6-3-8': { en: 'Imagine a better world.', zh: '想象一个更美好的世界。' },
  '6-3-9': { en: 'We create art together.', zh: '我们一起创造艺术。' },
  '6-3-10': { en: 'The universe is amazing.', zh: '宇宙很神奇。' },
}

const extraUnitDialogues: Record<string, Dialogue[]> = {
  '2-1': [
    createDialogue('认识家人', [
      { speaker: 'A', en: 'Who is he?', zh: '他是谁？' },
      { speaker: 'B', en: 'He is my father, and she is my mother.', zh: '他是我的爸爸，她是我的妈妈。' },
      { speaker: 'A', en: 'Do you have a brother or a sister?', zh: '你有哥哥或姐姐吗？' },
      { speaker: 'B', en: 'Yes, I do. I have a brother and a sister.', zh: '有的。我有一个哥哥和一个姐姐。' },
    ]),
    createDialogue('在家里', [
      { speaker: 'A', en: 'Who is in your family?', zh: '你家里都有谁？' },
      { speaker: 'B', en: 'My grandpa, grandma, and baby are at home.', zh: '我的爷爷、奶奶和宝宝都在家。' },
      { speaker: 'A', en: 'What a happy family!', zh: '多么幸福的一家人啊！' },
      { speaker: 'B', en: 'Yes, I love my family.', zh: '是的，我爱我的家人。' },
    ]),
  ],
  '2-2': [
    createDialogue('身体游戏', [
      { speaker: 'Teacher', en: 'Touch your head, eye, and nose.', zh: '摸摸你的头、眼睛和鼻子。' },
      { speaker: 'Student', en: 'Okay. This is my ear, too.', zh: '好的。这也是我的耳朵。' },
      { speaker: 'Teacher', en: 'Good. Now open your mouth.', zh: '很好。现在张开你的嘴巴。' },
    ]),
    createDialogue('做动作', [
      { speaker: 'Teacher', en: 'Raise your hand and arm, please.', zh: '请举起你的手和手臂。' },
      { speaker: 'Student', en: 'Okay. My foot is on the floor.', zh: '好的。我的脚踩在地上。' },
      { speaker: 'Teacher', en: 'Great! Show me your foot again.', zh: '很好！再把你的脚给我看看。' },
    ]),
  ],
  '2-3': [
    createDialogue('早餐时间', [
      { speaker: 'A', en: 'What do you want for breakfast?', zh: '早餐你想吃什么？' },
      { speaker: 'B', en: 'I want bread and milk.', zh: '我想要面包和牛奶。' },
      { speaker: 'A', en: 'I like rice and noodle.', zh: '我喜欢米饭和面条。' },
      { speaker: 'B', en: 'The cake is sweet, too.', zh: '蛋糕也很甜。' },
    ]),
    createDialogue('点心时间', [
      { speaker: 'A', en: 'Do you want candy or juice?', zh: '你想要糖果还是果汁？' },
      { speaker: 'B', en: 'I want juice and water, please.', zh: '我想要果汁和水，谢谢。' },
      { speaker: 'A', en: 'Here you are.', zh: '给你。' },
    ]),
  ],
  '2-4': [
    createDialogue('今天穿什么', [
      { speaker: 'A', en: 'What are you wearing today?', zh: '你今天穿什么？' },
      { speaker: 'B', en: 'My hat and shirt are blue.', zh: '我的帽子和衬衫是蓝色的。' },
      { speaker: 'A', en: 'My pants and shoes are black.', zh: '我的裤子和鞋子是黑色的。' },
      { speaker: 'B', en: 'Your socks are nice.', zh: '你的袜子很好看。' },
    ]),
    createDialogue('整理衣服', [
      { speaker: 'A', en: 'This dress is new.', zh: '这条连衣裙是新的。' },
      { speaker: 'B', en: 'Yes, it is. Put the coat in the bag, please.', zh: '是的。请把外套放进包里。' },
      { speaker: 'A', en: 'Okay. I will do it now.', zh: '好的。我现在就去做。' },
    ]),
  ],

  '3-1': [
    createDialogue('在教室里', [
      { speaker: 'Teacher', en: 'Open your book and take out your pen.', zh: '打开你的书，拿出你的钢笔。' },
      { speaker: 'Student', en: 'My pencil and ruler are on the desk.', zh: '我的铅笔和尺子在桌子上。' },
      { speaker: 'Teacher', en: 'Use the eraser if you make a mistake.', zh: '如果写错了，就用橡皮。' },
    ]),
    createDialogue('学校生活', [
      { speaker: 'A', en: 'Our teacher helps every student in the classroom.', zh: '我们的老师帮助教室里的每个学生。' },
      { speaker: 'B', en: 'I do my homework after school every day.', zh: '我每天放学后做作业。' },
      { speaker: 'A', en: 'Good job!', zh: '做得好！' },
    ]),
  ],
  '3-2': [
    createDialogue('天气预报', [
      { speaker: 'A', en: 'How is the weather today?', zh: '今天天气怎么样？' },
      { speaker: 'B', en: 'It is sunny and windy today.', zh: '今天晴朗而且有风。' },
      { speaker: 'A', en: 'What about tomorrow?', zh: '那明天呢？' },
      { speaker: 'B', en: 'It will be rainy and cloudy tomorrow.', zh: '明天会下雨而且多云。' },
    ]),
    createDialogue('一天中的时间', [
      { speaker: 'A', en: 'Good morning, Tom.', zh: '早上好，汤姆。' },
      { speaker: 'B', en: 'Good afternoon, Amy.', zh: '下午好，艾米。' },
      { speaker: 'A', en: 'It may be snowy this evening.', zh: '今晚可能会下雪。' },
      { speaker: 'B', en: 'Okay. See you tomorrow.', zh: '好的。明天见。' },
    ]),
  ],
  '3-3': [
    createDialogue('放学后', [
      { speaker: 'A', en: 'What do you do after school?', zh: '你放学后做什么？' },
      { speaker: 'B', en: 'I eat, drink, and then sleep.', zh: '我吃饭、喝水，然后睡觉。' },
      { speaker: 'A', en: 'I run in the park and read at home.', zh: '我在公园跑步，在家里读书。' },
      { speaker: 'B', en: 'That sounds great.', zh: '听起来真不错。' },
    ]),
    createDialogue('我的爱好', [
      { speaker: 'A', en: 'What do you do after class?', zh: '你下课后做什么？' },
      { speaker: 'B', en: 'I write, play, and sing after class.', zh: '我下课后写字、玩耍和唱歌。' },
      { speaker: 'A', en: 'I dance and draw with my friend.', zh: '我和朋友一起跳舞和画画。' },
      { speaker: 'B', en: 'How fun!', zh: '真有趣！' },
    ]),
  ],
  '3-4': [
    createDialogue('礼貌用语', [
      { speaker: 'A', en: 'Hello, my friend.', zh: '你好，我的朋友。' },
      { speaker: 'B', en: 'Hello! Please come in.', zh: '你好！请进。' },
      { speaker: 'A', en: 'Thank you.', zh: '谢谢你。' },
      { speaker: 'B', en: 'You are welcome.', zh: '不客气。' },
    ]),
    createDialogue('问答练习', [
      { speaker: 'A', en: 'Are you ready?', zh: '你准备好了吗？' },
      { speaker: 'B', en: 'Yes, I am.', zh: '是的，我准备好了。' },
      { speaker: 'A', en: 'Do you know the answer?', zh: '你知道答案吗？' },
      { speaker: 'B', en: 'No, sorry.', zh: '不，对不起。' },
      { speaker: 'A', en: 'Goodbye, my friend!', zh: '再见，我的朋友！' },
    ]),
  ],

  '4-1': [
    createDialogue('问路', [
      { speaker: 'A', en: 'Where is the library?', zh: '图书馆在哪里？' },
      { speaker: 'B', en: 'It is near the school.', zh: '它在学校附近。' },
      { speaker: 'A', en: 'Do I turn left or right?', zh: '我要左转还是右转？' },
      { speaker: 'B', en: 'Turn left at the park, then go right.', zh: '在公园左转，然后再向右走。' },
    ]),
    createDialogue('城市地图', [
      { speaker: 'A', en: 'Where is the hospital?', zh: '医院在哪里？' },
      { speaker: 'B', en: 'It is between the supermarket and the restaurant.', zh: '它在超市和餐厅之间。' },
      { speaker: 'A', en: 'Great, I can find it now.', zh: '太好了，我现在能找到它了。' },
    ]),
  ],
  '4-2': [
    createDialogue('长大以后', [
      { speaker: 'A', en: 'What do your family members do?', zh: '你的家人是做什么的？' },
      { speaker: 'B', en: 'My mother is a doctor, and my aunt is a nurse.', zh: '我妈妈是医生，我阿姨是护士。' },
      { speaker: 'A', en: 'My uncle is police, and my grandpa is a farmer.', zh: '我叔叔是警察，我爷爷是农民。' },
      { speaker: 'B', en: 'That is cool.', zh: '那真酷。' },
    ]),
    createDialogue('不同职业', [
      { speaker: 'A', en: 'A driver, a cook, and a pilot all work hard.', zh: '司机、厨师和飞行员都很努力。' },
      { speaker: 'B', en: 'Yes, and a singer, a writer, and a scientist are important too.', zh: '是的，歌手、作家和科学家也很重要。' },
    ]),
  ],
  '4-3': [
    createDialogue('周末计划', [
      { speaker: 'A', en: 'What do you do on weekends?', zh: '你周末做什么？' },
      { speaker: 'B', en: 'I like swimming and shopping on Saturday.', zh: '我喜欢周六游泳和购物。' },
      { speaker: 'A', en: 'My family likes cooking and painting.', zh: '我家人喜欢做饭和画画。' },
      { speaker: 'B', en: 'That sounds fun.', zh: '听起来很有趣。' },
    ]),
    createDialogue('户外活动', [
      { speaker: 'A', en: 'My dad likes fishing and reading.', zh: '我爸爸喜欢钓鱼和阅读。' },
      { speaker: 'B', en: 'I enjoy climbing, camping, skating, and hiking.', zh: '我喜欢攀爬、露营、滑冰和远足。' },
      { speaker: 'A', en: 'You have many hobbies!', zh: '你的爱好真多！' },
    ]),
  ],

  '5-1': [
    createDialogue('自然风景', [
      { speaker: 'A', en: 'What can you see in the picture?', zh: '你在图里能看到什么？' },
      { speaker: 'B', en: 'I can see a mountain, a river, and a forest.', zh: '我能看到一座山、一条河和一片森林。' },
      { speaker: 'A', en: 'I can see the ocean, a small island, and a desert too.', zh: '我还能看到海洋、小岛和沙漠。' },
    ]),
    createDialogue('美丽的大自然', [
      { speaker: 'A', en: 'We walk by the lake and see a flower.', zh: '我们沿着湖边散步，看见一朵花。' },
      { speaker: 'B', en: 'Yes. The grass is green, and the rainbow is bright.', zh: '是的。草是绿色的，彩虹很明亮。' },
    ]),
  ],
  '5-2': [
    createDialogue('今天感觉如何', [
      { speaker: 'A', en: 'How do you feel today?', zh: '你今天感觉怎么样？' },
      { speaker: 'B', en: 'I am happy, but my friend is sad.', zh: '我很开心，但我的朋友很难过。' },
      { speaker: 'A', en: 'Do not be angry or tired.', zh: '不要生气，也不要太累。' },
      { speaker: 'B', en: 'Okay, thank you.', zh: '好的，谢谢你。' },
    ]),
    createDialogue('夸夸别人', [
      { speaker: 'A', en: 'The excited child is not scared at all.', zh: '这个兴奋的孩子一点也不害怕。' },
      { speaker: 'B', en: 'Yes. She is brave, kind, clever, and beautiful.', zh: '是的。她很勇敢、善良、聪明，而且很漂亮。' },
    ]),
  ],
  '5-3': [
    createDialogue('出行方式', [
      { speaker: 'A', en: 'How do you go to school?', zh: '你怎么去上学？' },
      { speaker: 'B', en: 'I ride a bicycle, but my dad takes a taxi.', zh: '我骑自行车，但我爸爸坐出租车。' },
      { speaker: 'A', en: 'My aunt goes by subway and train.', zh: '我阿姨乘地铁和火车出行。' },
      { speaker: 'B', en: 'That is fast.', zh: '那很快。' },
    ]),
    createDialogue('天空和大海', [
      { speaker: 'A', en: 'Look! The airplane, helicopter, and rocket are in the sky.', zh: '看！飞机、直升机和火箭都在天空中。' },
      { speaker: 'B', en: 'Yes, and the ship is on the sea.', zh: '是的，而且轮船在海上。' },
      { speaker: 'A', en: 'The ambulance is on the road, and a motorcycle is loud too.', zh: '救护车在路上，而且摩托车的声音也很大。' },
    ]),
  ],

  '6-1': [
    createDialogue('喜欢的学科', [
      { speaker: 'A', en: 'What are your favorite subjects?', zh: '你最喜欢的学科是什么？' },
      { speaker: 'B', en: 'I like science, history, and geography.', zh: '我喜欢科学、历史和地理。' },
      { speaker: 'A', en: 'I love music and mathematics. Language is important too.', zh: '我喜欢音乐和数学。语言也很重要。' },
    ]),
    createDialogue('学习工具', [
      { speaker: 'A', en: 'We use a computer in the experiment class.', zh: '我们在实验课上使用电脑。' },
      { speaker: 'B', en: 'Yes. Knowledge and education help us grow.', zh: '是的。知识和教育帮助我们成长。' },
    ]),
  ],
  '6-2': [
    createDialogue('保护地球', [
      { speaker: 'A', en: 'What should we do for the environment?', zh: '我们应该为环境做些什么？' },
      { speaker: 'B', en: 'We should protect the environment.', zh: '我们应该保护环境。' },
      { speaker: 'A', en: 'Yes. Pollution hurts every animal and plant.', zh: '是的。污染伤害每一种动物和植物。' },
      { speaker: 'B', en: 'We can recycle more.', zh: '我们可以更多地回收利用。' },
    ]),
    createDialogue('自然变化', [
      { speaker: 'A', en: 'Clean energy is good for nature.', zh: '清洁能源对自然有益。' },
      { speaker: 'B', en: 'Yes. The weather and climate are changing.', zh: '是的。天气和气候正在变化。' },
    ]),
  ],
  '6-3': [
    createDialogue('我的未来', [
      { speaker: 'A', en: 'What is your dream for the future?', zh: '你对未来有什么梦想？' },
      { speaker: 'B', en: 'My future is full of hope and dream.', zh: '我的未来充满希望和梦想。' },
      { speaker: 'A', en: 'Then work hard for your goal and success.', zh: '那就为你的目标和成功努力吧。' },
      { speaker: 'B', en: 'I will.', zh: '我会的。' },
    ]),
    createDialogue('更大的世界', [
      { speaker: 'A', en: 'I want to travel and find adventure.', zh: '我想去旅行，寻找冒险。' },
      { speaker: 'B', en: 'Then you can discover, imagine, and create more.', zh: '那你就能更多地发现、想象和创造。' },
      { speaker: 'A', en: 'Yes. The universe is waiting for us.', zh: '是的。宇宙在等着我们。' },
    ]),
  ],
}

type SupplementalExampleKind = 'object' | 'action' | 'descriptor' | 'concept'

interface SupplementalWordSeed {
  id: string
  en: string
  zh: string
  emoji: string
}

interface SupplementalUnitSeed {
  id: number
  name: string
  nameZh: string
  exampleKind: SupplementalExampleKind
  words: SupplementalWordSeed[]
}

function createSupplementalWord(seed: SupplementalWordSeed, exampleKind: SupplementalExampleKind): Word {
  if (exampleKind === 'action') {
    return createWord(seed.id, seed.en, seed.zh, seed.emoji, `I can ${seed.en}.`, `我会${seed.zh}。`)
  }

  if (exampleKind === 'descriptor') {
    return createWord(seed.id, seed.en, seed.zh, seed.emoji, `It is ${seed.en}.`, `它是${seed.zh}的。`)
  }

  if (exampleKind === 'concept') {
    return createWord(seed.id, seed.en, seed.zh, seed.emoji, `We learn ${seed.en} today.`, `今天我们学习${seed.zh}。`)
  }

  return createWord(seed.id, seed.en, seed.zh, seed.emoji, `This is ${seed.en}.`, `这是${seed.zh}。`)
}

function joinEnglishWords(words: SupplementalWordSeed[]): string {
  if (words.length === 0) return ''
  if (words.length === 1) return words[0].en
  if (words.length === 2) return `${words[0].en} and ${words[1].en}`
  return `${words.slice(0, -1).map(word => word.en).join(', ')}, and ${words[words.length - 1].en}`
}

function joinChineseWords(words: SupplementalWordSeed[]): string {
  if (words.length === 0) return ''
  if (words.length === 1) return words[0].zh
  if (words.length === 2) return `${words[0].zh}和${words[1].zh}`
  return `${words.slice(0, -1).map(word => word.zh).join('、')}和${words[words.length - 1].zh}`
}

function buildSupplementalDialogue(seed: SupplementalUnitSeed): Dialogue {
  const groups = [0, 1, 2, 3].map(index => seed.words.slice(index * 4, index * 4 + 4)).filter(group => group.length > 0)

  const lines = groups.map((group, index) => {
    if (seed.exampleKind === 'action') {
      if (index === 0) {
        return {
          speaker: 'Teacher',
          en: `Today we can ${joinEnglishWords(group)}.`,
          zh: `今天我们可以${joinChineseWords(group)}。`,
        }
      }

      if (index === 1) {
        return {
          speaker: 'Student',
          en: `Yes. I can ${joinEnglishWords(group)}.`,
          zh: `是的。我会${joinChineseWords(group)}。`,
        }
      }

      if (index === 2) {
        return {
          speaker: 'Teacher',
          en: `Can you also ${joinEnglishWords(group)}?`,
          zh: `你也会${joinChineseWords(group)}吗？`,
        }
      }

      return {
        speaker: 'Student',
        en: `Yes, I can. Let us ${joinEnglishWords(group)} together.`,
        zh: `会的。让我们一起${joinChineseWords(group)}吧。`,
      }
    }

    if (seed.exampleKind === 'descriptor') {
      if (index === 0) {
        return {
          speaker: 'Teacher',
          en: `Today we use these words: ${joinEnglishWords(group)}.`,
          zh: `今天我们学习这些词：${joinChineseWords(group)}。`,
        }
      }

      if (index === 1) {
        return {
          speaker: 'Student',
          en: `I can say ${joinEnglishWords(group)}.`,
          zh: `我会说${joinChineseWords(group)}。`,
        }
      }

      if (index === 2) {
        return {
          speaker: 'Teacher',
          en: `Good. Please remember ${joinEnglishWords(group)}.`,
          zh: `很好。请记住${joinChineseWords(group)}。`,
        }
      }

      return {
        speaker: 'Student',
        en: `Okay. I can practice ${joinEnglishWords(group)}.`,
        zh: `好的。我会练习${joinChineseWords(group)}。`,
      }
    }

    if (seed.exampleKind === 'concept') {
      if (index === 0) {
        return {
          speaker: 'Teacher',
          en: `Today we learn ${joinEnglishWords(group)}.`,
          zh: `今天我们学习${joinChineseWords(group)}。`,
        }
      }

      if (index === 1) {
        return {
          speaker: 'Student',
          en: `We also learn ${joinEnglishWords(group)}.`,
          zh: `我们还学习${joinChineseWords(group)}。`,
        }
      }

      if (index === 2) {
        return {
          speaker: 'Teacher',
          en: `Can you say ${joinEnglishWords(group)}?`,
          zh: `你会说${joinChineseWords(group)}吗？`,
        }
      }

      return {
        speaker: 'Student',
        en: `Yes. Let us practice ${joinEnglishWords(group)}.`,
        zh: `会的。让我们练习${joinChineseWords(group)}。`,
      }
    }

    if (index === 0) {
      return {
        speaker: 'Teacher',
        en: `I can see ${joinEnglishWords(group)}.`,
        zh: `我能看见${joinChineseWords(group)}。`,
      }
    }

    if (index === 1) {
      return {
        speaker: 'Student',
        en: `We also see ${joinEnglishWords(group)}.`,
        zh: `我们还看见${joinChineseWords(group)}。`,
      }
    }

    if (index === 2) {
      return {
        speaker: 'Teacher',
        en: `Do you know ${joinEnglishWords(group)}?`,
        zh: `你知道${joinChineseWords(group)}吗？`,
      }
    }

    return {
      speaker: 'Student',
      en: `Yes. Let us learn ${joinEnglishWords(group)}.`,
      zh: `知道。让我们学习${joinChineseWords(group)}。`,
    }
  })

  return createDialogue(`${seed.nameZh}练习`, lines)
}

function createSupplementalUnit(seed: SupplementalUnitSeed): Unit {
  return {
    id: seed.id,
    name: seed.name,
    nameZh: seed.nameZh,
    words: seed.words.map(word => createSupplementalWord(word, seed.exampleKind)),
    dialogues: [buildSupplementalDialogue(seed)],
  }
}

const extraUnitsByGrade: Record<number, Unit[]> = {
  2: [
    createSupplementalUnit({
      id: 5,
      name: 'Home Items',
      nameZh: '家居物品',
      exampleKind: 'object',
      words: [
        { id: '2-5-1', en: 'door', zh: '门', emoji: '🚪' },
        { id: '2-5-2', en: 'window', zh: '窗户', emoji: '🪟' },
        { id: '2-5-3', en: 'table', zh: '桌子', emoji: '🪵' },
        { id: '2-5-4', en: 'chair', zh: '椅子', emoji: '🪑' },
        { id: '2-5-5', en: 'bed', zh: '床', emoji: '🛏️' },
        { id: '2-5-6', en: 'lamp', zh: '台灯', emoji: '💡' },
        { id: '2-5-7', en: 'floor', zh: '地板', emoji: '🟫' },
        { id: '2-5-8', en: 'wall', zh: '墙', emoji: '🧱' },
        { id: '2-5-9', en: 'room', zh: '房间', emoji: '🚪' },
        { id: '2-5-10', en: 'kitchen', zh: '厨房', emoji: '🍳' },
        { id: '2-5-11', en: 'bathroom', zh: '浴室', emoji: '🛁' },
        { id: '2-5-12', en: 'key', zh: '钥匙', emoji: '🔑' },
        { id: '2-5-13', en: 'clock', zh: '钟', emoji: '🕒' },
        { id: '2-5-14', en: 'cup', zh: '杯子', emoji: '☕' },
        { id: '2-5-15', en: 'plate', zh: '盘子', emoji: '🍽️' },
        { id: '2-5-16', en: 'spoon', zh: '勺子', emoji: '🥄' },
      ],
    }),
    createSupplementalUnit({
      id: 6,
      name: 'Toys & Play',
      nameZh: '玩具与游戏',
      exampleKind: 'object',
      words: [
        { id: '2-6-1', en: 'toy', zh: '玩具', emoji: '🧸' },
        { id: '2-6-2', en: 'doll', zh: '玩偶', emoji: '🪆' },
        { id: '2-6-3', en: 'robot', zh: '机器人', emoji: '🤖' },
        { id: '2-6-4', en: 'kite', zh: '风筝', emoji: '🪁' },
        { id: '2-6-5', en: 'balloon', zh: '气球', emoji: '🎈' },
        { id: '2-6-6', en: 'drum', zh: '鼓', emoji: '🥁' },
        { id: '2-6-7', en: 'puzzle', zh: '拼图', emoji: '🧩' },
        { id: '2-6-8', en: 'block', zh: '积木', emoji: '🧱' },
        { id: '2-6-9', en: 'car', zh: '小汽车', emoji: '🚗' },
        { id: '2-6-10', en: 'boat', zh: '小船', emoji: '🛶' },
        { id: '2-6-11', en: 'plane', zh: '飞机', emoji: '✈️' },
        { id: '2-6-12', en: 'train', zh: '火车', emoji: '🚂' },
        { id: '2-6-13', en: 'bike', zh: '自行车', emoji: '🚲' },
        { id: '2-6-14', en: 'game', zh: '游戏', emoji: '🎮' },
        { id: '2-6-15', en: 'card', zh: '卡片', emoji: '🃏' },
        { id: '2-6-16', en: 'cube', zh: '方块', emoji: '🧊' },
      ],
    }),
    createSupplementalUnit({
      id: 7,
      name: 'Numbers & Shapes',
      nameZh: '数字与形状',
      exampleKind: 'concept',
      words: [
        { id: '2-7-1', en: 'eleven', zh: '十一', emoji: '1️⃣1️⃣' },
        { id: '2-7-2', en: 'twelve', zh: '十二', emoji: '1️⃣2️⃣' },
        { id: '2-7-3', en: 'thirteen', zh: '十三', emoji: '1️⃣3️⃣' },
        { id: '2-7-4', en: 'fourteen', zh: '十四', emoji: '1️⃣4️⃣' },
        { id: '2-7-5', en: 'fifteen', zh: '十五', emoji: '1️⃣5️⃣' },
        { id: '2-7-6', en: 'sixteen', zh: '十六', emoji: '1️⃣6️⃣' },
        { id: '2-7-7', en: 'seventeen', zh: '十七', emoji: '1️⃣7️⃣' },
        { id: '2-7-8', en: 'eighteen', zh: '十八', emoji: '1️⃣8️⃣' },
        { id: '2-7-9', en: 'nineteen', zh: '十九', emoji: '1️⃣9️⃣' },
        { id: '2-7-10', en: 'twenty', zh: '二十', emoji: '2️⃣0️⃣' },
        { id: '2-7-11', en: 'circle', zh: '圆形', emoji: '⭕' },
        { id: '2-7-12', en: 'square', zh: '正方形', emoji: '⬜' },
        { id: '2-7-13', en: 'triangle', zh: '三角形', emoji: '🔺' },
        { id: '2-7-14', en: 'star', zh: '星星', emoji: '⭐' },
        { id: '2-7-15', en: 'heart', zh: '爱心', emoji: '❤️' },
        { id: '2-7-16', en: 'shape', zh: '形状', emoji: '🔷' },
      ],
    }),
    createSupplementalUnit({
      id: 8,
      name: 'Classroom Actions',
      nameZh: '课堂动作',
      exampleKind: 'action',
      words: [
        { id: '2-8-1', en: 'open', zh: '打开', emoji: '📖' },
        { id: '2-8-2', en: 'close', zh: '关闭', emoji: '📕' },
        { id: '2-8-3', en: 'stand', zh: '站立', emoji: '🧍' },
        { id: '2-8-4', en: 'sit', zh: '坐下', emoji: '🪑' },
        { id: '2-8-5', en: 'read', zh: '读', emoji: '📚' },
        { id: '2-8-6', en: 'write', zh: '写', emoji: '✍️' },
        { id: '2-8-7', en: 'listen', zh: '听', emoji: '👂' },
        { id: '2-8-8', en: 'speak', zh: '说', emoji: '🗣️' },
        { id: '2-8-9', en: 'look', zh: '看', emoji: '👀' },
        { id: '2-8-10', en: 'point', zh: '指', emoji: '👉' },
        { id: '2-8-11', en: 'ask', zh: '问', emoji: '❓' },
        { id: '2-8-12', en: 'answer', zh: '回答', emoji: '💬' },
        { id: '2-8-13', en: 'spell', zh: '拼写', emoji: '🔤' },
        { id: '2-8-14', en: 'show', zh: '展示', emoji: '📣' },
        { id: '2-8-15', en: 'color', zh: '涂色', emoji: '🖍️' },
        { id: '2-8-16', en: 'count', zh: '数数', emoji: '🔢' },
      ],
    }),
    createSupplementalUnit({
      id: 9,
      name: 'Nature Around Us',
      nameZh: '身边自然',
      exampleKind: 'object',
      words: [
        { id: '2-9-1', en: 'sun', zh: '太阳', emoji: '☀️' },
        { id: '2-9-2', en: 'moon', zh: '月亮', emoji: '🌙' },
        { id: '2-9-3', en: 'sky', zh: '天空', emoji: '🌌' },
        { id: '2-9-4', en: 'cloud', zh: '云', emoji: '☁️' },
        { id: '2-9-5', en: 'rain', zh: '雨', emoji: '🌧️' },
        { id: '2-9-6', en: 'wind', zh: '风', emoji: '💨' },
        { id: '2-9-7', en: 'tree', zh: '树', emoji: '🌳' },
        { id: '2-9-8', en: 'leaf', zh: '树叶', emoji: '🍃' },
        { id: '2-9-9', en: 'flower', zh: '花', emoji: '🌸' },
        { id: '2-9-10', en: 'grass', zh: '草', emoji: '🌿' },
        { id: '2-9-11', en: 'river', zh: '河', emoji: '🏞️' },
        { id: '2-9-12', en: 'hill', zh: '小山', emoji: '⛰️' },
        { id: '2-9-13', en: 'butterfly', zh: '蝴蝶', emoji: '🦋' },
        { id: '2-9-14', en: 'bee', zh: '蜜蜂', emoji: '🐝' },
        { id: '2-9-15', en: 'pond', zh: '池塘', emoji: '🪷' },
        { id: '2-9-16', en: 'stone', zh: '石头', emoji: '🪨' },
      ],
    }),
    createSupplementalUnit({
      id: 10,
      name: 'Town Places',
      nameZh: '城镇地点',
      exampleKind: 'object',
      words: [
        { id: '2-10-1', en: 'road', zh: '道路', emoji: '🛣️' },
        { id: '2-10-2', en: 'bridge', zh: '桥', emoji: '🌉' },
        { id: '2-10-3', en: 'shop', zh: '商店', emoji: '🏪' },
        { id: '2-10-4', en: 'market', zh: '市场', emoji: '🛒' },
        { id: '2-10-5', en: 'bank', zh: '银行', emoji: '🏦' },
        { id: '2-10-6', en: 'post', zh: '邮局', emoji: '📮' },
        { id: '2-10-7', en: 'office', zh: '办公室', emoji: '🏢' },
        { id: '2-10-8', en: 'street', zh: '街道', emoji: '🚶' },
        { id: '2-10-9', en: 'station', zh: '车站', emoji: '🚉' },
        { id: '2-10-10', en: 'playground', zh: '操场', emoji: '🏃' },
        { id: '2-10-11', en: 'garden', zh: '花园', emoji: '🌷' },
        { id: '2-10-12', en: 'store', zh: '店铺', emoji: '🏬' },
        { id: '2-10-13', en: 'library', zh: '图书馆', emoji: '📚' },
        { id: '2-10-14', en: 'museum', zh: '博物馆', emoji: '🏛️' },
        { id: '2-10-15', en: 'cinema', zh: '电影院', emoji: '🎬' },
        { id: '2-10-16', en: 'bakery', zh: '面包店', emoji: '🥐' },
      ],
    }),
  ],
  3: [
    createSupplementalUnit({
      id: 5,
      name: 'Family & Home',
      nameZh: '家庭与居家',
      exampleKind: 'object',
      words: [
        { id: '3-5-1', en: 'uncle', zh: '叔叔', emoji: '👨' },
        { id: '3-5-2', en: 'aunt', zh: '阿姨', emoji: '👩' },
        { id: '3-5-3', en: 'cousin', zh: '堂表兄弟姐妹', emoji: '🧒' },
        { id: '3-5-4', en: 'parent', zh: '父母', emoji: '👪' },
        { id: '3-5-5', en: 'mirror', zh: '镜子', emoji: '🪞' },
        { id: '3-5-6', en: 'blanket', zh: '毯子', emoji: '🛏️' },
        { id: '3-5-7', en: 'pillow', zh: '枕头', emoji: '🛌' },
        { id: '3-5-8', en: 'soap', zh: '肥皂', emoji: '🧼' },
        { id: '3-5-9', en: 'towel', zh: '毛巾', emoji: '🧻' },
        { id: '3-5-10', en: 'brush', zh: '刷子', emoji: '🪥' },
        { id: '3-5-11', en: 'phone', zh: '电话', emoji: '📞' },
        { id: '3-5-12', en: 'photo', zh: '照片', emoji: '🖼️' },
        { id: '3-5-13', en: 'drawer', zh: '抽屉', emoji: '🗄️' },
        { id: '3-5-14', en: 'balcony', zh: '阳台', emoji: '🏠' },
        { id: '3-5-15', en: 'fence', zh: '栅栏', emoji: '🪵' },
        { id: '3-5-16', en: 'gate', zh: '大门', emoji: '🚧' },
      ],
    }),
    createSupplementalUnit({
      id: 6,
      name: 'Sports & Games',
      nameZh: '运动与比赛',
      exampleKind: 'concept',
      words: [
        { id: '3-6-1', en: 'football', zh: '足球', emoji: '⚽' },
        { id: '3-6-2', en: 'basketball', zh: '篮球', emoji: '🏀' },
        { id: '3-6-3', en: 'tennis', zh: '网球', emoji: '🎾' },
        { id: '3-6-4', en: 'volleyball', zh: '排球', emoji: '🏐' },
        { id: '3-6-5', en: 'baseball', zh: '棒球', emoji: '⚾' },
        { id: '3-6-6', en: 'pingpong', zh: '乒乓球', emoji: '🏓' },
        { id: '3-6-7', en: 'medal', zh: '奖牌', emoji: '🏅' },
        { id: '3-6-8', en: 'match', zh: '比赛', emoji: '🥇' },
        { id: '3-6-9', en: 'team', zh: '队伍', emoji: '👥' },
        { id: '3-6-10', en: 'player', zh: '运动员', emoji: '🏃' },
        { id: '3-6-11', en: 'coach', zh: '教练', emoji: '🧑‍🏫' },
        { id: '3-6-12', en: 'stadium', zh: '体育场', emoji: '🏟️' },
        { id: '3-6-13', en: 'score', zh: '得分', emoji: '🔢' },
        { id: '3-6-14', en: 'winner', zh: '获胜者', emoji: '🏆' },
        { id: '3-6-15', en: 'loser', zh: '失败者', emoji: '😔' },
        { id: '3-6-16', en: 'referee', zh: '裁判', emoji: '🧑‍⚖️' },
      ],
    }),
    createSupplementalUnit({
      id: 7,
      name: 'Meals & Drinks',
      nameZh: '饮食与用餐',
      exampleKind: 'object',
      words: [
        { id: '3-7-1', en: 'chicken', zh: '鸡肉', emoji: '🍗' },
        { id: '3-7-2', en: 'beef', zh: '牛肉', emoji: '🥩' },
        { id: '3-7-3', en: 'vegetable', zh: '蔬菜', emoji: '🥬' },
        { id: '3-7-4', en: 'fruit', zh: '水果', emoji: '🍓' },
        { id: '3-7-5', en: 'soup', zh: '汤', emoji: '🥣' },
        { id: '3-7-6', en: 'salad', zh: '沙拉', emoji: '🥗' },
        { id: '3-7-7', en: 'sandwich', zh: '三明治', emoji: '🥪' },
        { id: '3-7-8', en: 'hamburger', zh: '汉堡包', emoji: '🍔' },
        { id: '3-7-9', en: 'dumpling', zh: '饺子', emoji: '🥟' },
        { id: '3-7-10', en: 'menu', zh: '菜单', emoji: '📋' },
        { id: '3-7-11', en: 'restaurant', zh: '餐馆', emoji: '🍽️' },
        { id: '3-7-12', en: 'waiter', zh: '服务员', emoji: '🧑‍🍳' },
        { id: '3-7-13', en: 'breakfast', zh: '早餐', emoji: '🍳' },
        { id: '3-7-14', en: 'lunch', zh: '午餐', emoji: '🥪' },
        { id: '3-7-15', en: 'dinner', zh: '晚餐', emoji: '🍛' },
        { id: '3-7-16', en: 'chef', zh: '主厨', emoji: '👨‍🍳' },
      ],
    }),
    createSupplementalUnit({
      id: 8,
      name: 'Farm & Zoo',
      nameZh: '农场与动物园',
      exampleKind: 'object',
      words: [
        { id: '3-8-1', en: 'horse', zh: '马', emoji: '🐴' },
        { id: '3-8-2', en: 'sheep', zh: '绵羊', emoji: '🐑' },
        { id: '3-8-3', en: 'goat', zh: '山羊', emoji: '🐐' },
        { id: '3-8-4', en: 'mouse', zh: '老鼠', emoji: '🐭' },
        { id: '3-8-5', en: 'lion', zh: '狮子', emoji: '🦁' },
        { id: '3-8-6', en: 'zebra', zh: '斑马', emoji: '🦓' },
        { id: '3-8-7', en: 'fox', zh: '狐狸', emoji: '🦊' },
        { id: '3-8-8', en: 'wolf', zh: '狼', emoji: '🐺' },
        { id: '3-8-9', en: 'turtle', zh: '乌龟', emoji: '🐢' },
        { id: '3-8-10', en: 'snake', zh: '蛇', emoji: '🐍' },
        { id: '3-8-11', en: 'farm', zh: '农场', emoji: '🚜' },
        { id: '3-8-12', en: 'zoo', zh: '动物园', emoji: '🦒' },
        { id: '3-8-13', en: 'tail', zh: '尾巴', emoji: '🦚' },
        { id: '3-8-14', en: 'wing', zh: '翅膀', emoji: '🪽' },
        { id: '3-8-15', en: 'feather', zh: '羽毛', emoji: '🪶' },
        { id: '3-8-16', en: 'fur', zh: '皮毛', emoji: '🧥' },
      ],
    }),
    createSupplementalUnit({
      id: 9,
      name: 'Shopping & Money',
      nameZh: '购物与金钱',
      exampleKind: 'concept',
      words: [
        { id: '3-9-1', en: 'money', zh: '钱', emoji: '💰' },
        { id: '3-9-2', en: 'coin', zh: '硬币', emoji: '🪙' },
        { id: '3-9-3', en: 'note', zh: '纸币', emoji: '💵' },
        { id: '3-9-4', en: 'price', zh: '价格', emoji: '🏷️' },
        { id: '3-9-5', en: 'gift', zh: '礼物', emoji: '🎁' },
        { id: '3-9-6', en: 'basket', zh: '篮子', emoji: '🧺' },
        { id: '3-9-7', en: 'bottle', zh: '瓶子', emoji: '🍼' },
        { id: '3-9-8', en: 'packet', zh: '小包', emoji: '📦' },
        { id: '3-9-9', en: 'ticket', zh: '票', emoji: '🎫' },
        { id: '3-9-10', en: 'shelf', zh: '架子', emoji: '🗃️' },
        { id: '3-9-11', en: 'customer', zh: '顾客', emoji: '🙋' },
        { id: '3-9-12', en: 'cashier', zh: '收银员', emoji: '🧾' },
        { id: '3-9-13', en: 'store', zh: '商店', emoji: '🏬' },
        { id: '3-9-14', en: 'change', zh: '零钱', emoji: '💴' },
        { id: '3-9-15', en: 'purse', zh: '钱包', emoji: '👛' },
        { id: '3-9-16', en: 'receipt', zh: '收据', emoji: '🧾' },
      ],
    }),
    createSupplementalUnit({
      id: 10,
      name: 'Seasons & Clothes',
      nameZh: '季节与服装',
      exampleKind: 'concept',
      words: [
        { id: '3-10-1', en: 'spring', zh: '春天', emoji: '🌱' },
        { id: '3-10-2', en: 'summer', zh: '夏天', emoji: '🌞' },
        { id: '3-10-3', en: 'autumn', zh: '秋天', emoji: '🍂' },
        { id: '3-10-4', en: 'winter', zh: '冬天', emoji: '❄️' },
        { id: '3-10-5', en: 'jacket', zh: '夹克', emoji: '🧥' },
        { id: '3-10-6', en: 'sweater', zh: '毛衣', emoji: '🧶' },
        { id: '3-10-7', en: 'skirt', zh: '短裙', emoji: '👗' },
        { id: '3-10-8', en: 'glove', zh: '手套', emoji: '🧤' },
        { id: '3-10-9', en: 'boot', zh: '靴子', emoji: '🥾' },
        { id: '3-10-10', en: 'cap', zh: '帽子', emoji: '🧢' },
        { id: '3-10-11', en: 'scarf', zh: '围巾', emoji: '🧣' },
        { id: '3-10-12', en: 'raincoat', zh: '雨衣', emoji: '🌧️' },
        { id: '3-10-13', en: 'season', zh: '季节', emoji: '📆' },
        { id: '3-10-14', en: 'holiday', zh: '假期', emoji: '🎉' },
        { id: '3-10-15', en: 'snowman', zh: '雪人', emoji: '⛄' },
        { id: '3-10-16', en: 'umbrella', zh: '雨伞', emoji: '☂️' },
      ],
    }),
  ],
  4: [
    createSupplementalUnit({
      id: 4,
      name: 'Travel & Transport',
      nameZh: '旅行与交通',
      exampleKind: 'concept',
      words: [
        { id: '4-4-1', en: 'bus', zh: '公交车', emoji: '🚌' },
        { id: '4-4-2', en: 'truck', zh: '卡车', emoji: '🚚' },
        { id: '4-4-3', en: 'taxi', zh: '出租车', emoji: '🚕' },
        { id: '4-4-4', en: 'subway', zh: '地铁', emoji: '🚇' },
        { id: '4-4-5', en: 'airport', zh: '机场', emoji: '🛫' },
        { id: '4-4-6', en: 'station', zh: '车站', emoji: '🚉' },
        { id: '4-4-7', en: 'map', zh: '地图', emoji: '🗺️' },
        { id: '4-4-8', en: 'trip', zh: '旅行', emoji: '🧳' },
        { id: '4-4-9', en: 'journey', zh: '旅程', emoji: '🚞' },
        { id: '4-4-10', en: 'passport', zh: '护照', emoji: '🛂' },
        { id: '4-4-11', en: 'luggage', zh: '行李', emoji: '🧳' },
        { id: '4-4-12', en: 'hotel', zh: '酒店', emoji: '🏨' },
        { id: '4-4-13', en: 'guide', zh: '导游', emoji: '🧑‍💼' },
        { id: '4-4-14', en: 'ticket', zh: '车票', emoji: '🎫' },
        { id: '4-4-15', en: 'harbor', zh: '港口', emoji: '⚓' },
        { id: '4-4-16', en: 'traveler', zh: '旅行者', emoji: '🚶‍♂️' },
      ],
    }),
    createSupplementalUnit({
      id: 5,
      name: 'Health & Care',
      nameZh: '健康与护理',
      exampleKind: 'concept',
      words: [
        { id: '4-5-1', en: 'fever', zh: '发烧', emoji: '🤒' },
        { id: '4-5-2', en: 'cough', zh: '咳嗽', emoji: '😷' },
        { id: '4-5-3', en: 'cold', zh: '感冒', emoji: '🤧' },
        { id: '4-5-4', en: 'headache', zh: '头痛', emoji: '🤕' },
        { id: '4-5-5', en: 'toothache', zh: '牙痛', emoji: '🦷' },
        { id: '4-5-6', en: 'medicine', zh: '药', emoji: '💊' },
        { id: '4-5-7', en: 'healthy', zh: '健康的', emoji: '💚' },
        { id: '4-5-8', en: 'strong', zh: '强壮的', emoji: '💪' },
        { id: '4-5-9', en: 'rest', zh: '休息', emoji: '🛌' },
        { id: '4-5-10', en: 'exercise', zh: '锻炼', emoji: '🏋️' },
        { id: '4-5-11', en: 'doctor', zh: '医生', emoji: '👨‍⚕️' },
        { id: '4-5-12', en: 'nurse', zh: '护士', emoji: '👩‍⚕️' },
        { id: '4-5-13', en: 'patient', zh: '病人', emoji: '🧑‍🦽' },
        { id: '4-5-14', en: 'water', zh: '水', emoji: '💧' },
        { id: '4-5-15', en: 'breakfast', zh: '早餐', emoji: '🍳' },
        { id: '4-5-16', en: 'sleep', zh: '睡眠', emoji: '😴' },
      ],
    }),
    createSupplementalUnit({
      id: 6,
      name: 'Shopping & Service',
      nameZh: '购物与服务',
      exampleKind: 'concept',
      words: [
        { id: '4-6-1', en: 'shopkeeper', zh: '店主', emoji: '🧑‍💼' },
        { id: '4-6-2', en: 'customer', zh: '顾客', emoji: '🙋' },
        { id: '4-6-3', en: 'price', zh: '价格', emoji: '🏷️' },
        { id: '4-6-4', en: 'cheap', zh: '便宜的', emoji: '💲' },
        { id: '4-6-5', en: 'expensive', zh: '昂贵的', emoji: '💸' },
        { id: '4-6-6', en: 'market', zh: '市场', emoji: '🛒' },
        { id: '4-6-7', en: 'mall', zh: '商场', emoji: '🏬' },
        { id: '4-6-8', en: 'sale', zh: '促销', emoji: '📢' },
        { id: '4-6-9', en: 'size', zh: '尺码', emoji: '📏' },
        { id: '4-6-10', en: 'choice', zh: '选择', emoji: '✅' },
        { id: '4-6-11', en: 'change', zh: '零钱', emoji: '🪙' },
        { id: '4-6-12', en: 'cash', zh: '现金', emoji: '💵' },
        { id: '4-6-13', en: 'pocket', zh: '口袋', emoji: '👖' },
        { id: '4-6-14', en: 'parcel', zh: '包裹', emoji: '📦' },
        { id: '4-6-15', en: 'service', zh: '服务', emoji: '🤝' },
        { id: '4-6-16', en: 'counter', zh: '柜台', emoji: '🧾' },
      ],
    }),
    createSupplementalUnit({
      id: 7,
      name: 'Meals & Cooking',
      nameZh: '用餐与烹饪',
      exampleKind: 'concept',
      words: [
        { id: '4-7-1', en: 'kitchen', zh: '厨房', emoji: '🍳' },
        { id: '4-7-2', en: 'fridge', zh: '冰箱', emoji: '🧊' },
        { id: '4-7-3', en: 'meat', zh: '肉', emoji: '🥩' },
        { id: '4-7-4', en: 'vegetable', zh: '蔬菜', emoji: '🥦' },
        { id: '4-7-5', en: 'fruit', zh: '水果', emoji: '🍎' },
        { id: '4-7-6', en: 'salt', zh: '盐', emoji: '🧂' },
        { id: '4-7-7', en: 'sugar', zh: '糖', emoji: '🍬' },
        { id: '4-7-8', en: 'soup', zh: '汤', emoji: '🥣' },
        { id: '4-7-9', en: 'plate', zh: '盘子', emoji: '🍽️' },
        { id: '4-7-10', en: 'bowl', zh: '碗', emoji: '🍚' },
        { id: '4-7-11', en: 'knife', zh: '刀', emoji: '🔪' },
        { id: '4-7-12', en: 'fork', zh: '叉子', emoji: '🍴' },
        { id: '4-7-13', en: 'spoon', zh: '勺子', emoji: '🥄' },
        { id: '4-7-14', en: 'cook', zh: '烹饪', emoji: '👨‍🍳' },
        { id: '4-7-15', en: 'dinner', zh: '晚餐', emoji: '🍛' },
        { id: '4-7-16', en: 'lunch', zh: '午餐', emoji: '🥪' },
      ],
    }),
    createSupplementalUnit({
      id: 8,
      name: 'Festivals',
      nameZh: '节日文化',
      exampleKind: 'concept',
      words: [
        { id: '4-8-1', en: 'birthday', zh: '生日', emoji: '🎂' },
        { id: '4-8-2', en: 'candle', zh: '蜡烛', emoji: '🕯️' },
        { id: '4-8-3', en: 'party', zh: '派对', emoji: '🥳' },
        { id: '4-8-4', en: 'gift', zh: '礼物', emoji: '🎁' },
        { id: '4-8-5', en: 'festival', zh: '节日', emoji: '🎊' },
        { id: '4-8-6', en: 'lantern', zh: '灯笼', emoji: '🏮' },
        { id: '4-8-7', en: 'dragon', zh: '龙', emoji: '🐉' },
        { id: '4-8-8', en: 'mooncake', zh: '月饼', emoji: '🥮' },
        { id: '4-8-9', en: 'dumpling', zh: '饺子', emoji: '🥟' },
        { id: '4-8-10', en: 'pumpkin', zh: '南瓜', emoji: '🎃' },
        { id: '4-8-11', en: 'christmas', zh: '圣诞节', emoji: '🎄' },
        { id: '4-8-12', en: 'santa', zh: '圣诞老人', emoji: '🎅' },
        { id: '4-8-13', en: 'reindeer', zh: '驯鹿', emoji: '🦌' },
        { id: '4-8-14', en: 'holiday', zh: '假日', emoji: '🏖️' },
        { id: '4-8-15', en: 'firework', zh: '烟花', emoji: '🎆' },
        { id: '4-8-16', en: 'parade', zh: '游行', emoji: '🎏' },
      ],
    }),
    createSupplementalUnit({
      id: 9,
      name: 'Nature & Geography',
      nameZh: '自然与地理',
      exampleKind: 'object',
      words: [
        { id: '4-9-1', en: 'forest', zh: '森林', emoji: '🌲' },
        { id: '4-9-2', en: 'desert', zh: '沙漠', emoji: '🏜️' },
        { id: '4-9-3', en: 'island', zh: '岛屿', emoji: '🏝️' },
        { id: '4-9-4', en: 'field', zh: '田野', emoji: '🌾' },
        { id: '4-9-5', en: 'lake', zh: '湖', emoji: '🏞️' },
        { id: '4-9-6', en: 'sea', zh: '海', emoji: '🌊' },
        { id: '4-9-7', en: 'beach', zh: '海滩', emoji: '🏖️' },
        { id: '4-9-8', en: 'country', zh: '国家', emoji: '🌍' },
        { id: '4-9-9', en: 'city', zh: '城市', emoji: '🏙️' },
        { id: '4-9-10', en: 'village', zh: '村庄', emoji: '🏡' },
        { id: '4-9-11', en: 'north', zh: '北方', emoji: '⬆️' },
        { id: '4-9-12', en: 'south', zh: '南方', emoji: '⬇️' },
        { id: '4-9-13', en: 'east', zh: '东方', emoji: '➡️' },
        { id: '4-9-14', en: 'west', zh: '西方', emoji: '⬅️' },
        { id: '4-9-15', en: 'valley', zh: '山谷', emoji: '🏞️' },
        { id: '4-9-16', en: 'waterfall', zh: '瀑布', emoji: '💦' },
      ],
    }),
    createSupplementalUnit({
      id: 10,
      name: 'Technology & Media',
      nameZh: '科技与媒体',
      exampleKind: 'object',
      words: [
        { id: '4-10-1', en: 'computer', zh: '电脑', emoji: '💻' },
        { id: '4-10-2', en: 'screen', zh: '屏幕', emoji: '🖥️' },
        { id: '4-10-3', en: 'keyboard', zh: '键盘', emoji: '⌨️' },
        { id: '4-10-4', en: 'mouse', zh: '鼠标', emoji: '🖱️' },
        { id: '4-10-5', en: 'tablet', zh: '平板', emoji: '📱' },
        { id: '4-10-6', en: 'camera', zh: '相机', emoji: '📷' },
        { id: '4-10-7', en: 'radio', zh: '收音机', emoji: '📻' },
        { id: '4-10-8', en: 'television', zh: '电视', emoji: '📺' },
        { id: '4-10-9', en: 'internet', zh: '互联网', emoji: '🌐' },
        { id: '4-10-10', en: 'website', zh: '网站', emoji: '🕸️' },
        { id: '4-10-11', en: 'email', zh: '电子邮件', emoji: '📧' },
        { id: '4-10-12', en: 'message', zh: '消息', emoji: '💬' },
        { id: '4-10-13', en: 'video', zh: '视频', emoji: '🎥' },
        { id: '4-10-14', en: 'picture', zh: '图片', emoji: '🖼️' },
        { id: '4-10-15', en: 'speaker', zh: '音箱', emoji: '🔊' },
        { id: '4-10-16', en: 'printer', zh: '打印机', emoji: '🖨️' },
      ],
    }),
  ],
  5: [
    createSupplementalUnit({
      id: 4,
      name: 'Community Places',
      nameZh: '社区地点',
      exampleKind: 'object',
      words: [
        { id: '5-4-1', en: 'museum', zh: '博物馆', emoji: '🏛️' },
        { id: '5-4-2', en: 'theater', zh: '剧院', emoji: '🎭' },
        { id: '5-4-3', en: 'stadium', zh: '体育场', emoji: '🏟️' },
        { id: '5-4-4', en: 'bakery', zh: '面包店', emoji: '🥐' },
        { id: '5-4-5', en: 'hotel', zh: '酒店', emoji: '🏨' },
        { id: '5-4-6', en: 'harbor', zh: '港口', emoji: '⚓' },
        { id: '5-4-7', en: 'airport', zh: '机场', emoji: '🛫' },
        { id: '5-4-8', en: 'station', zh: '车站', emoji: '🚉' },
        { id: '5-4-9', en: 'office', zh: '办公室', emoji: '🏢' },
        { id: '5-4-10', en: 'factory', zh: '工厂', emoji: '🏭' },
        { id: '5-4-11', en: 'cinema', zh: '电影院', emoji: '🎬' },
        { id: '5-4-12', en: 'hospital', zh: '医院', emoji: '🏥' },
        { id: '5-4-13', en: 'bank', zh: '银行', emoji: '🏦' },
        { id: '5-4-14', en: 'market', zh: '市场', emoji: '🛒' },
        { id: '5-4-15', en: 'bridge', zh: '桥', emoji: '🌉' },
        { id: '5-4-16', en: 'tower', zh: '塔', emoji: '🗼' },
      ],
    }),
    createSupplementalUnit({
      id: 5,
      name: 'Health & Habits',
      nameZh: '健康与习惯',
      exampleKind: 'concept',
      words: [
        { id: '5-5-1', en: 'health', zh: '健康', emoji: '💚' },
        { id: '5-5-2', en: 'habit', zh: '习惯', emoji: '🔁' },
        { id: '5-5-3', en: 'exercise', zh: '锻炼', emoji: '🏃' },
        { id: '5-5-4', en: 'jog', zh: '慢跑', emoji: '🏃‍♂️' },
        { id: '5-5-5', en: 'stretch', zh: '伸展', emoji: '🤸' },
        { id: '5-5-6', en: 'clean', zh: '清洁', emoji: '🧼' },
        { id: '5-5-7', en: 'wash', zh: '洗', emoji: '🚿' },
        { id: '5-5-8', en: 'brush', zh: '刷', emoji: '🪥' },
        { id: '5-5-9', en: 'protect', zh: '保护', emoji: '🛡️' },
        { id: '5-5-10', en: 'virus', zh: '病毒', emoji: '🦠' },
        { id: '5-5-11', en: 'germ', zh: '细菌', emoji: '🧫' },
        { id: '5-5-12', en: 'patient', zh: '病人', emoji: '🧑‍🦽' },
        { id: '5-5-13', en: 'doctor', zh: '医生', emoji: '👨‍⚕️' },
        { id: '5-5-14', en: 'nurse', zh: '护士', emoji: '👩‍⚕️' },
        { id: '5-5-15', en: 'breakfast', zh: '早餐', emoji: '🍳' },
        { id: '5-5-16', en: 'vitamin', zh: '维生素', emoji: '💊' },
      ],
    }),
    createSupplementalUnit({
      id: 6,
      name: 'Space & Astronomy',
      nameZh: '太空与天文',
      exampleKind: 'concept',
      words: [
        { id: '5-6-1', en: 'planet', zh: '行星', emoji: '🪐' },
        { id: '5-6-2', en: 'earth', zh: '地球', emoji: '🌍' },
        { id: '5-6-3', en: 'mars', zh: '火星', emoji: '🔴' },
        { id: '5-6-4', en: 'moon', zh: '月球', emoji: '🌕' },
        { id: '5-6-5', en: 'star', zh: '星星', emoji: '⭐' },
        { id: '5-6-6', en: 'space', zh: '太空', emoji: '🌌' },
        { id: '5-6-7', en: 'rocket', zh: '火箭', emoji: '🚀' },
        { id: '5-6-8', en: 'astronaut', zh: '宇航员', emoji: '👨‍🚀' },
        { id: '5-6-9', en: 'galaxy', zh: '星系', emoji: '✨' },
        { id: '5-6-10', en: 'comet', zh: '彗星', emoji: '☄️' },
        { id: '5-6-11', en: 'satellite', zh: '卫星', emoji: '🛰️' },
        { id: '5-6-12', en: 'telescope', zh: '望远镜', emoji: '🔭' },
        { id: '5-6-13', en: 'orbit', zh: '轨道', emoji: '⭕' },
        { id: '5-6-14', en: 'spaceship', zh: '宇宙飞船', emoji: '🛸' },
        { id: '5-6-15', en: 'meteor', zh: '流星', emoji: '🌠' },
        { id: '5-6-16', en: 'solar', zh: '太阳的', emoji: '☀️' },
      ],
    }),
    createSupplementalUnit({
      id: 7,
      name: 'Science Lab',
      nameZh: '科学实验室',
      exampleKind: 'concept',
      words: [
        { id: '5-7-1', en: 'science', zh: '科学', emoji: '🔬' },
        { id: '5-7-2', en: 'experiment', zh: '实验', emoji: '🧪' },
        { id: '5-7-3', en: 'battery', zh: '电池', emoji: '🔋' },
        { id: '5-7-4', en: 'magnet', zh: '磁铁', emoji: '🧲' },
        { id: '5-7-5', en: 'energy', zh: '能量', emoji: '⚡' },
        { id: '5-7-6', en: 'machine', zh: '机器', emoji: '⚙️' },
        { id: '5-7-7', en: 'metal', zh: '金属', emoji: '🔩' },
        { id: '5-7-8', en: 'glass', zh: '玻璃', emoji: '🥛' },
        { id: '5-7-9', en: 'plastic', zh: '塑料', emoji: '🧴' },
        { id: '5-7-10', en: 'liquid', zh: '液体', emoji: '💧' },
        { id: '5-7-11', en: 'solid', zh: '固体', emoji: '🧊' },
        { id: '5-7-12', en: 'gas', zh: '气体', emoji: '☁️' },
        { id: '5-7-13', en: 'temperature', zh: '温度', emoji: '🌡️' },
        { id: '5-7-14', en: 'measure', zh: '测量', emoji: '📏' },
        { id: '5-7-15', en: 'test', zh: '测试', emoji: '✅' },
        { id: '5-7-16', en: 'tool', zh: '工具', emoji: '🧰' },
      ],
    }),
    createSupplementalUnit({
      id: 8,
      name: 'Communication',
      nameZh: '交流表达',
      exampleKind: 'concept',
      words: [
        { id: '5-8-1', en: 'letter', zh: '信', emoji: '✉️' },
        { id: '5-8-2', en: 'email', zh: '邮件', emoji: '📧' },
        { id: '5-8-3', en: 'call', zh: '打电话', emoji: '📞' },
        { id: '5-8-4', en: 'chat', zh: '聊天', emoji: '💬' },
        { id: '5-8-5', en: 'speak', zh: '说', emoji: '🗣️' },
        { id: '5-8-6', en: 'listen', zh: '听', emoji: '👂' },
        { id: '5-8-7', en: 'question', zh: '问题', emoji: '❓' },
        { id: '5-8-8', en: 'answer', zh: '回答', emoji: '💡' },
        { id: '5-8-9', en: 'report', zh: '报告', emoji: '📄' },
        { id: '5-8-10', en: 'story', zh: '故事', emoji: '📚' },
        { id: '5-8-11', en: 'message', zh: '信息', emoji: '📩' },
        { id: '5-8-12', en: 'news', zh: '新闻', emoji: '📰' },
        { id: '5-8-13', en: 'voice', zh: '声音', emoji: '🎙️' },
        { id: '5-8-14', en: 'word', zh: '单词', emoji: '🔤' },
        { id: '5-8-15', en: 'sentence', zh: '句子', emoji: '📝' },
        { id: '5-8-16', en: 'paragraph', zh: '段落', emoji: '📃' },
      ],
    }),
    createSupplementalUnit({
      id: 9,
      name: 'Travel Plans',
      nameZh: '旅行计划',
      exampleKind: 'concept',
      words: [
        { id: '5-9-1', en: 'travel', zh: '旅行', emoji: '✈️' },
        { id: '5-9-2', en: 'visit', zh: '参观', emoji: '🏛️' },
        { id: '5-9-3', en: 'guide', zh: '导游', emoji: '🧑‍💼' },
        { id: '5-9-4', en: 'hotel', zh: '酒店', emoji: '🏨' },
        { id: '5-9-5', en: 'passport', zh: '护照', emoji: '🛂' },
        { id: '5-9-6', en: 'map', zh: '地图', emoji: '🗺️' },
        { id: '5-9-7', en: 'camera', zh: '相机', emoji: '📷' },
        { id: '5-9-8', en: 'luggage', zh: '行李', emoji: '🧳' },
        { id: '5-9-9', en: 'journey', zh: '旅程', emoji: '🚄' },
        { id: '5-9-10', en: 'holiday', zh: '假期', emoji: '🏖️' },
        { id: '5-9-11', en: 'beach', zh: '海滩', emoji: '🏝️' },
        { id: '5-9-12', en: 'mountain', zh: '山', emoji: '⛰️' },
        { id: '5-9-13', en: 'train', zh: '火车', emoji: '🚂' },
        { id: '5-9-14', en: 'bus', zh: '公交车', emoji: '🚌' },
        { id: '5-9-15', en: 'plane', zh: '飞机', emoji: '✈️' },
        { id: '5-9-16', en: 'ship', zh: '轮船', emoji: '🚢' },
      ],
    }),
    createSupplementalUnit({
      id: 10,
      name: 'Environment Actions',
      nameZh: '环保行动',
      exampleKind: 'concept',
      words: [
        { id: '5-10-1', en: 'recycle', zh: '回收', emoji: '♻️' },
        { id: '5-10-2', en: 'reuse', zh: '再利用', emoji: '🔁' },
        { id: '5-10-3', en: 'save', zh: '节约', emoji: '💧' },
        { id: '5-10-4', en: 'plant', zh: '种植', emoji: '🌱' },
        { id: '5-10-5', en: 'clean', zh: '清理', emoji: '🧹' },
        { id: '5-10-6', en: 'protect', zh: '保护', emoji: '🛡️' },
        { id: '5-10-7', en: 'waste', zh: '浪费', emoji: '🗑️' },
        { id: '5-10-8', en: 'trash', zh: '垃圾', emoji: '🗑️' },
        { id: '5-10-9', en: 'paper', zh: '纸', emoji: '📄' },
        { id: '5-10-10', en: 'bottle', zh: '瓶子', emoji: '🍼' },
        { id: '5-10-11', en: 'bag', zh: '袋子', emoji: '🛍️' },
        { id: '5-10-12', en: 'light', zh: '灯', emoji: '💡' },
        { id: '5-10-13', en: 'air', zh: '空气', emoji: '🌬️' },
        { id: '5-10-14', en: 'earth', zh: '地球', emoji: '🌍' },
        { id: '5-10-15', en: 'forest', zh: '森林', emoji: '🌲' },
        { id: '5-10-16', en: 'water', zh: '水', emoji: '💧' },
      ],
    }),
    createSupplementalUnit({
      id: 11,
      name: 'Culture & Arts',
      nameZh: '文化与艺术',
      exampleKind: 'concept',
      words: [
        { id: '5-11-1', en: 'music', zh: '音乐', emoji: '🎵' },
        { id: '5-11-2', en: 'painting', zh: '绘画', emoji: '🎨' },
        { id: '5-11-3', en: 'dance', zh: '舞蹈', emoji: '💃' },
        { id: '5-11-4', en: 'drama', zh: '戏剧', emoji: '🎭' },
        { id: '5-11-5', en: 'song', zh: '歌曲', emoji: '🎤' },
        { id: '5-11-6', en: 'artist', zh: '艺术家', emoji: '🧑‍🎨' },
        { id: '5-11-7', en: 'piano', zh: '钢琴', emoji: '🎹' },
        { id: '5-11-8', en: 'guitar', zh: '吉他', emoji: '🎸' },
        { id: '5-11-9', en: 'violin', zh: '小提琴', emoji: '🎻' },
        { id: '5-11-10', en: 'poem', zh: '诗', emoji: '📜' },
        { id: '5-11-11', en: 'picture', zh: '图画', emoji: '🖼️' },
        { id: '5-11-12', en: 'show', zh: '演出', emoji: '🎟️' },
        { id: '5-11-13', en: 'photo', zh: '照片', emoji: '📷' },
        { id: '5-11-14', en: 'color', zh: '色彩', emoji: '🌈' },
        { id: '5-11-15', en: 'design', zh: '设计', emoji: '📐' },
        { id: '5-11-16', en: 'melody', zh: '旋律', emoji: '🎶' },
      ],
    }),
  ],
  6: [
    createSupplementalUnit({
      id: 4,
      name: 'School Projects',
      nameZh: '学校项目',
      exampleKind: 'concept',
      words: [
        { id: '6-4-1', en: 'project', zh: '项目', emoji: '📁' },
        { id: '6-4-2', en: 'research', zh: '研究', emoji: '🔍' },
        { id: '6-4-3', en: 'presentation', zh: '展示', emoji: '📽️' },
        { id: '6-4-4', en: 'teamwork', zh: '团队合作', emoji: '🤝' },
        { id: '6-4-5', en: 'leader', zh: '组长', emoji: '🧑‍💼' },
        { id: '6-4-6', en: 'member', zh: '成员', emoji: '👤' },
        { id: '6-4-7', en: 'topic', zh: '主题', emoji: '🏷️' },
        { id: '6-4-8', en: 'report', zh: '报告', emoji: '📄' },
        { id: '6-4-9', en: 'poster', zh: '海报', emoji: '🪧' },
        { id: '6-4-10', en: 'data', zh: '数据', emoji: '📊' },
        { id: '6-4-11', en: 'source', zh: '来源', emoji: '📚' },
        { id: '6-4-12', en: 'note', zh: '笔记', emoji: '📝' },
        { id: '6-4-13', en: 'summary', zh: '总结', emoji: '📋' },
        { id: '6-4-14', en: 'question', zh: '问题', emoji: '❓' },
        { id: '6-4-15', en: 'answer', zh: '答案', emoji: '💡' },
        { id: '6-4-16', en: 'result', zh: '结果', emoji: '✅' },
      ],
    }),
    createSupplementalUnit({
      id: 5,
      name: 'Society & Rules',
      nameZh: '社会与规则',
      exampleKind: 'concept',
      words: [
        { id: '6-5-1', en: 'society', zh: '社会', emoji: '🏙️' },
        { id: '6-5-2', en: 'rule', zh: '规则', emoji: '📏' },
        { id: '6-5-3', en: 'law', zh: '法律', emoji: '⚖️' },
        { id: '6-5-4', en: 'safety', zh: '安全', emoji: '🦺' },
        { id: '6-5-5', en: 'danger', zh: '危险', emoji: '⚠️' },
        { id: '6-5-6', en: 'traffic', zh: '交通', emoji: '🚦' },
        { id: '6-5-7', en: 'respect', zh: '尊重', emoji: '🙏' },
        { id: '6-5-8', en: 'honest', zh: '诚实的', emoji: '😊' },
        { id: '6-5-9', en: 'fair', zh: '公平的', emoji: '⚖️' },
        { id: '6-5-10', en: 'share', zh: '分享', emoji: '🤲' },
        { id: '6-5-11', en: 'public', zh: '公共的', emoji: '🏢' },
        { id: '6-5-12', en: 'right', zh: '权利', emoji: '✅' },
        { id: '6-5-13', en: 'duty', zh: '责任', emoji: '📌' },
        { id: '6-5-14', en: 'responsibility', zh: '责任感', emoji: '🧭' },
        { id: '6-5-15', en: 'order', zh: '秩序', emoji: '📚' },
        { id: '6-5-16', en: 'behavior', zh: '行为', emoji: '🙂' },
      ],
    }),
    createSupplementalUnit({
      id: 6,
      name: 'Technology & Internet',
      nameZh: '科技与网络',
      exampleKind: 'concept',
      words: [
        { id: '6-6-1', en: 'computer', zh: '电脑', emoji: '💻' },
        { id: '6-6-2', en: 'internet', zh: '网络', emoji: '🌐' },
        { id: '6-6-3', en: 'website', zh: '网站', emoji: '🕸️' },
        { id: '6-6-4', en: 'password', zh: '密码', emoji: '🔐' },
        { id: '6-6-5', en: 'online', zh: '在线', emoji: '🟢' },
        { id: '6-6-6', en: 'search', zh: '搜索', emoji: '🔎' },
        { id: '6-6-7', en: 'download', zh: '下载', emoji: '⬇️' },
        { id: '6-6-8', en: 'upload', zh: '上传', emoji: '⬆️' },
        { id: '6-6-9', en: 'email', zh: '电子邮件', emoji: '📧' },
        { id: '6-6-10', en: 'video', zh: '视频', emoji: '🎥' },
        { id: '6-6-11', en: 'keyboard', zh: '键盘', emoji: '⌨️' },
        { id: '6-6-12', en: 'screen', zh: '屏幕', emoji: '🖥️' },
        { id: '6-6-13', en: 'program', zh: '程序', emoji: '💾' },
        { id: '6-6-14', en: 'robot', zh: '机器人', emoji: '🤖' },
        { id: '6-6-15', en: 'digital', zh: '数字化的', emoji: '🔢' },
        { id: '6-6-16', en: 'device', zh: '设备', emoji: '📱' },
      ],
    }),
    createSupplementalUnit({
      id: 7,
      name: 'World & Countries',
      nameZh: '世界与国家',
      exampleKind: 'concept',
      words: [
        { id: '6-7-1', en: 'world', zh: '世界', emoji: '🌍' },
        { id: '6-7-2', en: 'country', zh: '国家', emoji: '🗺️' },
        { id: '6-7-3', en: 'capital', zh: '首都', emoji: '🏙️' },
        { id: '6-7-4', en: 'language', zh: '语言', emoji: '🗣️' },
        { id: '6-7-5', en: 'culture', zh: '文化', emoji: '🎎' },
        { id: '6-7-6', en: 'map', zh: '地图', emoji: '🗺️' },
        { id: '6-7-7', en: 'flag', zh: '旗帜', emoji: '🚩' },
        { id: '6-7-8', en: 'continent', zh: '大陆', emoji: '🌎' },
        { id: '6-7-9', en: 'asia', zh: '亚洲', emoji: '🌏' },
        { id: '6-7-10', en: 'europe', zh: '欧洲', emoji: '🏰' },
        { id: '6-7-11', en: 'africa', zh: '非洲', emoji: '🦁' },
        { id: '6-7-12', en: 'america', zh: '美洲', emoji: '🗽' },
        { id: '6-7-13', en: 'ocean', zh: '海洋', emoji: '🌊' },
        { id: '6-7-14', en: 'mountain', zh: '山', emoji: '⛰️' },
        { id: '6-7-15', en: 'river', zh: '河流', emoji: '🏞️' },
        { id: '6-7-16', en: 'city', zh: '城市', emoji: '🏙️' },
      ],
    }),
    createSupplementalUnit({
      id: 8,
      name: 'Energy & Resources',
      nameZh: '能源与资源',
      exampleKind: 'concept',
      words: [
        { id: '6-8-1', en: 'energy', zh: '能源', emoji: '⚡' },
        { id: '6-8-2', en: 'electricity', zh: '电', emoji: '💡' },
        { id: '6-8-3', en: 'solar', zh: '太阳能的', emoji: '☀️' },
        { id: '6-8-4', en: 'wind', zh: '风能', emoji: '💨' },
        { id: '6-8-5', en: 'resource', zh: '资源', emoji: '📦' },
        { id: '6-8-6', en: 'fuel', zh: '燃料', emoji: '⛽' },
        { id: '6-8-7', en: 'coal', zh: '煤', emoji: '🪨' },
        { id: '6-8-8', en: 'oil', zh: '石油', emoji: '🛢️' },
        { id: '6-8-9', en: 'gas', zh: '天然气', emoji: '🔥' },
        { id: '6-8-10', en: 'power', zh: '电力', emoji: '🔌' },
        { id: '6-8-11', en: 'recycle', zh: '回收', emoji: '♻️' },
        { id: '6-8-12', en: 'plastic', zh: '塑料', emoji: '🧴' },
        { id: '6-8-13', en: 'paper', zh: '纸', emoji: '📄' },
        { id: '6-8-14', en: 'metal', zh: '金属', emoji: '🔩' },
        { id: '6-8-15', en: 'water', zh: '水', emoji: '💧' },
        { id: '6-8-16', en: 'light', zh: '光', emoji: '🔆' },
      ],
    }),
    createSupplementalUnit({
      id: 9,
      name: 'Personal Growth',
      nameZh: '个人成长',
      exampleKind: 'concept',
      words: [
        { id: '6-9-1', en: 'progress', zh: '进步', emoji: '📈' },
        { id: '6-9-2', en: 'challenge', zh: '挑战', emoji: '🧗' },
        { id: '6-9-3', en: 'confidence', zh: '自信', emoji: '😌' },
        { id: '6-9-4', en: 'choice', zh: '选择', emoji: '✅' },
        { id: '6-9-5', en: 'habit', zh: '习惯', emoji: '🔁' },
        { id: '6-9-6', en: 'effort', zh: '努力', emoji: '💪' },
        { id: '6-9-7', en: 'practice', zh: '练习', emoji: '📝' },
        { id: '6-9-8', en: 'improve', zh: '提高', emoji: '📈' },
        { id: '6-9-9', en: 'learn', zh: '学习', emoji: '📚' },
        { id: '6-9-10', en: 'skill', zh: '技能', emoji: '🛠️' },
        { id: '6-9-11', en: 'patient', zh: '耐心的', emoji: '🙂' },
        { id: '6-9-12', en: 'careful', zh: '认真的', emoji: '🔍' },
        { id: '6-9-13', en: 'creative', zh: '有创造力的', emoji: '🎨' },
        { id: '6-9-14', en: 'helpful', zh: '乐于助人的', emoji: '🤝' },
        { id: '6-9-15', en: 'active', zh: '积极的', emoji: '🏃' },
        { id: '6-9-16', en: 'independent', zh: '独立的', emoji: '🌟' },
      ],
    }),
    createSupplementalUnit({
      id: 10,
      name: 'Future Jobs',
      nameZh: '未来职业',
      exampleKind: 'concept',
      words: [
        { id: '6-10-1', en: 'engineer', zh: '工程师', emoji: '🧑‍🔧' },
        { id: '6-10-2', en: 'designer', zh: '设计师', emoji: '🧑‍🎨' },
        { id: '6-10-3', en: 'teacher', zh: '老师', emoji: '👩‍🏫' },
        { id: '6-10-4', en: 'doctor', zh: '医生', emoji: '👨‍⚕️' },
        { id: '6-10-5', en: 'writer', zh: '作家', emoji: '✍️' },
        { id: '6-10-6', en: 'artist', zh: '艺术家', emoji: '🎨' },
        { id: '6-10-7', en: 'scientist', zh: '科学家', emoji: '🔬' },
        { id: '6-10-8', en: 'pilot', zh: '飞行员', emoji: '🧑‍✈️' },
        { id: '6-10-9', en: 'chef', zh: '厨师', emoji: '👨‍🍳' },
        { id: '6-10-10', en: 'farmer', zh: '农民', emoji: '👨‍🌾' },
        { id: '6-10-11', en: 'manager', zh: '经理', emoji: '🧑‍💼' },
        { id: '6-10-12', en: 'reporter', zh: '记者', emoji: '🎤' },
        { id: '6-10-13', en: 'programmer', zh: '程序员', emoji: '👨‍💻' },
        { id: '6-10-14', en: 'lawyer', zh: '律师', emoji: '⚖️' },
        { id: '6-10-15', en: 'actor', zh: '演员', emoji: '🎬' },
        { id: '6-10-16', en: 'leader', zh: '领导者', emoji: '🌟' },
      ],
    }),
    createSupplementalUnit({
      id: 11,
      name: 'News & Media',
      nameZh: '新闻与媒体',
      exampleKind: 'concept',
      words: [
        { id: '6-11-1', en: 'news', zh: '新闻', emoji: '📰' },
        { id: '6-11-2', en: 'newspaper', zh: '报纸', emoji: '🗞️' },
        { id: '6-11-3', en: 'magazine', zh: '杂志', emoji: '📖' },
        { id: '6-11-4', en: 'article', zh: '文章', emoji: '📄' },
        { id: '6-11-5', en: 'interview', zh: '采访', emoji: '🎙️' },
        { id: '6-11-6', en: 'reporter', zh: '记者', emoji: '🎤' },
        { id: '6-11-7', en: 'camera', zh: '摄像机', emoji: '📹' },
        { id: '6-11-8', en: 'video', zh: '视频', emoji: '🎥' },
        { id: '6-11-9', en: 'audio', zh: '音频', emoji: '🎧' },
        { id: '6-11-10', en: 'radio', zh: '广播', emoji: '📻' },
        { id: '6-11-11', en: 'television', zh: '电视', emoji: '📺' },
        { id: '6-11-12', en: 'headline', zh: '标题', emoji: '📝' },
        { id: '6-11-13', en: 'story', zh: '报道', emoji: '📚' },
        { id: '6-11-14', en: 'photo', zh: '照片', emoji: '📷' },
        { id: '6-11-15', en: 'message', zh: '信息', emoji: '💬' },
        { id: '6-11-16', en: 'information', zh: '信息资料', emoji: 'ℹ️' },
      ],
    }),
    createSupplementalUnit({
      id: 12,
      name: 'Creative Thinking',
      nameZh: '创造性思维',
      exampleKind: 'concept',
      words: [
        { id: '6-12-1', en: 'idea', zh: '想法', emoji: '💡' },
        { id: '6-12-2', en: 'imagine', zh: '想象', emoji: '🌈' },
        { id: '6-12-3', en: 'invent', zh: '发明', emoji: '🛠️' },
        { id: '6-12-4', en: 'create', zh: '创造', emoji: '🎨' },
        { id: '6-12-5', en: 'solve', zh: '解决', emoji: '🧩' },
        { id: '6-12-6', en: 'problem', zh: '问题', emoji: '❓' },
        { id: '6-12-7', en: 'method', zh: '方法', emoji: '📐' },
        { id: '6-12-8', en: 'reason', zh: '原因', emoji: '🧠' },
        { id: '6-12-9', en: 'pattern', zh: '规律', emoji: '🔁' },
        { id: '6-12-10', en: 'model', zh: '模型', emoji: '🏗️' },
        { id: '6-12-11', en: 'experiment', zh: '实验', emoji: '🧪' },
        { id: '6-12-12', en: 'design', zh: '设计', emoji: '📏' },
        { id: '6-12-13', en: 'draw', zh: '绘制', emoji: '✏️' },
        { id: '6-12-14', en: 'build', zh: '建造', emoji: '🧱' },
        { id: '6-12-15', en: 'discover', zh: '发现', emoji: '🔍' },
        { id: '6-12-16', en: 'wonder', zh: '惊奇', emoji: '✨' },
      ],
    }),
  ],
}

function enrichGrades(grades: Grade[]): Grade[] {
  return grades.map(grade => ({
    ...grade,
    units: [
      ...grade.units.map(unit => ({
        ...unit,
        words: unit.words.map(word => (
          word.example || !extraWordExamples[word.id]
            ? word
            : { ...word, example: extraWordExamples[word.id] }
        )),
        dialogues: unit.dialogues ?? extraUnitDialogues[`${grade.id}-${unit.id}`],
      })),
      ...(extraUnitsByGrade[grade.id] ?? []),
    ],
  }))
}

export const grades: Grade[] = enrichGrades(baseGrades)

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
