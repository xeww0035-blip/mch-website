// 作品数据

export interface Work {
  id: string;
  title: string;
  description: string;
  tag: string;
  tagType: 'default' | 'wip';
  symbol: 'eye' | 'fish' | 'leaf' | 'key';
  symbolColor: 'sun' | 'aqua' | 'leaf' | 'pink';
}

export const works: Work[] = [
  {
    id: 'w1',
    title: 'AI 电商经营工作台',
    description:
      '把 AI 生图扩成一条经营工作流：商品发现 → 货源匹配 → 图片文案视频 → 人工判断 → 上架 → 数据反馈。三栏桌面工作台，已有多版 PRD、UI 套图与响应式 HTML 原型。',
    tag: '产品系统 · 推进中',
    tagType: 'default',
    symbol: 'eye',
    symbolColor: 'sun',
  },
  {
    id: 'w2',
    title: '招采云链',
    description:
      '从百年人寿真实招采场景抽象出的多角色协同平台。采购方 / 供应商 / 代理 / 平台管理，覆盖需求、公告、报名、投标到合同归档全过程。含 PRD、系统原型、软著材料与大创申报书。',
    tag: 'B 端系统',
    tagType: 'default',
    symbol: 'fish',
    symbolColor: 'aqua',
  },
  {
    id: 'w3',
    title: 'DJTU 校园评价 Agent',
    description:
      '访客 / 认证学生 / 管理员权限分离的校园评价智能体。Next.js + TypeScript + Prisma + PostgreSQL，做过权限检查与并发测试，隐藏评价不进入 Agent 读取范围。',
    tag: 'Agent · 技术原型',
    tagType: 'default',
    symbol: 'leaf',
    symbolColor: 'leaf',
  },
  {
    id: 'w4',
    title: 'AI 合同审查与执行平台',
    description:
      '从风险条款到编辑执行、版本 Diff、增量审查、谈判推演、企业核验与知识库的完整功能结构。关注点从"找风险"延伸到"怎么改、怎么谈、怎么执行"。',
    tag: '推进中',
    tagType: 'wip',
    symbol: 'key',
    symbolColor: 'pink',
  },
];
