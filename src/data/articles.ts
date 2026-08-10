// 故事书数据

export interface Article {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  symbol: 'star' | 'eye' | 'moon';
  symbolColor: string;
}

export const articles: Article[] = [
  {
    id: 'a1',
    date: '2026.05 — 持续',
    title: '见己：不是自我标签，而是反馈观',
    excerpt:
      '欲望 → 行动 → 结果 → 反馈 → 反思 → 修正。人不能靠一个标签认识自己，行动和结果会把你显影出来。',
    symbol: 'star',
    symbolColor: '#F77F00',
  },
  {
    id: 'a2',
    date: '2026.01 — 03',
    title: '百年人寿招采教我的事',
    excerpt:
      '3 人团队、2000 万项目、34 家企业、1000+ 册材料。流程设计不是画流程图，而是明确每一步谁能做什么、依据是什么。',
    symbol: 'eye',
    symbolColor: '#1E5FA8',
  },
  {
    id: 'a3',
    date: '2026.08',
    title: 'Make it playful, not messy',
    excerpt:
      '为什么我被 Toyism 吸引：点、线、形状、角色和重复纹样组成一套私人字典。视觉负责个性，文字负责秩序。',
    symbol: 'moon',
    symbolColor: '#7A2E8E',
  },
];
