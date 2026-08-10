// 知识库数据

export interface Note {
  id: string;
  title: string;
  date: string;
  readTime: string;
  excerpt: string;
  tags: { label: string; color: string }[];
}

export interface DocSection {
  heading: string;
  items: string[];
}

export interface Doc {
  id: string;
  title: string;
  brief: string;
  sections: DocSection[];
  tech: string[];
}

export interface Resource {
  name: string;
  desc: string;
  url: string;
  type: string;
  faviconText: string;
  faviconColor: string;
}

export interface SkillLeaf {
  name: string;
  level: 'master' | 'solid' | 'growing' | 'new';
}

export interface SkillBranch {
  trunk: string;
  trunkColor: string;
  leaves: SkillLeaf[];
}

export const notes: Note[] = [
  {
    id: 'n01',
    title: 'AI 提示词工程：从能聊到可控',
    date: '2026-08-05',
    readTime: '8 min',
    excerpt:
      '提示词不是咒语，是需求文档。把模糊意图翻译成结构化指令的五个层级：角色、任务、约束、格式、示例。每一层加一层，输出可控性翻一倍。',
    tags: [
      { label: 'AI', color: 'ocean' },
      { label: '提示词', color: 'flame' },
      { label: '方法论', color: 'leaf' },
    ],
  },
  {
    id: 'n02',
    title: '产品设计中的「减法思维」',
    date: '2026-07-28',
    readTime: '6 min',
    excerpt:
      '不是加功能显得厉害，是减到只剩核心还能好用才算功力。一个页面只解决一件事，一个按钮只有一个动词。',
    tags: [
      { label: '产品设计', color: 'pink' },
      { label: '方法论', color: 'leaf' },
    ],
  },
  {
    id: 'n03',
    title: 'Toyism 视觉语法系统研究',
    date: '2026-08-10',
    readTime: '15 min',
    excerpt:
      '玩具主义不是到处画圆点 + 鲜艳颜色，而是一套有严格规则的视觉语法系统。Ink Navy 替代纯黑、四种点语法、平面色块碰撞、biomorphic 不对称形态。',
    tags: [
      { label: '设计', color: 'pink' },
      { label: 'Toyism', color: 'flame' },
      { label: '视觉系统', color: 'ocean' },
    ],
  },
  {
    id: 'n04',
    title: '见己方法论：行动→结果→反馈→反思→修正',
    date: '2026-07-15',
    readTime: '10 min',
    excerpt:
      '不是先想清楚再做，是先做再想。五步闭环让每一次行动都变成认知迭代。做的速度就是学的速度，修正的密度就是成长的密度。',
    tags: [
      { label: '方法论', color: 'leaf' },
      { label: '自我管理', color: 'ocean' },
    ],
  },
  {
    id: 'n05',
    title: 'RAG、Agent、MCP 的关系拆解',
    date: '2026-06-20',
    readTime: '12 min',
    excerpt:
      'RAG 解决知识边界，Agent 解决行动边界，MCP 解决工具边界。三者不是替代关系，是叠加关系——叠加之后才是完整的 AI 应用架构。',
    tags: [
      { label: 'AI', color: 'ocean' },
      { label: '架构', color: 'flame' },
    ],
  },
  {
    id: 'n06',
    title: '招投标流程中的信息核验方法',
    date: '2026-05-30',
    readTime: '7 min',
    excerpt:
      '1000+ 册标书不是用来看的，是用来查的。建立关键词索引 → 分类标签 → 异常标记三步法，把信息核验从"人工通读"变成"系统检索"。',
    tags: [
      { label: '招采', color: 'flame' },
      { label: '方法论', color: 'leaf' },
    ],
  },
];

export const docs: Doc[] = [
  {
    id: 'd01',
    title: 'AI 电商经营工作台',
    brief: '用 AI 重构电商运营全流程：选品、文案、视觉、数据',
    sections: [
      {
        heading: '设计目标',
        items: [
          '让一个小商家也能拥有大团队才有的运营能力',
          '从"人找工具"变成"工具主动推送该做的事"',
          '每个功能模块独立可用，组合起来是完整工作流',
        ],
      },
      {
        heading: '技术选型',
        items: [
          '前端：React + TailwindCSS',
          'AI 接入：OpenAI API + 本地 RAG',
          '数据层：PostgreSQL + Redis 缓存',
          '部署：Docker + 云服务器',
        ],
      },
      {
        heading: '当前状态',
        items: [
          '推进中，核心模块已验证可行性',
          '正在做选品 + 文案模块的联调',
          '下一步：视觉生成模块接入',
        ],
      },
    ],
    tech: ['React', 'OpenAI', 'RAG', 'PostgreSQL', 'Docker'],
  },
  {
    id: 'd02',
    title: '招采云链 · 智能招投标平台',
    brief: '3人团队 / 2000万项目 / 34家供应商 / 1000+册标书',
    sections: [
      {
        heading: '项目概述',
        items: [
          '为百年人寿搭建招标采购数字化平台',
          '覆盖从需求发起到合同签订的全流程',
          '核心痛点：标书信息核验效率低、供应商管理分散',
        ],
      },
      {
        heading: '我的角色',
        items: [
          '产品设计 + 项目推进（3人团队）',
          '负责需求分析、原型设计、用户测试',
          '搭建标书信息核验的关键词索引系统',
        ],
      },
      {
        heading: '关键成果',
        items: [
          '管理 34 家供应商、1000+ 册标书',
          '信息核验效率提升（具体数据待补充）',
          '形成可复用的招采数字化方法论',
        ],
      },
    ],
    tech: ['产品设计', '项目管理', '信息架构', '用户测试'],
  },
  {
    id: 'd03',
    title: 'DJTU 校园评价 Agent',
    brief: '让大连交通大学的学生用一个 AI 入口查到所有校园信息',
    sections: [
      {
        heading: '设计思路',
        items: [
          '校园信息散落在教务处、贴吧、微信群——需要一个统一入口',
          '用 Agent 架构：意图识别 → 知识检索 → 回答生成',
          '先做评价查询，再扩展到课程、食堂、活动',
        ],
      },
      {
        heading: '技术架构',
        items: [
          '知识库：校园公开数据 + 用户评价 RAG',
          'Agent 框架：意图分类 + 多工具调用',
          '前端：微信小程序 / Web 双端',
        ],
      },
      {
        heading: '待解决',
        items: [
          '数据冷启动——需要种子用户贡献评价',
          '评价质量管控——防刷评、防恶意',
          '隐私边界——评价匿名 vs 可追溯',
        ],
      },
    ],
    tech: ['Agent', 'RAG', '微信小程序', 'NLP'],
  },
  {
    id: 'd04',
    title: 'AI 合同审查平台',
    brief: '用 AI 自动识别合同风险条款，辅助法务审查',
    sections: [
      {
        heading: '核心功能',
        items: [
          '合同上传 → 自动结构化解析',
          '风险条款识别 + 高亮标注',
          '对比模板，标记偏离项',
          '生成审查报告',
        ],
      },
      {
        heading: '技术方案',
        items: [
          '文档解析：OCR + NLP 结构化',
          '风险识别：大模型 + 规则引擎双通道',
          '已形成软件著作权申请材料',
        ],
      },
    ],
    tech: ['OCR', 'NLP', '大模型', '规则引擎'],
  },
];

export const resources: Resource[] = [
  {
    name: 'AI 产品经理自学知识库',
    desc: '从 PM 基本功到大模型/RAG/Agent/MCP，免费公开的飞书知识库',
    url: 'https://feishu.cn',
    type: '知识库',
    faviconText: 'AI',
    faviconColor: '#3DA9C9',
  },
  {
    name: 'GitHub',
    desc: '全球最大代码托管平台，开源项目、学习资源、工具库',
    url: 'https://github.com',
    type: '工具',
    faviconText: 'GH',
    faviconColor: '#1A1B3A',
  },
  {
    name: 'MDN Web Docs',
    desc: 'Web 开发最权威的文档，HTML/CSS/JS 查阅首选',
    url: 'https://developer.mozilla.org',
    type: '文档',
    faviconText: 'MD',
    faviconColor: '#1B5E3F',
  },
  {
    name: 'Figma',
    desc: '在线协作设计工具，原型、UI、组件库一站式',
    url: 'https://figma.com',
    type: '工具',
    faviconText: 'Fi',
    faviconColor: '#F26B83',
  },
  {
    name: 'Coursera',
    desc: '全球名校在线课程，AI/ML/产品/设计方向资源丰富',
    url: 'https://coursera.org',
    type: '学习',
    faviconText: 'Co',
    faviconColor: '#1656A3',
  },
  {
    name: 'Product Hunt',
    desc: '每日发现新产品的最佳社区，看别人在做什么',
    url: 'https://producthunt.com',
    type: '社区',
    faviconText: 'PH',
    faviconColor: '#F77F00',
  },
  {
    name: 'Hugging Face',
    desc: 'AI 模型社区，开源模型、数据集、Demo 都在这里',
    url: 'https://huggingface.co',
    type: 'AI',
    faviconText: 'HF',
    faviconColor: '#FFD23F',
  },
  {
    name: 'Notion',
    desc: '个人知识管理工具，笔记、数据库、看板一体化',
    url: 'https://notion.so',
    type: '工具',
    faviconText: 'No',
    faviconColor: '#1A1B3A',
  },
];

export const skillTree: SkillBranch[] = [
  {
    trunk: '产品',
    trunkColor: '#F77F00',
    leaves: [
      { name: '需求分析', level: 'master' },
      { name: '原型设计', level: 'master' },
      { name: '用户测试', level: 'solid' },
      { name: '产品策略', level: 'solid' },
      { name: '数据分析', level: 'growing' },
    ],
  },
  {
    trunk: '设计',
    trunkColor: '#F26B83',
    leaves: [
      { name: 'UI 设计', level: 'solid' },
      { name: '交互设计', level: 'master' },
      { name: '视觉系统', level: 'solid' },
      { name: '设计研究', level: 'growing' },
      { name: '动效设计', level: 'new' },
    ],
  },
  {
    trunk: 'AI',
    trunkColor: '#3DA9C9',
    leaves: [
      { name: '提示词工程', level: 'master' },
      { name: 'RAG 架构', level: 'solid' },
      { name: 'Agent 设计', level: 'solid' },
      { name: '工作流自动化', level: 'solid' },
      { name: '模型微调', level: 'new' },
    ],
  },
  {
    trunk: '工程',
    trunkColor: '#5BBA47',
    leaves: [
      { name: 'HTML/CSS', level: 'master' },
      { name: 'JavaScript', level: 'solid' },
      { name: 'React', level: 'growing' },
      { name: 'Python', level: 'growing' },
      { name: '数据库', level: 'growing' },
    ],
  },
  {
    trunk: '方法',
    trunkColor: '#1656A3',
    leaves: [
      { name: '见己方法论', level: 'master' },
      { name: '系统拆解', level: 'master' },
      { name: '信息核验', level: 'solid' },
      { name: '复杂文档处理', level: 'solid' },
      { name: '跨领域迁移', level: 'solid' },
    ],
  },
];

export const privateNotes: Note[] = [
  {
    id: 'p01',
    title: '未公开的想法：AI + 校园社交',
    date: '2026-08-08',
    readTime: '5 min',
    excerpt:
      '校园社交的本质不是"认识新的人"，是"找到一起做事的人"。如果把 Agent 做成"匹配做事伙伴"的入口呢？不是相亲，是相项目。',
    tags: [
      { label: '草稿', color: 'pink' },
      { label: 'AI', color: 'ocean' },
    ],
  },
  {
    id: 'p02',
    title: '个人 OKR · 2026 Q3',
    date: '2026-07-01',
    readTime: '4 min',
    excerpt:
      'O：把 AI 真正用起来。KR1：完成电商工作台核心模块。KR2：知识库积累 20 篇笔记。KR3：网站上线并获得 100+ 访问。',
    tags: [
      { label: '私人', color: 'pink' },
      { label: '目标', color: 'flame' },
    ],
  },
  {
    id: 'p03',
    title: '读《设计中的设计》笔记',
    date: '2026-06-10',
    readTime: '10 min',
    excerpt:
      '原研哉说"设计就是把日常的东西变得陌生，再重新认识它"。这句话跟 Toyism 的理念居然是通的——把熟悉的东西变形，让人重新看见。',
    tags: [
      { label: '读书', color: 'leaf' },
      { label: '设计', color: 'pink' },
    ],
  },
];

// 密码（base64 编码，当前密码：0806）
export const PRIVATE_PASSWORD_HASH = 'MDgwNg==';
