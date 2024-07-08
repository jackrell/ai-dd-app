import DashboardClient from './dashboard-client';
import prisma from '@/utils/prisma';
import { currentUser } from '@clerk/nextjs/server';

export default async function Page() {
  const user= await currentUser();

  // Fetch the list of folders for the current user
  const foldersList = await prisma.document.groupBy({
    by: ['namespace'],
    where: {
      userId: user?.id, // change to allow everyone to access docs
    },
    _min: {
      createdAt: true,
    },
    orderBy: {
      _min: {
        createdAt: 'desc',
      },
    },
  });


  return (
    <div>
      <DashboardClient foldersList={foldersList} />
    </div>
  );
}
