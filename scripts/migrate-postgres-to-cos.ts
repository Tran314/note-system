import { PrismaClient } from '@prisma/client';
import COS from 'cos-js-sdk-v5';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const cosClient = new COS({
  SecretId: process.env.VITE_COS_SECRET_ID!,
  SecretKey: process.env.VITE_COS_SECRET_KEY!,
});

const config = {
  bucket: process.env.VITE_COS_BUCKET!,
  region: process.env.VITE_COS_REGION!,
};

async function migrateUser(userId: string) {
  console.log(`Migrating user: ${userId}`);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    console.error(`User ${userId} not found`);
    return;
  }

  const notes = await prisma.note.findMany({
    where: { userId },
    include: { tags: { include: { tag: true } } },
  });

  const folders = await prisma.folder.findMany({ where: { userId } });
  const tags = await prisma.tag.findMany({ where: { userId } });
  const attachments = await prisma.attachment.findMany({ where: { userId } });
  const versions = await prisma.noteVersion.findMany({
    where: { noteId: { in: notes.map((n) => n.id) } },
  });

  await uploadProfile(user);
  await uploadSettings(user);
  await uploadNotes(notes, versions);
  await uploadFolders(folders);
  await uploadTags(tags);
  await uploadAttachments(attachments);

  console.log(`Migration completed for user ${userId}`);
}

async function uploadProfile(user: any) {
  const profile = {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };

  await cosClient.putObject({
    Bucket: config.bucket,
    Region: config.region,
    Key: `users/${user.id}/profile.json`,
    Body: JSON.stringify(profile, null, 2),
    ContentType: 'application/json',
  });
}

async function uploadSettings(user: any) {
  const settings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  if (settings) {
    await cosClient.putObject({
      Bucket: config.bucket,
      Region: config.region,
      Key: `users/${user.id}/settings.json`,
      Body: JSON.stringify(
        {
          userId: user.id,
          theme: settings.theme,
          editorFontSize: settings.editorFontSize,
          autoSave: settings.autoSave,
          autoSaveInterval: settings.autoSaveInterval,
        },
        null,
        2
      ),
      ContentType: 'application/json',
    });
  }
}

async function uploadNotes(notes: any[], versions: any[]) {
  const versionsByNote = new Map<string, any[]>();
  versions.forEach((v) => {
    if (!versionsByNote.has(v.noteId)) {
      versionsByNote.set(v.noteId, []);
    }
    versionsByNote.get(v.noteId)!.push(v);
  });

  const notesIndex: any[] = [];

  for (const note of notes) {
    const noteData = {
      id: note.id,
      userId: note.userId,
      folderId: note.folderId,
      title: note.title,
      content: note.content,
      isPinned: note.isPinned,
      isDeleted: note.isDeleted,
      deletedAt: note.deletedAt?.toISOString(),
      version: note.version,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
      tags: note.tags.map((nt) => nt.tagId),
    };

    await cosClient.putObject({
      Bucket: config.bucket,
      Region: config.region,
      Key: `users/${note.userId}/notes/${note.id}.json`,
      Body: JSON.stringify(noteData, null, 2),
      ContentType: 'application/json',
    });

    const noteVersions = versionsByNote.get(note.id) || [];
    if (noteVersions.length > 0) {
      await cosClient.putObject({
        Bucket: config.bucket,
        Region: config.region,
        Key: `users/${note.userId}/notes/${note.id}.versions.json`,
        Body: JSON.stringify(
          {
            noteId: note.id,
            versions: noteVersions.map((v) => ({
              id: v.id,
              version: v.version,
              title: v.title,
              content: v.content,
              createdAt: v.createdAt.toISOString(),
            })),
          },
          null,
          2
        ),
        ContentType: 'application/json',
      });
    }

    if (!note.isDeleted) {
      notesIndex.push({
        id: note.id,
        title: note.title,
        updatedAt: note.updatedAt.toISOString(),
        isPinned: note.isPinned,
        folderId: note.folderId,
        tags: note.tags.map((nt) => nt.tagId),
      });
    }
  }

  await cosClient.putObject({
    Bucket: config.bucket,
    Region: config.region,
    Key: `users/${notes[0]?.userId}/notes/index.json`,
    Body: JSON.stringify(
      {
        userId: notes[0]?.userId,
        notes: notesIndex.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
      },
      null,
      2
    ),
    ContentType: 'application/json',
  });
}

async function uploadFolders(folders: any[]) {
  const tree = buildFolderTree(folders);

  for (const folder of folders) {
    await cosClient.putObject({
      Bucket: config.bucket,
      Region: config.region,
      Key: `users/${folder.userId}/folders/${folder.id}.json`,
      Body: JSON.stringify(
        {
          id: folder.id,
          userId: folder.userId,
          name: folder.name,
          parentId: folder.parentId,
          sortOrder: folder.sortOrder,
          createdAt: folder.createdAt.toISOString(),
          updatedAt: folder.updatedAt.toISOString(),
        },
        null,
        2
      ),
      ContentType: 'application/json',
    });
  }

  await cosClient.putObject({
    Bucket: config.bucket,
    Region: config.region,
    Key: `users/${folders[0]?.userId}/folders/tree.json`,
    Body: JSON.stringify({ userId: folders[0]?.userId, tree }, null, 2),
    ContentType: 'application/json',
  });
}

function buildFolderTree(folders: any[]): any[] {
  const folderMap = new Map<string, any>();
  const roots: any[] = [];

  folders.forEach((f) => {
    folderMap.set(f.id, {
      id: f.id,
      name: f.name,
      parentId: f.parentId,
      children: [],
    });
  });

  folderMap.forEach((node) => {
    if (node.parentId && folderMap.has(node.parentId)) {
      folderMap.get(node.parentId).children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

async function uploadTags(tags: any[]) {
  for (const tag of tags) {
    await cosClient.putObject({
      Bucket: config.bucket,
      Region: config.region,
      Key: `users/${tag.userId}/tags/${tag.id}.json`,
      Body: JSON.stringify(
        {
          id: tag.id,
          userId: tag.userId,
          name: tag.name,
          color: tag.color,
          createdAt: tag.createdAt.toISOString(),
        },
        null,
        2
      ),
      ContentType: 'application/json',
    });
  }

  await cosClient.putObject({
    Bucket: config.bucket,
    Region: config.region,
    Key: `users/${tags[0]?.userId}/tags/index.json`,
    Body: JSON.stringify(
      {
        userId: tags[0]?.userId,
        tags: tags.map((t) => ({
          id: t.id,
          name: t.name,
          color: t.color,
        })),
      },
      null,
      2
    ),
    ContentType: 'application/json',
  });
}

async function uploadAttachments(attachments: any[]) {
  for (const attachment of attachments) {
    const filePath = path.resolve(attachment.filePath);
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      await cosClient.putObject({
        Bucket: config.bucket,
        Region: config.region,
        Key: `users/${attachment.userId}/attachments/${attachment.id}`,
        Body: fileBuffer,
      });
    }
  }

  await cosClient.putObject({
    Bucket: config.bucket,
    Region: config.region,
    Key: `users/${attachments[0]?.userId}/attachments/index.json`,
    Body: JSON.stringify(
      {
        userId: attachments[0]?.userId,
        attachments: attachments.map((a) => ({
          id: a.id,
          filename: a.filename,
          fileSize: a.fileSize,
          mimeType: a.mimeType,
          noteId: a.noteId,
          createdAt: a.createdAt.toISOString(),
        })),
      },
      null,
      2
    ),
    ContentType: 'application/json',
  });
}

async function main() {
  const userId = process.argv[2];
  if (!userId) {
    console.error('Usage: ts-node migrate-postgres-to-cos.ts <userId>');
    process.exit(1);
  }

  try {
    await migrateUser(userId);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
