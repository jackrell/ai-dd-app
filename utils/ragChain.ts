import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever';
import { BaseLanguageModel } from '@langchain/core/language_models/base';
import { BaseRetriever } from '@langchain/core/retrievers';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';

import type { Runnable } from '@langchain/core/runnables';
import type { BaseMessage } from '@langchain/core/messages';


const historyAwarePrompt = ChatPromptTemplate.fromMessages([
  new MessagesPlaceholder('chat_history'),
  ['user', '{input}'],
  [
    'user',
    'Given the above conversation, generate a concise vector store search query to look up in order to get information relevant to the conversation. Focus on retrieving the most relevant and specific documents to the current query, rather than relying on the entire chat history.',
  ],
]);

const ANSWER_SYSTEM_TEMPLATE = `You are an AI assistant with expertise in alternative investments, specializing in due diligence, investment strategies, risk assessment, and financial analysis. 
Use the following pieces of context to answer the question at the end. 
If you don't know the answer, state clearly that you don't know. DO NOT attempt to fabricate an answer. 
If the question is not relevant to the provided context, politely indicate that your responses are limited to the given context.

<context>
{context}
</context>

Ensure your response is accurate and extract specific information from the provided context. If the information is not directly found in the context, indicate that based on your review of the provided documents.

Your response should be thorough, precise, and structured in markdown format, using paragraphs or bullet points as necessary.`;




const answerPrompt = ChatPromptTemplate.fromMessages([
  ['system', ANSWER_SYSTEM_TEMPLATE],
  new MessagesPlaceholder('chat_history'),
  ['user', '{input}'],
]);

export async function createRAGChain(
  model: BaseLanguageModel,
  retriever: BaseRetriever,
): Promise<Runnable<{ input: string; chat_history: BaseMessage[] }, string>> {
  // Create a chain that can rephrase incoming questions for the retriever,
  // taking previous chat history into account. Returns relevant documents.
  const historyAwareRetrieverChain = await createHistoryAwareRetriever({
    llm: model,
    retriever,
    rephrasePrompt: historyAwarePrompt,
  });

  // Create a chain that answers questions using retrieved relevant documents as context.
  const documentChain = await createStuffDocumentsChain({
    llm: model,
    prompt: answerPrompt,
  });

  // Create a chain that combines the above retriever and question answering chains.
  const conversationalRetrievalChain = await createRetrievalChain({
    retriever: historyAwareRetrieverChain,
    combineDocsChain: documentChain,
  });

  // "Pick" the answer from the retrieval chain output object.
  return conversationalRetrievalChain.pick('answer');
}