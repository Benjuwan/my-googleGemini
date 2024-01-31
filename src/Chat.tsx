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
  flex-grow: 1;
  padding: 20px;
  padding-bottom: calc(100vw/4);
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
  line-height: 1.6;
`;

const buttonStyle = css`
  padding: 10px 20px;
  background-color: #5c6bc0;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &[disabled]{
    cursor: default;
    background-color: #dadada;
    color: #333;
  }

  &:not([disabled]):hover {
    background-color: #3949ab;
  }
`;

const inputAreaStyle = css`
  display: flex;
  justify-content: space-between;
  flex-flow: row wrap;
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
  flex-flow: row wrap;
  gap: 2%;
  width: clamp(320px, calc(100vw/2), 560px);
`

export const Chat = () => {
  /* user の入力 */
  const [input, setInput] = useState<string>("");

  /* user と system(gemini)の会話内容のオブジェクト・配列 State */
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  /* LoadingEl 用 */
  const [loading, setLoading] = useState<boolean>(false);

  /* これまでの会話内容 */
  const [chatShallowHistory, setChatShallowHistory] = useState<ChatMessage[]>([]);
  const conversationUpdata = () => setChatShallowHistory((_prevChatShallowHistory) => [...chatShallowHistory, ...chatHistory]);

  const sendMessage = async () => {
    const userMessage: ChatMessage =
    {
      role: "user",
      content: input // user が入力した内容をセット
    };

    // 画面上の会話履歴を更新
    // const updatedChatHistory = [...chatHistory, userMessage];
    const updatedChatHistory = [userMessage]; // 上記と違って既存の会話内容は不要

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
          // リクエストボディ：リソースの更新や作成に使用、今回 method が POST なので create している。つまり system（gemini）が入力した内容を JSONデータとして設定している
          body: JSON.stringify({
            contents: [{ parts: [{ text: input }] }],
          }),
        }
      );
      // console.log(response);

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
          // console.log(firstCandidate);
          if (
            firstCandidate &&
            firstCandidate.parts &&
            firstCandidate.parts.length > 0
          ) {
            // パーツのテキストを連結してメッセージコンテンツを作成
            botMessageContent = firstCandidate.parts
              .map((part: Part) => {
                // console.log(part, part.text);
                return part.text;
              })
              .join('\n');
          }
        }

        // 生成されたボットのメッセージを作成
        const botMessage = {
          role: 'system',
          content: botMessageContent, // パーツのテキストを連結したメッセージコンテンツをセット
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

  const keyDownGeminiRun = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Shift + Enter キーを押下
    if (event.shiftKey && event.key === 'Enter') {
      if (input.length > 0) {
        sendMessage();
        conversationUpdata();
      }
    }
  }

  return (
    <div className={chatContainerStyle}>
      <div className={chatHistoryStyle}>
        {/* これまでの会話内容 */}
        {chatShallowHistory.length > 0 &&
          <>
            {chatShallowHistory.map((chat, index) => (
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
        {/* gemini が生成する内容 */}
        {loading ? <LoadingEl /> :
          <>
            {/* chatHistory は user と system(gemini)の会話内容のオブジェクト・配列 */}
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
        <form id="runForm" className={formStyle} onSubmit={(formelm: ChangeEvent<HTMLFormElement>) => {
          formelm.preventDefault();
          {
            input.length <= 0 &&
              sendMessage(),
              conversationUpdata()
          }
        }}>
          <p>プロンプト入力後に Shift + Enter キーまたは run ボタンを押下してください</p>
          <textarea cols={30} rows={5}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => keyDownGeminiRun(e)}
            className={inputStyle}
          ></textarea>
          <button onClick={sendMessage} className={buttonStyle} disabled={input.length <= 0}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};