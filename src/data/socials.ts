// 社交链接数据

export interface SocialLink {
  id: string;
  idx: string;
  platform: string;
  handle: string;
  href: string;
  iconType: 'xhs' | 'douyin' | 'mail';
  bgClass: string;
  external: boolean;
}

export const socials: SocialLink[] = [
  {
    id: 'social-xhs',
    idx: '01',
    platform: '小红书',
    handle: '@马晨皓 · 140 次赞与收藏',
    href: 'https://www.xiaohongshu.com/user/profile/66e780ff000000001d03387c',
    iconType: 'xhs',
    bgClass: 'social-row-xhs',
    external: true,
  },
  {
    id: 'social-dy',
    idx: '02',
    platform: '抖音',
    handle: '@马晨皓 · 来看看我的作品',
    href: 'https://www.douyin.com/user/MS4wLjABAAAA7NgsxvI4NAXGm2fQ5O72KGTPU_a3CJlIJY1ev8tWcjym0CqFUshRVevRJnZrKt-9',
    iconType: 'douyin',
    bgClass: 'social-row-dy',
    external: true,
  },
  {
    id: 'social-mail',
    idx: '03',
    platform: '邮箱',
    handle: '13080700806@163.com · 长按 / 复制直接发邮件',
    href: 'mailto:13080700806@163.com',
    iconType: 'mail',
    bgClass: 'social-row-mail',
    external: false,
  },
];

// 联系方式卡片
export interface ContactCard {
  id: string;
  title: string;
  description: string;
  note: string;
  symbol: 'fish' | 'star' | 'key';
  featured: boolean;
}

export const contactCards: ContactCard[] = [
  {
    id: 'c1',
    title: '项目合作',
    description: '有产品想法想聊聊，或者有业务问题想拆一拆。我擅长把模糊问题压成角色、流程、规则和界面。',
    note: '加微信聊聊',
    symbol: 'fish',
    featured: false,
  },
  {
    id: 'c2',
    title: '技术交流',
    description: '对 Agent、MCP、AI 工作流、B 端系统设计感兴趣，欢迎交流。也欢迎讨论产品方法论和创业实验。',
    note: '随时联系',
    symbol: 'star',
    featured: true,
  },
  {
    id: 'c3',
    title: '科研协作',
    description: '申报书、技术路线图、人物模型、文献核验、信息重构。把复杂材料整理成可评审成果。',
    note: '研究支持',
    symbol: 'key',
    featured: false,
  },
];
