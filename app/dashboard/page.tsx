import DashboardClient from './dashboard-client';
import prisma from '@/utils/prisma';
// import { currentUser } from '@clerk/nextjs';
// import type { User } from '@clerk/nextjs/api';

export default async function Page() {
  // const user: User | null = await currentUser();

  // Fetch the list of folders for the current user
//   const foldersList = await prisma.document.groupBy({
//     by: ['namespace'],
//     // where: {
//     //   userId: user?.id,
//     // },
//     // _min: {
//     //   createdAt: true,
//     // },
//     // orderBy: {
//     //   _min: {
//     //     createdAt: 'desc',
//     //   },
//     // },
//   });

 const foldersList = '';
  return (
    <div>
      <DashboardClient foldersList={foldersList} />
    </div>
  );
}
