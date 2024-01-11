import { ChangeEvent, useState } from "react";
import { css } from "@emotion/css";
import ReactMarkdown from "react-markdown";
import { LoadingEl } from "./LoadingEl";

type ChatMessage = {
  role: string;
  content: string;
}

type Part = {
  text: string;
}

const chatContainerStyle = css`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
`;

const chatHistoryStyle = css`
  overflow-y: auto;
  flex-grow: 1;
  padding: 20px;
  margin-bottom: 60px;
`;

const userMessageStyle = css`
  margin-bottom: 10px;
  padding: 10px;
  background-color: #e1f5fe;
  border-radius: 10px;
  max-width: 70%;
  align-self: flex-end;
`;

const botMessageStyle = css`
  margin-bottom: 10px;
  padding: 10px;
  background-color: #ede7f6;
  border-radius: 10px;
  max-width: 70%;
  align-self: flex-start;
`;

const inputStyle = css`
  flex: 1;
  padding: 10px 15px;
  font-size: 16px;
  border: 2px solid #dedede;
  border-radius: 4px;
  margin-right: 10px;
`;

const buttonStyle = css`
  padding: 10px 20px;
  background-color: #5c6bc0;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #3949ab;
  }
`;

const inputAreaStyle = css`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: #fafafa;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  box-shadow: 0 -1px 10px rgba(0, 0, 0, 0.1);
`;

const formStyle = css`
  display: flex;
  gap: 2%;
  flex-flow: row wrap;
  width: clamp(320px, calc(100vw/2), 560px);
`

export const Chat = () => {
  const [input, setInput] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const sendMessage = async () => {
    const userMessage: ChatMessage = { role: "user", content: input };
    // 画面上の会話履歴を更新
    const updatedChatHistory = [...chatHistory, userMessage];

    try {
      setLoading(true);

      // リクエストを送信し、レスポンスを取得
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_REACT_APP_GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: input }] }],
          }),
        }
      );

      if (!response.ok) {
        // エラーハンドリング
        console.error(`HTTPエラー！ ステータスコード: ${response.status}`);
      } else {
        // レスポンスのJSONデータを取得
        const botResponse = await response.json();
        // console.log(botResponse);

        // ボットのメッセージコンテンツを初期化
        let botMessageContent = "";

        // ボットの応答からメッセージを生成
        if (
          botResponse &&
          botResponse.candidates &&
          botResponse.candidates.length > 0
        ) {
          const firstCandidate = botResponse.candidates[0].content;
          if (
            firstCandidate &&
            firstCandidate.parts &&
            firstCandidate.parts.length > 0
          ) {
            // パーツのテキストを連結してメッセージコンテンツを作成
            botMessageContent = firstCandidate.parts
              .map((part: Part) => part.text)
              .join('\n');
          }
        }

        // 生成されたボットのメッセージを作成
        const botMessage = {
          role: 'system',
          content: botMessageContent,
        };

        // 会話履歴を更新（ユーザーとボットのメッセージを含む）
        setChatHistory([...updatedChatHistory, botMessage]);
        setLoading(false);
      }
    } catch (error) {
      // エラーハンドリング
      console.error('Google API error:', error);
    }

    // 入力をクリア
    setInput("");
  };

  const renderChatMessage = (message: ChatMessage) => {
    if (message.role === "system") {
      // マークダウン形式のメッセージをHTMLに変換して表示
      return <ReactMarkdown>{message.content}</ReactMarkdown>;
    }
    return <div>{message.content}</div>; // 通常のテキストメッセージ
  };

  return (
    <div className={chatContainerStyle}>
      <div className={chatHistoryStyle}>
        {loading ? <LoadingEl /> :
          <>
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={
                  chat.role === "user" ? userMessageStyle : botMessageStyle
                }
              >
                {renderChatMessage(chat)}
              </div>
            ))}
          </>
        }
      </div>
      <div className={inputAreaStyle}>
        <form className={formStyle} onSubmit={(formelm: ChangeEvent<HTMLFormElement>) => {
          formelm.preventDefault();
          sendMessage();
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={inputStyle}
          />
          <button onClick={sendMessage} className={buttonStyle}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};