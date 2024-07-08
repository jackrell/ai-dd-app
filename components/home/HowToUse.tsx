'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function HowToUse() {
  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-6">How to Use the App</h2>
        <p className="text-lg mb-6">
          This app allows you to upload and chat with your documents. Follow the steps below to get started.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <Image src="/upload-icon.png" alt="Upload Icon" width={64} height={64} />
            <h3 className="text-xl font-semibold mt-4">1. Upload Your Documents</h3>
            <p className="text-center mt-2">
              Click on the "Upload" button and select the documents you want to upload. You can upload multiple PDF files at once.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <Image src="/logo.png" alt="Folder Icon" width={64} height={64} />
            <h3 className="text-xl font-semibold mt-4">2. Organize in Folders</h3>
            <p className="text-center mt-2">
              Organize your documents into folders for easy access. Name your folders appropriately for better organization.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <Image src="/chat-icon.png" alt="Chat Icon" width={64} height={64} />
            <h3 className="text-xl font-semibold mt-4">3. Chat with Your Documents</h3>
            <p className="text-center mt-2">
              Use the chat interface to interact with your documents. Ask questions and get answers based on the content of your files.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
