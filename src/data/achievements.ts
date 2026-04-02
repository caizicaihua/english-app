export interface Achievement {
  id: string
  name: string
  description: string
  emoji: string
  condition: (stats: { learnedCount: number; streak: number; completedUnits: number; perfectUnits: number }) => boolean
}

export const achievements: Achievement[] = [
  { id: 'first_word', name: '初学者', description: '学会第一个单词', emoji: '🌱', condition: s => s.learnedCount >= 1 },
  { id: 'ten_words', name: '小小学霸', description: '学会10个单词', emoji: '📚', condition: s => s.learnedCount >= 10 },
  { id: 'fifty_words', name: '词汇达人', description: '学会50个单词', emoji: '🎓', condition: s => s.learnedCount >= 50 },
  { id: 'hundred_words', name: '百词斩', description: '学会100个单词', emoji: '💯', condition: s => s.learnedCount >= 100 },
  { id: 'two_hundred', name: '词汇大师', description: '学会200个单词', emoji: '👑', condition: s => s.learnedCount >= 200 },
  { id: 'streak_3', name: '坚持不懈', description: '连续学习3天', emoji: '🔥', condition: s => s.streak >= 3 },
  { id: 'streak_7', name: '一周达人', description: '连续学习7天', emoji: '⭐', condition: s => s.streak >= 7 },
  { id: 'streak_30', name: '学习之星', description: '连续学习30天', emoji: '🌟', condition: s => s.streak >= 30 },
  { id: 'first_unit', name: '闯关成功', description: '完成第一个单元', emoji: '🏅', condition: s => s.completedUnits >= 1 },
  { id: 'five_units', name: '过关斩将', description: '完成5个单元', emoji: '🏆', condition: s => s.completedUnits >= 5 },
  { id: 'perfect', name: '满分通关', description: '获得一次三星通关', emoji: '💎', condition: s => s.perfectUnits >= 1 },
]
