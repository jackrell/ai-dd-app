import { Embeddings } from '@langchain/core/embeddings';
import { loadPineconeStore } from './pinecone';
// import { loadMongoDBStore } from './mongo';
import { Callbacks } from '@langchain/core/callbacks/manager';


// need to figure out what chatId does

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
  // } else if (vectorStoreEnv === 'mongodb') {
  //   return await loadMongoDBStore({
  //     embeddings,
  //   });
  } else {
    throw new Error(`Invalid vector store id provided: ${vectorStoreEnv}`);
  }
}

export async function loadRetriever({
  namespace,
  embeddings,
  callbacks,
}: {
  namespace: string;
  embeddings: Embeddings;
  callbacks?: Callbacks;
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
  });

  return {
    retriever,
  };
}