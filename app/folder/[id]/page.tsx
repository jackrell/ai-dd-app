import prisma from '@/utils/prisma';
import { currentUser } from '@clerk/nextjs/server';
import FolderClient from './folder-client';

export default async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();

  const documents = await prisma.document.findMany({
    where: {
      namespace: params.id,
      userId: user?.id,
    },
  });

  if (documents.length === 0) {
    return <div>No documents found in this folder</div>;
  }

  return (
    <div>
      <FolderClient folderName={params.id} documents={documents} userImage={user?.imageUrl} />
    </div>
  );
}
