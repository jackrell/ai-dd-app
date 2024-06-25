'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import LoadingDots from '@/components/ui/LoadingDots';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import type {
  ToolbarSlot,
  TransformToolbarSlot,
} from '@react-pdf-viewer/toolbar';
import { toolbarPlugin } from '@react-pdf-viewer/toolbar';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import Toggle from '@/components/ui/Toggle';
import { useChat } from 'ai/react';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // Import KaTeX CSS

export default function FolderClient({
  folderName,
  documents,
  userImage,
}: {
  folderName: string;
  documents: Document[];
  userImage?: string;
}) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(documents[0]);
  const toolbarPluginInstance = toolbarPlugin();
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { renderDefaultToolbar, Toolbar } = toolbarPluginInstance;

  const transform: TransformToolbarSlot = (slot: ToolbarSlot) => ({
    ...slot,
    Download: () => <></>,
    SwitchTheme: () => <></>,
    Open: () => <></>,
  });

  const pdfUrl = selectedDocument?.fileUrl;

  const [sourcesForMessages, setSourcesForMessages] = useState<
    Record<string, any>
  >({});
  const [error, setError] = useState('');
  const [chatOnlyView, setChatOnlyView] = useState(false);

  const [messages, setMessages] = useState([]);
  const { input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      folderName,
    },
    async onResponse(response) {
      console.log('Response received');
      if (!response.body) {
        setError('No response body found');
        console.error('No response body found');
        return;
      }

      const reader = response.body.getReader();
      const textDecoder = new TextDecoder();
      let completeResponse = '';
      let sources = [];

      try {
        while (true) {
          console.log('Reading from stream...');
          const { done, value } = await reader.read();
          if (done) {
            console.log('Stream reading done');
            break;
          }

          const decodedValue = textDecoder.decode(value, { stream: true });
          console.log('Decoded value:', decodedValue);
          completeResponse += decodedValue;

          // Update the last assistant message with the streaming response
          setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            if (newMessages.length === 0 || newMessages[newMessages.length - 1]?.role !== 'assistant') {
              newMessages.push({ role: 'assistant', content: completeResponse });
            } else {
              newMessages[newMessages.length - 1].content = completeResponse;
            }
            return newMessages;
          });
        }

        reader.releaseLock(); // Ensure the reader is released

      } catch (e) {
        setError(e.message);
        console.error('Error while reading stream:', e);
        return;
      }

      const sourcesHeader = response.headers.get('x-sources');
      sources = sourcesHeader ? JSON.parse(atob(sourcesHeader)) : [];
      console.log('Sources:', sources);

      const messageIndexHeader = response.headers.get('x-message-index');
      const messageIndex = messageIndexHeader ? parseInt(messageIndexHeader, 10) : messages.length - 1;

      if (sources.length && messageIndex !== null) {
        setSourcesForMessages((prevSources) => ({
          ...prevSources,
          [messageIndex]: sources,
        }));
      }

      console.log('Complete response:', completeResponse);
    },
    onError: (e) => {
      setError(e.message);
      console.error('Error in onResponse:', e);
    },
    onFinish() {
      console.log('Response finished');
    },
  });

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  // Prevent empty chat submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      setMessages((prevMessages) => [...prevMessages, { role: 'user', content: input }]);
      handleSubmit(e);
    } else if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setMessages((prevMessages) => [...prevMessages, { role: 'user', content: input }]);
    handleSubmit(e);
  };

  let userProfilePic = userImage ? userImage : '/profile-icon.png';

  const extractSourcePageNumber = (source: {
    metadata: Record<string, any>;
  }) => {
    return source.metadata['loc.pageNumber'] ?? 1;
  };

  const extractSourceFileName = (source: {
    metadata: Record<string, any>;
  }) => {
    return source.metadata.fileName ?? 'Unknown Document';
  };

  const handleSourceClick = (fileName: string, pageNumber: number) => {
    const document = documents.find((doc) => doc.fileName === fileName);
    if (document) {
      setSelectedDocument(document);
      pageNavigationPluginInstance.jumpToPage(pageNumber - 1);
    }
  };

  return (
    <div className="mx-auto flex flex-col no-scrollbar -mt-2">
      <Toggle chatOnlyView={chatOnlyView} setChatOnlyView={setChatOnlyView} />
      <div className="flex justify-between w-full lg:flex-row flex-col sm:space-y-20 lg:space-y-0 p-2">
        {/* Left hand side */}
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js">
          <div
            className={`w-full h-[90vh] flex-col text-white !important ${
              chatOnlyView ? 'hidden' : 'flex'
            }`}
          >
            <div
              className="align-center bg-[#eeeeee] flex p-1"
              style={{
                borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
              }}
            >
              <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
              <select
                value={selectedDocument?.id}
                onChange={(e) =>
                  setSelectedDocument(
                    documents.find((doc) => doc.id === e.target.value) || null
                  )
                }
                className="ml-4 p-2 rounded"
              >
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.fileName}
                  </option>
                ))}
              </select>
            </div>
            {pdfUrl && (
              <Viewer
                fileUrl={pdfUrl}
                plugins={[toolbarPluginInstance, pageNavigationPluginInstance]}
              />
            )}
          </div>
        </Worker>
        {/* Right hand side */}
        <div className="flex flex-col w-full justify-between align-center h-[90vh] no-scrollbar">
          <div
            className={`w-full min-h-min bg-white border flex justify-center items-center no-scrollbar sm:h-[85vh] h-[80vh]
            `}
          >
            <div
              ref={messageListRef}
              className="w-full h-full overflow-y-scroll no-scrollbar rounded-md mt-4"
            >
              {messages.length === 0 && (
                <div className="flex justify-center h-full items-center text-xl">
                  Ask your first question below!
                </div>
              )}
              {messages.map((message, index) => {
                const sources = sourcesForMessages[index] || undefined;
                const isLastMessage =
                  !isLoading && index === messages.length - 1;
                const previousMessages = index !== messages.length - 1;
                return (
                  <div key={`chatMessage-${index}`}>
                    <div
                      className={`p-4 text-black animate ${
                        message.role === 'assistant'
                          ? 'bg-gray-100'
                          : isLoading && index === messages.length - 1
                          ? 'animate-pulse bg-white'
                          : 'bg-white'
                      }`}
                    >
                      <div className="flex">
                        <Image
                          key={index}
                          src={
                            message.role === 'assistant'
                              ? '/bot-icon.png'
                              : userProfilePic
                          }
                          alt="profile image"
                          width={message.role === 'assistant' ? '35' : '33'}
                          height="30"
                          className="mr-4 rounded-sm h-full"
                          priority
                        />
                        <ReactMarkdown 
                          className="prose"
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeRaw, rehypeKatex]}
                          components={{
                            ol: ({ children }) => <ol className="list-decimal ml-6">{children}</ol>,
                            ul: ({ children }) => <ul className="list-disc ml-6">{children}</ul>,
                            h1: ({ children }) => <h1 className="text-2xl font-bold">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-xl font-bold">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-lg font-bold">{children}</h3>,
                            p: ({ children }) => <p className="my-2">{children}</p>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      {/* Display the sources */}
                      {(isLastMessage || previousMessages) && sources && (
                        <div className="flex space-x-4 ml-14 mt-3">
                          {sources
                            .filter((source: any, index: number, self: any) => {
                              const pageNumber =
                                extractSourcePageNumber(source);
                              // Check if the current pageNumber is the first occurrence in the array
                              return (
                                self.findIndex(
                                  (s: any) =>
                                    extractSourcePageNumber(s) === pageNumber,
                                ) === index
                              );
                            })
                            .map((source: any) => (
                              <button
                                key={`${source.metadata.fileName}-${extractSourcePageNumber(source)}`}
                                className="border bg-gray-200 px-3 py-1 hover:bg-gray-100 transition rounded-lg"
                                onClick={() =>
                                  handleSourceClick(
                                    extractSourceFileName(source),
                                    Number(extractSourcePageNumber(source))
                                  )
                                }
                              >
                                {extractSourceFileName(source)} - p. {extractSourcePageNumber(source)}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-center items-center sm:h-[15vh] h-[20vh]">
            <form
              onSubmit={handleSubmitForm}
              className="relative w-full px-4 sm:pt-10 pt-2"
            >
              <textarea
                className="resize-none p-3 pr-10 rounded-md border border-gray-300 bg-white text-black focus:outline-gray-400 w-full"
                disabled={isLoading}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleEnter}
                ref={textAreaRef}
                rows={3}
                autoFocus={false}
                maxLength={512}
                id="userInput"
                name="userInput"
                placeholder={
                  isLoading ? 'Waiting for response...' : 'Ask me anything...'
                }
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute top-[40px] sm:top-[71px] right-6 text-gray-600 bg-transparent py-1 px-2 border-none flex transition duration-300 ease-in-out rounded-sm"
              >
                {isLoading ? (
                  <div className="">
                    <LoadingDots color="#000" style="small" />
                  </div>
                ) : (
                  <svg
                    viewBox="0 0 20 20"
                    className="transform rotate-90 w-6 h-6 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                  </svg>
                )}
              </button>
            </form>
          </div>
          {error && (
            <div className="border border-red-400 rounded-md p-4">
              <p className="text-red-500">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
