'use client';

import { UploadDropzone } from 'react-uploader';
import { Uploader } from 'uploader';
import { useRouter } from 'next/navigation';
// import DocIcon from '@/components/ui/DocIcon'; NEED TO get doc image
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

// Configuration for the uploader
const uploader = Uploader({
  apiKey: !!process.env.NEXT_PUBLIC_BYTESCALE_API_KEY
    ? process.env.NEXT_PUBLIC_BYTESCALE_API_KEY
    : 'no api key found',
});

export default function DashboardClient({ foldersList }: { foldersList: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [folderName, setFolderName] = useState('');

  const options = {
    maxFileCount: 15, // Allow multiple files
    mimeTypes: ['application/pdf'],
    editor: { images: { crop: false } },
    styles: {
      colors: {
        primary: '#000', // Primary buttons & links
        error: '#d23f4d', // Error messages
      },
    },
  };

  const UploadDropZone = () => (
    <UploadDropzone
      uploader={uploader}
      options={options}
      onUpdate={(files) => {
        if (files.length !== 0) {
          setLoading(true);
          ingestPdfs(
            files.map((file) => ({
              fileUrl: file.fileUrl,
              fileName: file.originalFile.originalFileName || file.filePath,
            }))
          );
        }
      }}
      width="470px"
      height="250px"
    />
  );

  async function ingestPdfs(documents: { fileUrl: string, fileName: string }[]) {
    let res = await fetch('/api/ingestPDF', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documents,
        folderName,
      }),
    });

    let data = await res.json();
    router.push(`/folder/${folderName}`);
  }

  return (
    <div className="mx-auto flex flex-col gap-4 container mt-10">
      <h1 className="text-4xl leading-[1.1] tracking-tighter font-medium text-center">
        Chat With Your Dataroom
      </h1>
      {foldersList.length > 0 && (
        <div className="flex flex-col gap-4 mx-10 my-5">
          <div className="flex flex-col shadow-sm border divide-y-2 sm:min-w-[650px] mx-auto">
            {foldersList.map((folder: any) => (
              <div
                key={folder.name}
                className="flex justify-between p-3 hover:bg-gray-100 transition sm:flex-row flex-col sm:gap-0 gap-3"
              >
                <button
                  onClick={() => router.push(`/folder/${folder.name}`)}
                  className="flex gap-4"
                >
                  {/* <DocIcon /> */}
                  <span>{folder.name}</span>
                </button>
                <span>{formatDistanceToNow(new Date(folder.createdAt))} ago</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {foldersList.length > 0 ? (
        <h2 className="text-3xl leading-[1.1] tracking-tighter font-medium text-center">
          Or upload new PDFs to a folder
        </h2>
      ) : (
        <h2 className="text-3xl leading-[1.1] tracking-tighter font-medium text-center mt-5">
          No folders found. Upload new PDFs below!
        </h2>
      )}
      <div className="mx-auto min-w-[450px] flex justify-center">
        {loading ? (
          <button
            type="button"
            className="inline-flex items-center mt-4 px-4 py-2 font-semibold leading-6 text-lg shadow rounded-md text-black transition ease-in-out duration-150 cursor-not-allowed"
          >
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Ingesting your PDFs...
          </button>
        ) : (
          <div>
            <input
              type="text"
              placeholder="Folder Name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="mb-4"
              required
            />
            <UploadDropZone />
          </div>
        )}
      </div>
    </div>
  );
}
