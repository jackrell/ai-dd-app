'use client';

import { UploadDropzone } from 'react-uploader';
import { Uploader } from 'uploader';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import LoadingDots from '@/components/ui/LoadingDots';


// Configuration for the uploader (BYTESCALE AUTO-UPLOAD)
const uploader = Uploader({
  apiKey: process.env.NEXT_PUBLIC_BYTESCALE_API_KEY || 'no api key found',
});

export default function DashboardClient({ foldersList }: { foldersList: any }) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingDots color="#000" />
      </div>
    );
  }

  const options = {
    maxFileCount: 30, // Allow multiple files
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
        if (files.length > 0) {
          setSelectedFiles((prevFiles) => {
            const newFiles = files.filter((file) => !prevFiles.some((prevFile) => prevFile.fileUrl === file.fileUrl));
            return [...prevFiles, ...newFiles];
          });
        }
      }}
      width="470px"
      height="250px"
    />
  );

  const handleRemoveFile = (fileUrl: string) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((file) => file.fileUrl !== fileUrl));
  };

  const handleFolderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '');
    setFolderName(value);
  };

  async function ingestPdfs() {
    setLoading(true);

    try {
      const documents = selectedFiles.map((file) => ({
        fileUrl: file.fileUrl,
        fileName: file.originalFile.originalFileName || file.filePath,
      }));

      console.log('Ingesting PDFs:', documents);

      const res = await fetch('/api/ingestPDF', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documents,
          folderName,
        }),
      });

      console.log('res:', res);
      const data = await res.json();
      setLoading(false);
      router.push(`/folder/${folderName}`);

    } catch (error) {
      if (error instanceof Error) {
        console.error(`Ingestion handling error: ${error.message}`);
      } else {
        console.error(`Unexpected error: ${error}`);
      }
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex flex-col gap-4 container mt-10">
      <h1 className="text-4xl leading-[1.1] tracking-tighter font-medium text-center">
        Chat With Your Datarooms
      </h1>
      {foldersList.length > 0 && (
        <div className="flex flex-col gap-4 mx-10 my-5">
          <div className="flex flex-col shadow-sm border divide-y-2 sm:min-w-[650px] mx-auto">
            {foldersList.map((folder: any) => (
              <div
                key={folder.namespace}
                className="flex justify-between p-3 hover:bg-gray-100 transition sm:flex-row flex-col sm:gap-0 gap-3"
              >
                <span
                  onClick={() => router.push(`/folder/${folder.namespace}`)}
                  className="flex gap-4 cursor-pointer"
                >
                  {folder.namespace}
                </span>
                <span>
                  {formatDistanceToNow(new Date(folder._min.createdAt))} ago
                </span>
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
      <div className="mx-auto min-w-[450px] flex flex-col justify-center items-center">
        <input
          type="text"
          placeholder="Folder Name"
          value={folderName}
          onChange={handleFolderNameChange}
          className="mb-4 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        <UploadDropZone />
        {selectedFiles.length > 0 && (
          <div className="mt-4 w-full">
            <h3 className="text-lg font-medium mb-2">Selected Files:</h3>
            <ul className="list-disc list-inside">
              {selectedFiles.map((file) => (
                <li key={file.fileUrl} className="flex justify-between items-center mb-2">
                  <span>{file.originalFile.originalFileName || file.filePath}</span>
                  <button
                    onClick={() => handleRemoveFile(file.fileUrl)}
                    className="ml-4 text-red-600 hover:text-red-800 transition"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {selectedFiles.length > 0 && (
          <button
            onClick={ingestPdfs}
            className="mt-4 px-4 py-2 font-semibold leading-6 text-lg shadow rounded-md text-white transition ease-in-out duration-150 bg-blue-500 hover:bg-blue-600"
          >
            Finish and Ingest PDFs
          </button>
        )}
        {loading && (
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
        )}
      </div>
    </div>
  );
}
