import { NextResponse } from 'next/server';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import prisma from '@/utils/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { loadEmbeddingsModel } from '../utils/embeddings';
import { loadVectorStore } from '../utils/vector_store';


// need to add in a folderName with the JSON somehow? and make sure documents is an array?

export async function POST(request: Request) {
  const { documents, folderName } = await request.json();
  // Each document should have fileUrl and fileName

  // comment back in for authentication
   const { userId } = getAuth(request as any);

   if (!userId) {
    return NextResponse.json({ error: 'You must be logged in to ingest data' });
   }

  const namespace = folderName;

  const results = [];
  
  for (const { fileUrl, fileName } of documents) {
    try {
      const doc = await prisma.document.create({
        data: {
          fileName,
          fileUrl,
          userId,
          namespace,
        },
      });

      /* load from remote pdf URL */
      const response = await fetch(fileUrl);
      const buffer = await response.blob();
      const loader = new PDFLoader(buffer);
      const rawDocs = await loader.load();

      /* Split text into chunks */
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const splitDocs = await textSplitter.splitDocuments(rawDocs);

      console.log('creating vector store...');

      /* create and store the embeddings in the vectorStore */
      const embeddings = loadEmbeddingsModel();

      const store = await loadVectorStore({
        namespace,
        embeddings,
      });
      const vectorstore = store.vectorstore;

      // embed the PDF documents
      await vectorstore.addDocuments(splitDocs);

      results.push({ success: true, fileName, id: doc.id });

    } catch (error) {
      console.log('error', error);
      results.push({ success: false, fileName, error: 'Failed to ingest your data' });
    }
  }

  return NextResponse.json({
    results,
  });
}
