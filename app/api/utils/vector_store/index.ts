import { Embeddings } from '@langchain/core/embeddings';
import { loadPineconeStore } from './pinecone';
import { Callbacks } from '@langchain/core/callbacks/manager';

export async function loadVectorStore({
  namespace,
  embeddings,
}: {
  namespace: string;
  embeddings: Embeddings;
}) {
  const vectorStoreEnv = process.env.NEXT_PUBLIC_VECTORSTORE ?? 'pinecone';

  if (vectorStoreEnv === 'pinecone') {
    return await loadPineconeStore({
      namespace,
      embeddings,
    });
  } else {
    throw new Error(`Invalid vector store id provided: ${vectorStoreEnv}`);
  }
}

export async function loadRetriever({
  namespace,
  embeddings,
  callbacks,
  topK = 5, // Default if not specified
}: {
  namespace: string;
  embeddings: Embeddings;
  callbacks?: Callbacks;
  topK?: number;
}) {
  const store = await loadVectorStore({
    namespace,
    embeddings,
  });
  const vectorstore = store.vectorstore;

  const filter =
    process.env.NEXT_PUBLIC_VECTORSTORE === 'mongodb'
      ? {
          preFilter: {
            docstore_document_id: {
              $eq: namespace,
            },
          },
        }
      : undefined;

  const retriever = vectorstore.asRetriever({
    filter,
    callbacks,
    k: topK, // Set the topK value
  });

  return {
    retriever,
  };
}
