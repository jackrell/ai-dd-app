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
    'Based on the provided context and any relevant past conversations, generate a concise vector store search query to look up in order to get information relevant to the conversation.',
  ],
]);

const ANSWER_SYSTEM_TEMPLATE = `You are an AI assistant with expertise in alternative investments, specializing in due diligence, investment strategies, risk assessment, and financial analysis. 
Use the following pieces of context to answer the question at the end. 
If you don't know the answer, state clearly that you don't know. DO NOT attempt to fabricate an answer. 
If the question is not relevant to the provided context, politely indicate that your responses are limited to the given context.

<context>
{context}
</context>

Make sure to extract and reference specific information from the provided context to answer the question. If the information is not directly found in the context, indicate that based on your review of the provided documents.

Your response should be thorough, precise, and structured in markdown format. Follow these guidelines for your response:

1. **Heading**: Provide a clear and relevant heading for the main topic.
2. **Subheadings**: Break down the response into logical sub-sections with subheadings.
3. **Content Style**: Use paragraphs for detailed explanations and bullet points for lists or key points, depending on what is most appropriate.
4. **Direct Answers**: Begin with the direct answer to the question if applicable.
5. **Additional Context**: Offer any additional relevant context or information following the direct answer.

Example Format:

# [Main Topic Heading]

## [Subheading]
[Paragraph with detailed explanation.]

## [Subheading]
- [Bullet Point 1]
- [Bullet Point 2]

Direct Answer: [Your precise answer]

Additional Context: [Any further relevant details]

Please proceed with your response below:`;



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