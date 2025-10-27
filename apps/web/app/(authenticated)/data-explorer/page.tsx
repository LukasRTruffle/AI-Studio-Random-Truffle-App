'use client';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { useAgentChat } from '@/hooks/useAgentChat';

/**
 * Data Explorer Page
 *
 * Chat with the Data Science Agent to explore and analyze marketing data.
 */
export default function DataExplorerPage() {
  const [inputMessage, setInputMessage] = useState('');
  const [queryResults, setQueryResults] = useState<unknown[]>([]);
  const [showResults, setShowResults] = useState(false);

  const { conversationHistory, loading, error, sendMessage, clearHistory } =
    useAgentChat('data-science');

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const result = await sendMessage(inputMessage);
    setInputMessage('');

    // If the agent executed a query, show results
    if (result?.data?.toolCalls) {
      const queryTool = result.data.toolCalls.find(
        (tc) => tc.toolName === 'execute_bigquery_query'
      );
      if (queryTool?.result) {
        const resultData = queryTool.result as { rows?: unknown[] };
        if (resultData.rows) {
          setQueryResults(resultData.rows);
          setShowResults(true);
        }
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const exampleQueries = [
    'Show me user growth over the last 30 days',
    'What are the top 10 traffic sources by conversion rate?',
    'List all available tables in the dataset',
    'Estimate the cost of querying all user events from last week',
  ];

  return (
    <div className="flex h-screen">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 border-b bg-white">
          <PageHeader
            title="Data Explorer"
            subtitle="Ask questions about your marketing data in natural language"
          />
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {conversationHistory.length === 0 && (
            <div className="text-center text-gray-500 mt-12">
              <p className="text-lg font-medium">Start exploring your data</p>
              <p className="text-sm mt-2">
                The Data Science Agent can help you query, analyze, and visualize your marketing
                data.
              </p>

              {/* Example Queries */}
              <div className="mt-8 max-w-3xl mx-auto">
                <p className="text-sm font-medium text-gray-700 mb-4">Try these examples:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {exampleQueries.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(query)}
                      className="p-4 text-left bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
                    >
                      <p className="text-sm text-gray-700">{query}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {conversationHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl p-4 rounded-lg ${
                  msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium opacity-70">
                    {msg.role === 'user' ? 'You' : 'Data Science Agent'}
                  </span>
                  <span className="text-xs opacity-50">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-center">
              <div className="animate-pulse text-gray-500">Agent is analyzing...</div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <p className="font-medium">Error:</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask a question about your data..."
                className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                disabled={loading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Ask
              </button>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <button
                onClick={() => {
                  clearHistory();
                  setShowResults(false);
                  setQueryResults([]);
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                Clear conversation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Panel */}
      {showResults && queryResults.length > 0 && (
        <div className="w-1/3 border-l bg-white flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Query Results</h3>
            <button
              onClick={() => setShowResults(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div className="text-sm text-gray-600 mb-2">{queryResults.length} rows</div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(queryResults[0] || {}).map((key) => (
                      <th
                        key={key}
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {queryResults.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row as Record<string, unknown>).map((value, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap"
                        >
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
