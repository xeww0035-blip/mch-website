// 导航配置

export interface NavItem {
  label: string;
  href: string;
  symbol: 'eye' | 'fish' | 'leaf' | 'spiral' | 'tree' | 'key';
  symbolColor: string;
  isExternal?: boolean;
  isCta?: boolean;
}

export const navItems: NavItem[] = [
  {
    label: '角色档案',
    href: '/#about',
    symbol: 'eye',
    symbolColor: 'var(--aqua)',
  },
  {
    label: '作品',
    href: '/#works',
    symbol: 'fish',
    symbolColor: 'var(--ocean)',
  },
  {
    label: '能力',
    href: '/#skills',
    symbol: 'leaf',
    symbolColor: 'var(--leaf)',
  },
  {
    label: '故事书',
    href: '/#journal',
    symbol: 'spiral',
    symbolColor: 'var(--flame)',
  },
  {
    label: '知识库',
    href: '/knowledge',
    symbol: 'tree',
    symbolColor: 'var(--leaf)',
  },
  {
    label: '秘密通道',
    href: '/#contact',
    symbol: 'key',
    symbolColor: 'var(--paper)',
    isCta: true,
  },
];

export const footerLinks = [
  { label: '角色档案', href: '/#about' },
  { label: '作品', href: '/#works' },
  { label: '能力', href: '/#skills' },
  { label: '故事书', href: '/#journal' },
  { label: '知识库', href: '/knowledge' },
  { label: '找我', href: '/#contact' },
];
