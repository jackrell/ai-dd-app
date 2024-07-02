import { NextResponse } from 'next/server';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
// import pdfParse from 'pdf-parse';
// import { WebPDFLoader } from '@langchain/community/document_loaders/web/pdf';
// import pdf from 'pdf-parse';
import prisma from '@/utils/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { loadEmbeddingsModel } from '../utils/embeddings';
import { loadVectorStore } from '../utils/vector_store';

async function fetchWithRetry(url: string, options: any, retries = 5, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error('Network response was not ok');
      return response;
    } catch (error) {
      console.error(`Fetch error: ${error.message}`);
      if (i < retries - 1) {
        console.warn(`Fetch failed, retrying in ${delay}ms... (${i + 1}/${retries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  console.log('requesting documents');
  const { documents, folderName } = await request.json();
  console.log('documents, folderName obtained');

  const { userId } = getAuth(request as any);

  if (!userId) {
    return NextResponse.json({ error: 'You must be logged in to ingest data' });
  }

  const namespace = folderName;
  const results = [];

  console.log(`Starting ingestion for folder: ${folderName}`);

  for (const { fileUrl, fileName } of documents) {
    console.log(`Processing file: ${fileName}`);

    try {
      const doc = await prisma.document.create({
        data: {
          fileName,
          fileUrl,
          userId,
          namespace,
        },
      });

      console.log(`Created document record for: ${fileName}`);

      const response = await fetchWithRetry(fileUrl, { method: 'GET' }, 5, 5000);

      // langchain pdf-loader method
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const loader = new PDFLoader(blob);
      const rawDocs = await loader.load();

      // // pdf-parse method
      // const arrayBuffer = await response.arrayBuffer();
      // const buffer = Buffer.from(arrayBuffer);
      // const pdfData = await pdfParse(buffer);
      // const rawDocs = [{ pageContent: pdfData.text }];

      // // web loader method 
      // const arrayBuffer = await response.arrayBuffer();
      // const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      // const loader = new WebPDFLoader(blob, {
      //   // you may need to add `.then(m => m.default)` to the end of the import
      //   pdfjs: () => import('pdfjs-dist/build/pdf').then(m => m.default),
      // });
      // const rawDocs = await loader.load();

      // // pdf-parse method 2
      // const arrayBuffer = await response.arrayBuffer();
      // const buffer = Buffer.from(arrayBuffer);
      // const data = await pdf(buffer);

      console.log(`Loaded PDF: ${fileName}`);

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1024,
        chunkOverlap: 256,
      });
      const splitDocs = await textSplitter.splitDocuments(rawDocs);
      // const splitDocs = await textSplitter.splitDocuments([{ pageContent: data.text, metadata: { fileName } }]);

      splitDocs.forEach((splitDoc) => {
        splitDoc.metadata.fileName = fileName;
      });

      console.log(`Split document into chunks: ${fileName}`);

      console.log('creating vector store...');

      const embeddings = loadEmbeddingsModel();

      const store = await loadVectorStore({
        namespace,
        embeddings,
      });
      const vectorstore = store.vectorstore;

      // embed the PDF documents
      for (const splitDoc of splitDocs) {
        await vectorstore.addDocuments([splitDoc]);
        await delay(1000);                                // 1-second delay between each embedding query
      }

      results.push({ success: true, fileName, id: doc.id });

    } catch (error) {
      console.error(`Error processing file ${fileName}:`, error);
      results.push({ success: false, fileName, error: 'Failed to ingest your data' });
    }
  }

  console.log(`Finished ingestion for folder: ${folderName}`);

  return NextResponse.json({
    results,
  });
}
