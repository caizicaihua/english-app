import type { Grade } from '../gradeTypes'

export const grade2: Grade = {
  "id": 2,
  "name": "二年级",
  "color": "#f97316",
  "emoji": "⭐",
  "units": [
    {
      "id": 1,
      "name": "Family",
      "nameZh": "家庭",
      "words": [
        {
          "id": "2-1-1",
          "en": "uncle",
          "zh": "叔叔；舅舅",
          "emoji": "👨",
          "example": {
            "en": "This is my uncle.",
            "zh": "这是我的叔叔。"
          }
        },
        {
          "id": "2-1-2",
          "en": "aunt",
          "zh": "阿姨；姑姑；婶婶",
          "emoji": "👩",
          "example": {
            "en": "This is my aunt.",
            "zh": "这是我的阿姨。"
          }
        },
        {
          "id": "2-1-3",
          "en": "cousin",
          "zh": "堂亲；表亲",
          "emoji": "🧒",
          "example": {
            "en": "My cousin is kind.",
            "zh": "我的表亲很友好。"
          }
        },
        {
          "id": "2-1-4",
          "en": "parents",
          "zh": "父母",
          "emoji": "👪",
          "example": {
            "en": "My parents love me.",
            "zh": "我的父母爱我。"
          }
        },
        {
          "id": "2-1-5",
          "en": "grandpa",
          "zh": "爷爷；外公",
          "emoji": "👴",
          "example": {
            "en": "My grandpa likes tea.",
            "zh": "我爷爷喜欢喝茶。"
          }
        },
        {
          "id": "2-1-6",
          "en": "grandma",
          "zh": "奶奶；外婆",
          "emoji": "👵",
          "example": {
            "en": "My grandma is happy.",
            "zh": "我奶奶很开心。"
          }
        },
        {
          "id": "2-1-7",
          "en": "child",
          "zh": "小孩",
          "emoji": "🧒",
          "example": {
            "en": "The child is happy.",
            "zh": "这个小孩很开心。"
          }
        },
        {
          "id": "2-1-8",
          "en": "relative",
          "zh": "亲戚",
          "emoji": "🤝",
          "example": {
            "en": "My relative is here.",
            "zh": "我的亲戚在这里。"
          }
        }
      ],
      "dialogues": [
        {
          "title": "看看家庭照片",
          "lines": [
            {
              "speaker": "A",
              "en": "Who's this?",
              "zh": "这是谁？"
            },
            {
              "speaker": "B",
              "en": "This is my uncle.",
              "zh": "这是我的叔叔。"
            },
            {
              "speaker": "A",
              "en": "Is this your aunt?",
              "zh": "这是你的阿姨吗？"
            },
            {
              "speaker": "B",
              "en": "Yes. And this is my cousin.",
              "zh": "是的。这是我的表亲。"
            }
          ]
        },
        {
          "title": "看望家人",
          "lines": [
            {
              "speaker": "A",
              "en": "Where are your parents?",
              "zh": "你的父母在哪里？"
            },
            {
              "speaker": "B",
              "en": "They are with my grandpa and grandma.",
              "zh": "他们和我的爷爷奶奶在一起。"
            }
          ]
        }
      ]
    },
    {
      "id": 2,
      "name": "Body",
      "nameZh": "身体",
      "words": [
        {
          "id": "2-2-1",
          "en": "cheek",
          "zh": "脸颊",
          "emoji": "😊",
          "example": {
            "en": "Touch your cheek.",
            "zh": "摸摸你的脸颊。"
          }
        },
        {
          "id": "2-2-2",
          "en": "hair",
          "zh": "头发",
          "emoji": "💇",
          "example": {
            "en": "My hair is short.",
            "zh": "我的头发很短。"
          }
        },
        {
          "id": "2-2-3",
          "en": "neck",
          "zh": "脖子",
          "emoji": "🧣",
          "example": {
            "en": "The scarf keeps my neck warm.",
            "zh": "围巾让我的脖子暖和。"
          }
        },
        {
          "id": "2-2-4",
          "en": "ankle",
          "zh": "脚踝",
          "emoji": "🦶",
          "example": {
            "en": "Touch your ankle.",
            "zh": "摸摸你的脚踝。"
          }
        },
        {
          "id": "2-2-5",
          "en": "knee",
          "zh": "膝盖",
          "emoji": "🦿",
          "example": {
            "en": "Touch your knee.",
            "zh": "摸摸你的膝盖。"
          }
        },
        {
          "id": "2-2-6",
          "en": "finger",
          "zh": "手指",
          "emoji": "☝️",
          "example": {
            "en": "This is my finger.",
            "zh": "这是我的手指。"
          }
        },
        {
          "id": "2-2-7",
          "en": "toe",
          "zh": "脚趾",
          "emoji": "🦶",
          "example": {
            "en": "This is my big toe.",
            "zh": "这是我的大脚趾。"
          }
        },
        {
          "id": "2-2-8",
          "en": "shoulder",
          "zh": "肩膀",
          "emoji": "🫷",
          "example": {
            "en": "Touch your shoulder.",
            "zh": "摸摸你的肩膀。"
          }
        }
      ],
      "dialogues": [
        {
          "title": "一起做动作",
          "lines": [
            {
              "speaker": "A",
              "en": "Touch your shoulder, please.",
              "zh": "请摸摸你的肩膀。"
            },
            {
              "speaker": "B",
              "en": "Like this?",
              "zh": "像这样吗？"
            },
            {
              "speaker": "A",
              "en": "Yes! Now touch your knee.",
              "zh": "对！现在摸摸你的膝盖。"
            },
            {
              "speaker": "B",
              "en": "Here is my knee.",
              "zh": "我的膝盖在这里。"
            }
          ]
        }
      ]
    },
    {
      "id": 3,
      "name": "Food",
      "nameZh": "食物",
      "words": [
        {
          "id": "2-3-1",
          "en": "toast",
          "zh": "吐司",
          "emoji": "🍞",
          "example": {
            "en": "I eat toast in the morning.",
            "zh": "我早上吃吐司。"
          }
        },
        {
          "id": "2-3-2",
          "en": "fried rice",
          "zh": "炒饭",
          "emoji": "🍛",
          "example": {
            "en": "I like fried rice.",
            "zh": "我喜欢炒饭。"
          }
        },
        {
          "id": "2-3-3",
          "en": "yogurt",
          "zh": "酸奶",
          "emoji": "🥣",
          "example": {
            "en": "This yogurt is tasty.",
            "zh": "这份酸奶很好吃。"
          }
        },
        {
          "id": "2-3-4",
          "en": "cupcake",
          "zh": "纸杯蛋糕",
          "emoji": "🧁",
          "example": {
            "en": "The cupcake is sweet.",
            "zh": "这个纸杯蛋糕很甜。"
          }
        },
        {
          "id": "2-3-5",
          "en": "candy",
          "zh": "糖果",
          "emoji": "🍬",
          "example": {
            "en": "I have a piece of candy.",
            "zh": "我有一颗糖。"
          }
        },
        {
          "id": "2-3-6",
          "en": "orange juice",
          "zh": "橙汁",
          "emoji": "🍊",
          "example": {
            "en": "I want some orange juice.",
            "zh": "我想要一些橙汁。"
          }
        },
        {
          "id": "2-3-7",
          "en": "rice noodles",
          "zh": "米线",
          "emoji": "🍜",
          "example": {
            "en": "The rice noodles are hot.",
            "zh": "米线是热的。"
          }
        },
        {
          "id": "2-3-8",
          "en": "lemonade",
          "zh": "柠檬水",
          "emoji": "🍋",
          "example": {
            "en": "I drink lemonade.",
            "zh": "我喝柠檬水。"
          }
        }
      ],
      "dialogues": [
        {
          "title": "吃早餐",
          "lines": [
            {
              "speaker": "A",
              "en": "What would you like?",
              "zh": "你想吃什么？"
            },
            {
              "speaker": "B",
              "en": "I'd like some toast, please.",
              "zh": "我想要一些吐司，谢谢。"
            },
            {
              "speaker": "A",
              "en": "Would you like some yogurt?",
              "zh": "你想要一些酸奶吗？"
            },
            {
              "speaker": "B",
              "en": "Yes, please.",
              "zh": "好的，谢谢。"
            }
          ]
        },
        {
          "title": "选午餐",
          "lines": [
            {
              "speaker": "A",
              "en": "Do you like fried rice?",
              "zh": "你喜欢炒饭吗？"
            },
            {
              "speaker": "B",
              "en": "Yes, I do. I like rice noodles, too.",
              "zh": "是的，我喜欢。我也喜欢米线。"
            },
            {
              "speaker": "A",
              "en": "What would you like to drink?",
              "zh": "你想喝什么？"
            },
            {
              "speaker": "B",
              "en": "Orange juice, please.",
              "zh": "请给我橙汁。"
            }
          ]
        }
      ]
    },
    {
      "id": 4,
      "name": "Clothes",
      "nameZh": "衣服",
      "words": [
        {
          "id": "2-4-1",
          "en": "hat",
          "zh": "帽子",
          "emoji": "🧢",
          "example": {
            "en": "This hat is blue.",
            "zh": "这顶帽子是蓝色的。"
          }
        },
        {
          "id": "2-4-2",
          "en": "shirt",
          "zh": "衬衫",
          "emoji": "👕",
          "example": {
            "en": "My shirt is white.",
            "zh": "我的衬衫是白色的。"
          }
        },
        {
          "id": "2-4-3",
          "en": "pants",
          "zh": "裤子",
          "emoji": "👖",
          "example": {
            "en": "These pants are long.",
            "zh": "这条裤子很长。"
          }
        },
        {
          "id": "2-4-4",
          "en": "shoes",
          "zh": "鞋子",
          "emoji": "👟",
          "example": {
            "en": "My shoes are clean.",
            "zh": "我的鞋子很干净。"
          }
        },
        {
          "id": "2-4-5",
          "en": "socks",
          "zh": "袜子",
          "emoji": "🧦",
          "example": {
            "en": "These socks are warm.",
            "zh": "这些袜子很暖和。"
          }
        },
        {
          "id": "2-4-6",
          "en": "dress",
          "zh": "连衣裙",
          "emoji": "👗",
          "example": {
            "en": "The dress is pretty.",
            "zh": "这条裙子很好看。"
          }
        },
        {
          "id": "2-4-7",
          "en": "coat",
          "zh": "外套",
          "emoji": "🧥",
          "example": {
            "en": "Put on your coat.",
            "zh": "穿上你的外套。"
          }
        },
        {
          "id": "2-4-8",
          "en": "uniform",
          "zh": "校服",
          "emoji": "🧥",
          "example": {
            "en": "My uniform is clean.",
            "zh": "我的校服很干净。"
          }
        }
      ],
      "dialogues": [
        {
          "title": "准备出门",
          "lines": [
            {
              "speaker": "A",
              "en": "Where are my shoes?",
              "zh": "我的鞋子在哪里？"
            },
            {
              "speaker": "B",
              "en": "They are by the door.",
              "zh": "它们在门旁边。"
            },
            {
              "speaker": "A",
              "en": "It's cold. Put on your coat.",
              "zh": "天气冷，穿上你的外套。"
            },
            {
              "speaker": "B",
              "en": "Okay. And my hat!",
              "zh": "好的。还有我的帽子！"
            }
          ]
        }
      ]
    },
    {
      "id": 5,
      "name": "Home Items",
      "nameZh": "家居物品",
      "words": [
        {
          "id": "2-5-1",
          "en": "door",
          "zh": "门",
          "emoji": "🚪",
          "example": {
            "en": "This is a door.",
            "zh": "这是门。"
          }
        },
        {
          "id": "2-5-2",
          "en": "window",
          "zh": "窗户",
          "emoji": "🪟",
          "example": {
            "en": "This is a window.",
            "zh": "这是窗户。"
          }
        },
        {
          "id": "2-5-3",
          "en": "table",
          "zh": "桌子",
          "emoji": "🪵",
          "example": {
            "en": "This is a table.",
            "zh": "这是桌子。"
          }
        },
        {
          "id": "2-5-4",
          "en": "sofa",
          "zh": "沙发",
          "emoji": "🛋️",
          "example": {
            "en": "The sofa is soft.",
            "zh": "沙发很软。"
          }
        },
        {
          "id": "2-5-5",
          "en": "bed",
          "zh": "床",
          "emoji": "🛏️",
          "example": {
            "en": "This is a bed.",
            "zh": "这是床。"
          }
        },
        {
          "id": "2-5-6",
          "en": "lamp",
          "zh": "台灯",
          "emoji": "💡",
          "example": {
            "en": "This is a lamp.",
            "zh": "这是台灯。"
          }
        },
        {
          "id": "2-5-7",
          "en": "floor",
          "zh": "地板",
          "emoji": "🟫",
          "example": {
            "en": "The floor is clean.",
            "zh": "地板很干净。"
          }
        },
        {
          "id": "2-5-8",
          "en": "wall",
          "zh": "墙",
          "emoji": "🧱",
          "example": {
            "en": "This is a wall.",
            "zh": "这是墙。"
          }
        },
        {
          "id": "2-5-9",
          "en": "room",
          "zh": "房间",
          "emoji": "🚪",
          "example": {
            "en": "This is a room.",
            "zh": "这是房间。"
          }
        },
        {
          "id": "2-5-10",
          "en": "kitchen",
          "zh": "厨房",
          "emoji": "🍳",
          "example": {
            "en": "This is a kitchen.",
            "zh": "这是厨房。"
          }
        },
        {
          "id": "2-5-11",
          "en": "bathroom",
          "zh": "浴室",
          "emoji": "🛁",
          "example": {
            "en": "This is a bathroom.",
            "zh": "这是浴室。"
          }
        },
        {
          "id": "2-5-12",
          "en": "key",
          "zh": "钥匙",
          "emoji": "🔑",
          "example": {
            "en": "This is a key.",
            "zh": "这是钥匙。"
          }
        },
        {
          "id": "2-5-13",
          "en": "clock",
          "zh": "钟",
          "emoji": "🕒",
          "example": {
            "en": "This is a clock.",
            "zh": "这是钟。"
          }
        },
        {
          "id": "2-5-14",
          "en": "cup",
          "zh": "杯子",
          "emoji": "☕",
          "example": {
            "en": "This is a cup.",
            "zh": "这是杯子。"
          }
        },
        {
          "id": "2-5-15",
          "en": "plate",
          "zh": "盘子",
          "emoji": "🍽️",
          "example": {
            "en": "This is a plate.",
            "zh": "这是盘子。"
          }
        },
        {
          "id": "2-5-16",
          "en": "spoon",
          "zh": "勺子",
          "emoji": "🥄",
          "example": {
            "en": "This is a spoon.",
            "zh": "这是勺子。"
          }
        }
      ],
      "dialogues": [
        {
          "title": "找钥匙",
          "lines": [
            {
              "speaker": "A",
              "en": "Where is my key?",
              "zh": "我的钥匙在哪里？"
            },
            {
              "speaker": "B",
              "en": "It's on the table.",
              "zh": "它在桌子上。"
            },
            {
              "speaker": "A",
              "en": "In the kitchen?",
              "zh": "在厨房里吗？"
            },
            {
              "speaker": "B",
              "en": "Yes, next to the cup.",
              "zh": "是的，在杯子旁边。"
            }
          ]
        }
      ]
    },
    {
      "id": 6,
      "name": "Toys & Play",
      "nameZh": "玩具与游戏",
      "words": [
        {
          "id": "2-6-1",
          "en": "yo-yo",
          "zh": "悠悠球",
          "emoji": "🪀",
          "example": {
            "en": "This yo-yo is fun.",
            "zh": "这个悠悠球很好玩。"
          }
        },
        {
          "id": "2-6-2",
          "en": "teddy bear",
          "zh": "泰迪熊",
          "emoji": "🧸",
          "example": {
            "en": "The teddy bear is cute.",
            "zh": "这只泰迪熊很可爱。"
          }
        },
        {
          "id": "2-6-3",
          "en": "puppet",
          "zh": "木偶",
          "emoji": "🎎",
          "example": {
            "en": "The puppet can dance.",
            "zh": "这个木偶会跳舞。"
          }
        },
        {
          "id": "2-6-4",
          "en": "spinning top",
          "zh": "陀螺",
          "emoji": "🌀",
          "example": {
            "en": "I like the spinning top.",
            "zh": "我喜欢这个陀螺。"
          }
        },
        {
          "id": "2-6-5",
          "en": "balloon",
          "zh": "气球",
          "emoji": "🎈",
          "example": {
            "en": "This is a balloon.",
            "zh": "这是气球。"
          }
        },
        {
          "id": "2-6-6",
          "en": "drum",
          "zh": "鼓",
          "emoji": "🥁",
          "example": {
            "en": "This is a drum.",
            "zh": "这是鼓。"
          }
        },
        {
          "id": "2-6-7",
          "en": "puzzle",
          "zh": "拼图",
          "emoji": "🧩",
          "example": {
            "en": "This is a puzzle.",
            "zh": "这是拼图。"
          }
        },
        {
          "id": "2-6-8",
          "en": "block",
          "zh": "积木",
          "emoji": "🧱",
          "example": {
            "en": "This is a block.",
            "zh": "这是积木。"
          }
        },
        {
          "id": "2-6-9",
          "en": "car",
          "zh": "小汽车",
          "emoji": "🚗",
          "example": {
            "en": "This is a car.",
            "zh": "这是小汽车。"
          }
        },
        {
          "id": "2-6-10",
          "en": "boat",
          "zh": "小船",
          "emoji": "🛶",
          "example": {
            "en": "This is a boat.",
            "zh": "这是小船。"
          }
        },
        {
          "id": "2-6-11",
          "en": "plane",
          "zh": "飞机",
          "emoji": "✈️",
          "example": {
            "en": "This is a plane.",
            "zh": "这是飞机。"
          }
        },
        {
          "id": "2-6-12",
          "en": "train",
          "zh": "火车",
          "emoji": "🚂",
          "example": {
            "en": "This is a train.",
            "zh": "这是火车。"
          }
        },
        {
          "id": "2-6-13",
          "en": "bike",
          "zh": "自行车",
          "emoji": "🚲",
          "example": {
            "en": "This is a bike.",
            "zh": "这是自行车。"
          }
        },
        {
          "id": "2-6-14",
          "en": "game",
          "zh": "游戏",
          "emoji": "🎮",
          "example": {
            "en": "This is a game.",
            "zh": "这是游戏。"
          }
        },
        {
          "id": "2-6-15",
          "en": "card",
          "zh": "卡片",
          "emoji": "🃏",
          "example": {
            "en": "This is a card.",
            "zh": "这是卡片。"
          }
        },
        {
          "id": "2-6-16",
          "en": "cube",
          "zh": "立方体",
          "emoji": "🧊",
          "example": {
            "en": "This is a cube.",
            "zh": "这是方块。"
          }
        }
      ],
      "dialogues": [
        {
          "title": "一起玩",
          "lines": [
            {
              "speaker": "A",
              "en": "Is this your teddy bear?",
              "zh": "这是你的泰迪熊吗？"
            },
            {
              "speaker": "B",
              "en": "Yes. Do you want to play?",
              "zh": "是的。你想一起玩吗？"
            },
            {
              "speaker": "A",
              "en": "Let's do this puzzle.",
              "zh": "我们来拼这个拼图吧。"
            },
            {
              "speaker": "B",
              "en": "Good idea!",
              "zh": "好主意！"
            }
          ]
        }
      ]
    },
    {
      "id": 7,
      "name": "Numbers & Shapes",
      "nameZh": "数字与形状",
      "words": [
        {
          "id": "2-7-1",
          "en": "eleven",
          "zh": "十一",
          "emoji": "1️⃣1️⃣",
          "example": {
            "en": "I have eleven crayons.",
            "zh": "我有十一支蜡笔。"
          }
        },
        {
          "id": "2-7-2",
          "en": "twelve",
          "zh": "十二",
          "emoji": "1️⃣2️⃣",
          "example": {
            "en": "I have twelve crayons.",
            "zh": "我有十二支蜡笔。"
          }
        },
        {
          "id": "2-7-3",
          "en": "thirteen",
          "zh": "十三",
          "emoji": "1️⃣3️⃣",
          "example": {
            "en": "I have thirteen crayons.",
            "zh": "我有十三支蜡笔。"
          }
        },
        {
          "id": "2-7-4",
          "en": "fourteen",
          "zh": "十四",
          "emoji": "1️⃣4️⃣",
          "example": {
            "en": "I have fourteen crayons.",
            "zh": "我有十四支蜡笔。"
          }
        },
        {
          "id": "2-7-5",
          "en": "fifteen",
          "zh": "十五",
          "emoji": "1️⃣5️⃣",
          "example": {
            "en": "I have fifteen crayons.",
            "zh": "我有十五支蜡笔。"
          }
        },
        {
          "id": "2-7-6",
          "en": "sixteen",
          "zh": "十六",
          "emoji": "1️⃣6️⃣",
          "example": {
            "en": "I have sixteen crayons.",
            "zh": "我有十六支蜡笔。"
          }
        },
        {
          "id": "2-7-7",
          "en": "seventeen",
          "zh": "十七",
          "emoji": "1️⃣7️⃣",
          "example": {
            "en": "I have seventeen crayons.",
            "zh": "我有十七支蜡笔。"
          }
        },
        {
          "id": "2-7-8",
          "en": "eighteen",
          "zh": "十八",
          "emoji": "1️⃣8️⃣",
          "example": {
            "en": "I have eighteen crayons.",
            "zh": "我有十八支蜡笔。"
          }
        },
        {
          "id": "2-7-9",
          "en": "nineteen",
          "zh": "十九",
          "emoji": "1️⃣9️⃣",
          "example": {
            "en": "I have nineteen crayons.",
            "zh": "我有十九支蜡笔。"
          }
        },
        {
          "id": "2-7-10",
          "en": "twenty",
          "zh": "二十",
          "emoji": "2️⃣0️⃣",
          "example": {
            "en": "I have twenty crayons.",
            "zh": "我有二十支蜡笔。"
          }
        },
        {
          "id": "2-7-11",
          "en": "circle",
          "zh": "圆形",
          "emoji": "⭕",
          "example": {
            "en": "Draw a circle, please.",
            "zh": "请画一个圆形。"
          }
        },
        {
          "id": "2-7-12",
          "en": "square",
          "zh": "正方形",
          "emoji": "⬜",
          "example": {
            "en": "Draw a square, please.",
            "zh": "请画一个正方形。"
          }
        },
        {
          "id": "2-7-13",
          "en": "triangle",
          "zh": "三角形",
          "emoji": "🔺",
          "example": {
            "en": "Draw a triangle, please.",
            "zh": "请画一个三角形。"
          }
        },
        {
          "id": "2-7-14",
          "en": "star",
          "zh": "星星",
          "emoji": "⭐",
          "example": {
            "en": "Draw a star, please.",
            "zh": "请画一个星星。"
          }
        },
        {
          "id": "2-7-15",
          "en": "heart",
          "zh": "爱心",
          "emoji": "❤️",
          "example": {
            "en": "Draw a heart, please.",
            "zh": "请画一个爱心。"
          }
        },
        {
          "id": "2-7-16",
          "en": "shape",
          "zh": "形状",
          "emoji": "🔷",
          "example": {
            "en": "What shape is it?",
            "zh": "它是什么形状？"
          }
        }
      ],
      "dialogues": [
        {
          "title": "数一数，画一画",
          "lines": [
            {
              "speaker": "A",
              "en": "How many crayons do you have?",
              "zh": "你有多少支蜡笔？"
            },
            {
              "speaker": "B",
              "en": "I have twelve crayons.",
              "zh": "我有十二支蜡笔。"
            },
            {
              "speaker": "A",
              "en": "Can you draw a circle?",
              "zh": "你会画一个圆形吗？"
            },
            {
              "speaker": "B",
              "en": "Yes. I can draw a triangle, too.",
              "zh": "会。我还会画三角形。"
            }
          ]
        }
      ]
    },
    {
      "id": 8,
      "name": "Classroom Actions",
      "nameZh": "课堂动作",
      "words": [
        {
          "id": "2-8-1",
          "en": "clap",
          "zh": "拍手",
          "emoji": "👏",
          "example": {
            "en": "Please clap your hands.",
            "zh": "请拍拍手。"
          }
        },
        {
          "id": "2-8-2",
          "en": "jump",
          "zh": "跳",
          "emoji": "🦘",
          "example": {
            "en": "I can jump high.",
            "zh": "我会跳得很高。"
          }
        },
        {
          "id": "2-8-3",
          "en": "turn",
          "zh": "转身",
          "emoji": "🔄",
          "example": {
            "en": "Turn around, please.",
            "zh": "请转过身来。"
          }
        },
        {
          "id": "2-8-4",
          "en": "touch",
          "zh": "触摸",
          "emoji": "✋",
          "example": {
            "en": "Touch the desk.",
            "zh": "摸摸桌子。"
          }
        },
        {
          "id": "2-8-5",
          "en": "read",
          "zh": "读",
          "emoji": "📚",
          "example": {
            "en": "Please read this book.",
            "zh": "请读这本书。"
          }
        },
        {
          "id": "2-8-6",
          "en": "write",
          "zh": "写",
          "emoji": "✍️",
          "example": {
            "en": "Write your name, please.",
            "zh": "请写下你的名字。"
          }
        },
        {
          "id": "2-8-7",
          "en": "repeat",
          "zh": "重复",
          "emoji": "🔁",
          "example": {
            "en": "Please repeat after me.",
            "zh": "请跟我读。"
          }
        },
        {
          "id": "2-8-8",
          "en": "speak",
          "zh": "说",
          "emoji": "🗣️",
          "example": {
            "en": "Please speak slowly.",
            "zh": "请慢慢说。"
          }
        },
        {
          "id": "2-8-9",
          "en": "underline",
          "zh": "划线",
          "emoji": "📏",
          "example": {
            "en": "Underline the word.",
            "zh": "给这个单词划线。"
          }
        },
        {
          "id": "2-8-10",
          "en": "point",
          "zh": "指",
          "emoji": "👉",
          "example": {
            "en": "Point to the door.",
            "zh": "指一指门。"
          }
        },
        {
          "id": "2-8-11",
          "en": "ask",
          "zh": "问",
          "emoji": "❓",
          "example": {
            "en": "Can I ask a question?",
            "zh": "我可以问一个问题吗？"
          }
        },
        {
          "id": "2-8-12",
          "en": "answer",
          "zh": "回答",
          "emoji": "💬",
          "example": {
            "en": "Please answer the question.",
            "zh": "请回答这个问题。"
          }
        },
        {
          "id": "2-8-13",
          "en": "spell",
          "zh": "拼写",
          "emoji": "🔤",
          "example": {
            "en": "Can you spell your name?",
            "zh": "你会拼写自己的名字吗？"
          }
        },
        {
          "id": "2-8-14",
          "en": "show",
          "zh": "展示",
          "emoji": "📣",
          "example": {
            "en": "Show me your book.",
            "zh": "给我看看你的书。"
          }
        },
        {
          "id": "2-8-15",
          "en": "color",
          "zh": "涂色",
          "emoji": "🖍️",
          "example": {
            "en": "Color the star yellow.",
            "zh": "把星星涂成黄色。"
          }
        },
        {
          "id": "2-8-16",
          "en": "count",
          "zh": "数数",
          "emoji": "🔢",
          "example": {
            "en": "Count the apples, please.",
            "zh": "请数一数苹果。"
          }
        }
      ],
      "dialogues": [
        {
          "title": "课堂小游戏",
          "lines": [
            {
              "speaker": "Teacher",
              "en": "Please clap your hands.",
              "zh": "请拍拍手。"
            },
            {
              "speaker": "Student",
              "en": "Like this?",
              "zh": "像这样吗？"
            },
            {
              "speaker": "Teacher",
              "en": "Yes! Now point to the door.",
              "zh": "对！现在指一指门。"
            },
            {
              "speaker": "Student",
              "en": "Here it is.",
              "zh": "门在这里。"
            }
          ]
        },
        {
          "title": "读写时间",
          "lines": [
            {
              "speaker": "Teacher",
              "en": "Can you read this word?",
              "zh": "你会读这个单词吗？"
            },
            {
              "speaker": "Student",
              "en": "Yes. It's apple.",
              "zh": "会。是 apple。"
            },
            {
              "speaker": "Teacher",
              "en": "Can you spell it?",
              "zh": "你会拼写它吗？"
            },
            {
              "speaker": "Student",
              "en": "A-P-P-L-E.",
              "zh": "A-P-P-L-E。"
            }
          ]
        }
      ]
    },
    {
      "id": 9,
      "name": "Nature Around Us",
      "nameZh": "身边自然",
      "words": [
        {
          "id": "2-9-1",
          "en": "sun",
          "zh": "太阳",
          "emoji": "☀️",
          "example": {
            "en": "This is the sun.",
            "zh": "这是太阳。"
          }
        },
        {
          "id": "2-9-2",
          "en": "moon",
          "zh": "月亮",
          "emoji": "🌙",
          "example": {
            "en": "This is the moon.",
            "zh": "这是月亮。"
          }
        },
        {
          "id": "2-9-3",
          "en": "sky",
          "zh": "天空",
          "emoji": "🌌",
          "example": {
            "en": "This is the sky.",
            "zh": "这是天空。"
          }
        },
        {
          "id": "2-9-4",
          "en": "cloud",
          "zh": "云",
          "emoji": "☁️",
          "example": {
            "en": "This is a cloud.",
            "zh": "这是云。"
          }
        },
        {
          "id": "2-9-5",
          "en": "rain",
          "zh": "雨",
          "emoji": "🌧️",
          "example": {
            "en": "I can see the rain.",
            "zh": "我能看见雨。"
          }
        },
        {
          "id": "2-9-6",
          "en": "wind",
          "zh": "风",
          "emoji": "💨",
          "example": {
            "en": "The wind is strong.",
            "zh": "风很大。"
          }
        },
        {
          "id": "2-9-7",
          "en": "tree",
          "zh": "树",
          "emoji": "🌳",
          "example": {
            "en": "This is a tree.",
            "zh": "这是树。"
          }
        },
        {
          "id": "2-9-8",
          "en": "leaf",
          "zh": "树叶",
          "emoji": "🍃",
          "example": {
            "en": "This is a leaf.",
            "zh": "这是树叶。"
          }
        },
        {
          "id": "2-9-9",
          "en": "flower",
          "zh": "花",
          "emoji": "🌸",
          "example": {
            "en": "This is a flower.",
            "zh": "这是花。"
          }
        },
        {
          "id": "2-9-10",
          "en": "grass",
          "zh": "草",
          "emoji": "🌿",
          "example": {
            "en": "The grass is green.",
            "zh": "草是绿色的。"
          }
        },
        {
          "id": "2-9-11",
          "en": "river",
          "zh": "河",
          "emoji": "🏞️",
          "example": {
            "en": "This is a river.",
            "zh": "这是河。"
          }
        },
        {
          "id": "2-9-12",
          "en": "hill",
          "zh": "小山",
          "emoji": "⛰️",
          "example": {
            "en": "This is a hill.",
            "zh": "这是小山。"
          }
        },
        {
          "id": "2-9-13",
          "en": "butterfly",
          "zh": "蝴蝶",
          "emoji": "🦋",
          "example": {
            "en": "This is a butterfly.",
            "zh": "这是蝴蝶。"
          }
        },
        {
          "id": "2-9-14",
          "en": "bee",
          "zh": "蜜蜂",
          "emoji": "🐝",
          "example": {
            "en": "This is a bee.",
            "zh": "这是蜜蜂。"
          }
        },
        {
          "id": "2-9-15",
          "en": "pond",
          "zh": "池塘",
          "emoji": "🪷",
          "example": {
            "en": "This is a pond.",
            "zh": "这是池塘。"
          }
        },
        {
          "id": "2-9-16",
          "en": "stone",
          "zh": "石头",
          "emoji": "🪨",
          "example": {
            "en": "This is a stone.",
            "zh": "这是石头。"
          }
        }
      ],
      "dialogues": [
        {
          "title": "公园散步",
          "lines": [
            {
              "speaker": "A",
              "en": "Look at the butterfly!",
              "zh": "看那只蝴蝶！"
            },
            {
              "speaker": "B",
              "en": "It's on the flower.",
              "zh": "它在花上。"
            },
            {
              "speaker": "A",
              "en": "Can you see the pond?",
              "zh": "你能看见池塘吗？"
            },
            {
              "speaker": "B",
              "en": "Yes, it's next to the tree.",
              "zh": "能，它在树旁边。"
            }
          ]
        }
      ]
    },
    {
      "id": 10,
      "name": "Town Places",
      "nameZh": "城镇地点",
      "words": [
        {
          "id": "2-10-1",
          "en": "road",
          "zh": "道路",
          "emoji": "🛣️",
          "example": {
            "en": "This is a road.",
            "zh": "这是道路。"
          }
        },
        {
          "id": "2-10-2",
          "en": "bridge",
          "zh": "桥",
          "emoji": "🌉",
          "example": {
            "en": "This is a bridge.",
            "zh": "这是桥。"
          }
        },
        {
          "id": "2-10-3",
          "en": "shop",
          "zh": "商店",
          "emoji": "🏪",
          "example": {
            "en": "This is a shop.",
            "zh": "这是商店。"
          }
        },
        {
          "id": "2-10-4",
          "en": "market",
          "zh": "市场",
          "emoji": "🛒",
          "example": {
            "en": "This is a market.",
            "zh": "这是市场。"
          }
        },
        {
          "id": "2-10-5",
          "en": "bank",
          "zh": "银行",
          "emoji": "🏦",
          "example": {
            "en": "This is a bank.",
            "zh": "这是银行。"
          }
        },
        {
          "id": "2-10-6",
          "en": "post office",
          "zh": "邮局",
          "emoji": "📮",
          "example": {
            "en": "This is a post office.",
            "zh": "这是一家邮局。"
          }
        },
        {
          "id": "2-10-7",
          "en": "office",
          "zh": "办公室",
          "emoji": "🏢",
          "example": {
            "en": "This is an office.",
            "zh": "这是办公室。"
          }
        },
        {
          "id": "2-10-8",
          "en": "street",
          "zh": "街道",
          "emoji": "🚶",
          "example": {
            "en": "This is a street.",
            "zh": "这是街道。"
          }
        },
        {
          "id": "2-10-9",
          "en": "station",
          "zh": "车站",
          "emoji": "🚉",
          "example": {
            "en": "This is a station.",
            "zh": "这是车站。"
          }
        },
        {
          "id": "2-10-10",
          "en": "playground",
          "zh": "操场",
          "emoji": "🏃",
          "example": {
            "en": "This is a playground.",
            "zh": "这是操场。"
          }
        },
        {
          "id": "2-10-11",
          "en": "garden",
          "zh": "花园",
          "emoji": "🌷",
          "example": {
            "en": "This is a garden.",
            "zh": "这是花园。"
          }
        },
        {
          "id": "2-10-12",
          "en": "store",
          "zh": "店铺",
          "emoji": "🏬",
          "example": {
            "en": "This is a store.",
            "zh": "这是店铺。"
          }
        },
        {
          "id": "2-10-13",
          "en": "library",
          "zh": "图书馆",
          "emoji": "📚",
          "example": {
            "en": "This is a library.",
            "zh": "这是图书馆。"
          }
        },
        {
          "id": "2-10-14",
          "en": "museum",
          "zh": "博物馆",
          "emoji": "🏛️",
          "example": {
            "en": "This is a museum.",
            "zh": "这是博物馆。"
          }
        },
        {
          "id": "2-10-15",
          "en": "cinema",
          "zh": "电影院",
          "emoji": "🎬",
          "example": {
            "en": "This is a cinema.",
            "zh": "这是电影院。"
          }
        },
        {
          "id": "2-10-16",
          "en": "bakery",
          "zh": "面包店",
          "emoji": "🥐",
          "example": {
            "en": "This is a bakery.",
            "zh": "这是面包店。"
          }
        }
      ],
      "dialogues": [
        {
          "title": "问路",
          "lines": [
            {
              "speaker": "A",
              "en": "Where is the post office?",
              "zh": "邮局在哪里？"
            },
            {
              "speaker": "B",
              "en": "It's next to the bank.",
              "zh": "它在银行旁边。"
            },
            {
              "speaker": "A",
              "en": "Is the library near here?",
              "zh": "图书馆在附近吗？"
            },
            {
              "speaker": "B",
              "en": "Yes. It's across the street.",
              "zh": "是的。它在街道对面。"
            }
          ]
        }
      ]
    },
    {
      "id": 11,
      "name": "Core Questions & Verbs",
      "nameZh": "核心问句与动词",
      "words": [
        {
          "id": "2-11-1",
          "en": "where",
          "zh": "哪里",
          "emoji": "📍",
          "example": {
            "en": "Where is my bag?",
            "zh": "我的书包在哪里？"
          }
        },
        {
          "id": "2-11-2",
          "en": "what",
          "zh": "什么",
          "emoji": "❓",
          "example": {
            "en": "What is this?",
            "zh": "这是什么？"
          }
        },
        {
          "id": "2-11-3",
          "en": "how",
          "zh": "怎样",
          "emoji": "🙂",
          "example": {
            "en": "How are you?",
            "zh": "你好吗？"
          }
        },
        {
          "id": "2-11-4",
          "en": "many",
          "zh": "许多（how many：多少）",
          "emoji": "🔢",
          "example": {
            "en": "How many books?",
            "zh": "有多少本书？"
          }
        },
        {
          "id": "2-11-5",
          "en": "can",
          "zh": "能，会",
          "emoji": "💪",
          "example": {
            "en": "I can read.",
            "zh": "我会读书。"
          }
        },
        {
          "id": "2-11-6",
          "en": "do",
          "zh": "做",
          "emoji": "✅",
          "example": {
            "en": "I do my homework.",
            "zh": "我做作业。"
          }
        },
        {
          "id": "2-11-7",
          "en": "have",
          "zh": "有",
          "emoji": "🎒",
          "example": {
            "en": "I have a ruler.",
            "zh": "我有一把尺子。"
          }
        },
        {
          "id": "2-11-8",
          "en": "want",
          "zh": "想要",
          "emoji": "🙏",
          "example": {
            "en": "I want some water.",
            "zh": "我想要一些水。"
          }
        },
        {
          "id": "2-11-9",
          "en": "go",
          "zh": "去",
          "emoji": "🚶",
          "example": {
            "en": "I go to school.",
            "zh": "我去学校。"
          }
        },
        {
          "id": "2-11-10",
          "en": "come",
          "zh": "来",
          "emoji": "👣",
          "example": {
            "en": "Please come here.",
            "zh": "请来这里。"
          }
        }
      ],
      "dialogues": [
        {
          "title": "书包里有什么",
          "lines": [
            {
              "speaker": "A",
              "en": "What do you have in your bag?",
              "zh": "你的书包里有什么？"
            },
            {
              "speaker": "B",
              "en": "I have a book and a ruler.",
              "zh": "我有一本书和一把尺子。"
            },
            {
              "speaker": "A",
              "en": "Can you read the book?",
              "zh": "你会读这本书吗？"
            },
            {
              "speaker": "B",
              "en": "Yes. Come and read with me!",
              "zh": "会。来和我一起读吧！"
            }
          ]
        }
      ]
    }
  ]
}
