// 马晨皓 · 个人档案数据
// 来源：马晨皓_个人独立网站人物画像与成果档案

export interface ProfileData {
  name: string;
  nameEn: string;
  tagline: string;
  subtitle: string;
  role: string;
  power: string;
  school: string;
  personality: string;
  mission: string;
  aboutLead: string;
  aboutParagraphs: string[];
  tags: string[];
  beliefs: { num: string; text: string; color: 'sun' | 'brick' | 'aqua' }[];
}

export const profile: ProfileData = {
  name: '马晨皓',
  nameEn: 'Ma Chenhao',
  tagline: 'AI-Native Product Builder',
  subtitle: '用设计理解人，用系统整理复杂度，用 AI 把想法更快推向真实世界。',
  role: 'Product Builder in Progress',
  power: '把混乱问题变成能运行的系统',
  school: '大连交通大学 · 产品设计',
  personality: 'XNTJ · 建构型战略探索者',
  mission: 'Make it playful, not messy',
  aboutLead: '我不是把 AI 当成替我完成作品的工具，而是把它当成实现杠杆。',
  aboutParagraphs: [
    '我是马晨皓，产品设计专业本科生，也在逐渐把自己训练成一个 AI 原生的 Product Builder。我对"设计"的理解已经不太局限于界面和形式——我更喜欢从一个真实问题开始，把里面的人、流程、规则、信息和冲突拆开，再重新组织成产品。',
    '过去一段时间，我在企业招采、电商经营、合同审查、校园 Agent、科研协作和 AI 工作流里反复做这件事。设计让我在意人的感受和信息秩序，AI 让我能更快把想法变成原型，而真实业务让我知道漂亮的逻辑必须经得起约束和反馈。',
    '与此同时，我一直在写一个叫"见己"的长期项目：我不太相信人能靠一个标签认识自己，更相信行动、作品、关系和结果会一点点把自己显影出来。这个网站不是我的最终答案，更像一份持续更新的现场记录。',
  ],
  tags: ['系统感强', '产出欲强', '迭代密度高', '跨领域迁移', '审美与秩序并重'],
  beliefs: [
    {
      num: '01',
      text: '先拆开，重新组织，再做出一个能被人看见、讨论和继续推进的版本。',
      color: 'sun',
    },
    {
      num: '02',
      text: '视觉可以夸张，结构必须清楚。Make it playful, not messy.',
      color: 'brick',
    },
    {
      num: '03',
      text: '假设不能靠想象变成事实——做出东西只是第一步，真正有意义的是它进入真实世界后发生了什么。',
      color: 'aqua',
    },
  ],
};
