import type { Metadata } from 'next';
import { KnowledgeClient } from '@/components/knowledge/KnowledgeClient';

export const metadata: Metadata = {
  title: '知识库 · 马晨皓',
  description: '笔记、文档、资源、技能树——把学过的一切都种在这里，长成一片林子。',
  openGraph: {
    title: '知识库 · 马晨皓',
    description: '笔记、文档、资源、技能树——把学过的一切都种在这里，长成一片林子。',
    type: 'website',
    locale: 'zh_CN',
  },
};

export default function KnowledgePage() {
  return <KnowledgeClient />;
}
