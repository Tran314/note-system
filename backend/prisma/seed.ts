import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始种子数据...');

  // 创建测试用户
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@nebula.app' },
    update: {},
    create: {
      email: 'demo@nebula.app',
      passwordHash: hashedPassword,
      nickname: 'Demo User',
      avatarUrl: null,
    },
  });

  console.log('✅ 创建测试用户:', user.email);

  // 创建用户设置
  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      theme: 'light',
      editorFontSize: 16,
    },
  });

  console.log('✅ 创建用户设置');

  // 创建示例文件夹
  const workFolder = await prisma.folder.create({
    data: {
      userId: user.id,
      name: '工作',
      sortOrder: 0,
    },
  });

  const personalFolder = await prisma.folder.create({
    data: {
      userId: user.id,
      name: '个人',
      sortOrder: 1,
    },
  });

  const ideasFolder = await prisma.folder.create({
    data: {
      userId: user.id,
      name: '灵感',
      parentId: workFolder.id,
      sortOrder: 0,
    },
  });

  console.log('✅ 创建示例文件夹:', workFolder.name, personalFolder.name, ideasFolder.name);

  // 创建示例标签
  const tags = await Promise.all([
    prisma.tag.create({
      data: { userId: user.id, name: '重要', color: '#EF4444' },
    }),
    prisma.tag.create({
      data: { userId: user.id, name: '待办', color: '#F59E0B' },
    }),
    prisma.tag.create({
      data: { userId: user.id, name: '想法', color: '#3B82F6' },
    }),
    prisma.tag.create({
      data: { userId: user.id, name: '学习', color: '#10B981' },
    }),
  ]);

  console.log('✅ 创建示例标签:', tags.map(t => t.name).join(', '));

  // 创建示例笔记
  const note1 = await prisma.note.create({
    data: {
      userId: user.id,
      folderId: workFolder.id,
      title: 'Nebula 使用指南',
      content: `<h1>🌌 欢迎使用 Nebula</h1>
<p>Nebula 是一个现代化的笔记管理系统，帮助你整理思绪，记录灵感。</p>
<h2>✨ 主要功能</h2>
<ul>
<li>📁 <strong>文件夹管理</strong> - 无限层级嵌套</li>
<li>🏷️ <strong>标签系统</strong> - 彩色标签分类</li>
<li>📝 <strong>富文本编辑</strong> - 支持 Markdown</li>
<li>🔍 <strong>全文搜索</strong> - 快速查找笔记</li>
<li>💾 <strong>自动保存</strong> - 不用担心丢失内容</li>
</ul>
<h2>⌨️ 快捷键</h2>
<table>
<tr><td><kbd>Ctrl + S</kbd></td><td>保存笔记</td></tr>
<tr><td><kbd>Ctrl + B</kbd></td><td>加粗</td></tr>
<tr><td><kbd>Ctrl + I</kbd></td><td>斜体</td></tr>
<tr><td><kbd>Ctrl + K</kbd></td><td>插入链接</td></tr>
</table>
<p>开始你的 Nebula 之旅吧！🚀</p>`,
      isPinned: true,
    },
  });

  const note2 = await prisma.note.create({
    data: {
      userId: user.id,
      folderId: ideasFolder.id,
      title: '项目想法',
      content: `<h1>💡 项目想法收集</h1>
<p>这里记录一些有趣的项目想法...</p>
<blockquote>
<p>最好的想法往往来自日常生活中的灵光一现。</p>
</blockquote>`,
    },
  });

  const note3 = await prisma.note.create({
    data: {
      userId: user.id,
      folderId: personalFolder.id,
      title: '读书清单',
      content: `<h1>📚 2024 读书清单</h1>
<ul>
<li>《深入理解计算机系统》⏳ 进行中</li>
<li>《设计模式》✅ 已完成</li>
<li>《代码大全》📖 待读</li>
</ul>`,
    },
  });

  // 关联标签
  await prisma.noteTag.create({
    data: { noteId: note1.id, tagId: tags[2].id },
  });

  await prisma.noteTag.create({
    data: { noteId: note2.id, tagId: tags[0].id },
  });

  await prisma.noteTag.create({
    data: { noteId: note3.id, tagId: tags[3].id },
  });

  console.log('✅ 创建示例笔记:', note1.title, note2.title, note3.title);

  console.log('🎉 种子数据完成！');
  console.log('');
  console.log('📋 测试账号信息:');
  console.log('   邮箱: demo@nebula.app');
  console.log('   密码: password123');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });