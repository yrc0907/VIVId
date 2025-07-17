import React from 'react';
import { TemplateCard, Template } from './components/TemplateCard';
import { PageTitle, Container } from '@/components/layout';

const sampleTemplates: Template[] = [
  {
    id: '1',
    name: '商务报告',
    description: '适用于年度报告、商业计划和市场分析的专业模板。',
    category: '商务',
    imageUrl: 'https://placehold.co/600x400/1e293b/ffffff?text=商务报告',
  },
  {
    id: '2',
    name: '科技讲座',
    description: '为技术分享、产品发布和科学研究设计的现代化模板。',
    category: '科技',
    imageUrl: 'https://placehold.co/600x400/4f46e5/ffffff?text=科技讲座',
  },
  {
    id: '3',
    name: '教育培训',
    description: '适合课程教学、在线教育和学生演讲的清晰简洁模板。',
    category: '教育',
    imageUrl: 'https://placehold.co/600x400/16a34a/ffffff?text=教育培训',
  },
  {
    id: '4',
    name: '创意作品集',
    description: '展示设计作品、摄影项目和艺术创作的优雅模板。',
    category: '创意',
    imageUrl: 'https://placehold.co/600x400/be185d/ffffff?text=创意作品集',
  },
  {
    id: '5',
    name: '项目提案',
    description: '用于项目启动、进度汇报和团队协作的实用模板。',
    category: '商务',
    imageUrl: 'https://placehold.co/600x400/b45309/ffffff?text=项目提案',
  },
  {
    id: '6',
    name: '个人简历',
    description: '以专业且引人注目的方式展示您的技能和经验。',
    category: '个人',
    imageUrl: 'https://placehold.co/600x400/6d28d9/ffffff?text=个人简历',
  },
];

const TemplatesPage = () => {
  return (
    <Container>
      <PageTitle
        title="模板中心"
        description="从这里开始您的下一次精彩演示"
        className="text-center mb-12"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {sampleTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </Container>
  );
};

export default TemplatesPage;
