// 能力图鉴数据

export interface Skill {
  id: string;
  title: string;
  description: string;
  tags: string[];
  symbol: 'eye' | 'spiral' | 'key' | 'leaf' | 'fish' | 'star';
}

export const skills: Skill[] = [
  {
    id: 's1',
    title: '发现问题',
    description: '从真实业务、用户抱怨、工作摩擦或一个模糊想法中找到值得处理的问题。',
    tags: ['真实业务', '用户洞察'],
    symbol: 'eye',
  },
  {
    id: 's2',
    title: '拆系统',
    description: '角色、权限、流程、状态、异常、输入输出、数据与决策节点，先弄顺逻辑再画界面。',
    tags: ['B 端', '多角色', '状态机'],
    symbol: 'spiral',
  },
  {
    id: 's3',
    title: '产品化',
    description: '客户画像、产品假设、MVP 边界、功能优先级、审核机制、角色关系。',
    tags: ['PRD', 'MVP', '优先级'],
    symbol: 'key',
  },
  {
    id: 's4',
    title: '交互与视觉',
    description: '信息层级、工作台布局、结果导向卡片、局部反馈。Figma / UI 套图 / HTML 原型。',
    tags: ['工作台', 'Figma', 'HTML'],
    symbol: 'leaf',
  },
  {
    id: 's5',
    title: 'AI 工作流',
    description: '文生图 / 图生图、Agent、知识库、对话式修改、自动任务与报告生成。',
    tags: ['Agent', 'RAG', 'AIGC'],
    symbol: 'fish',
  },
  {
    id: 's6',
    title: '复杂文档与信息核验',
    description: 'PRD、申报书、软著材料、路演稿、报告、SOP。检索、证据分层、文献核实、事实与推断分离。',
    tags: ['PRD', '软著', '文献核验'],
    symbol: 'star',
  },
];
