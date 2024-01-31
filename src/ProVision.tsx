import { ChangeEvent, useState } from "react";
import styled from "styled-components";
import { GoogleGenerativeAI, Part } from "@google/generative-ai"; // npm i google/generative-ai
import { LoadingEl } from "./LoadingEl";

export const ProVision = () => {
    const [input, setInput] = useState<string>(''); // 入力欄

    const [geminiAnswer, setGeminiAnswer] = useState<string>(''); // gemini の回答

    const [file, setFile] = useState<FileList | null>(null); // input[type="file"] のデータ
    const fileAccept: string[] = ['image/png', 'image/jpeg', 'image/jpg']; // input[type="file"] で指定可能な mineType

    const [base64ImageStr, setBase64ImageStr] = useState<string | ArrayBuffer | null>(null); // input[type="file"] でアップした画像のバイナリデータ管理用

    const [geminiLoading, setGeminiLoading] = useState<boolean>(false); // ローディング

    // Fetch your API_KEY
    const API_KEY: string = import.meta.env.VITE_REACT_APP_GOOGLE_API_KEY;

    // Access your API key (see "Set up your API key" above)
    const genAI = new GoogleGenerativeAI(API_KEY);

    // Converts a File object to a GoogleGenerativeAI.Part object.
    const fileToGenerativePart = async (file: Blob) => {
        // Blob：バイナリデータを扱うためのオブジェクトを生成する
        const base64EncodedDataPromise: Promise<string | ArrayBuffer | null> = new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const readerResult: string | ArrayBuffer | null = reader.result;
                /* --------- ここから Chat=GPT を頼った部分 --------- */
                if (typeof readerResult === 'string') {
                    // もし readerResult が文字列型（Base64 エンコードされたデータ）なら Base64 データを分割して、resolve に渡す
                    resolve(readerResult.split(',')[1]);
                } else if (readerResult instanceof ArrayBuffer) {
                    // もし readerResult が ArrayBuffer 型（バイナリデータ）なら Uint8Array に変換してから Blob を作成
                    const arrayBufferView = new Uint8Array(readerResult); // Uint8Array：型付き配列で、8 ビット符号なし整数値の配列のコンストラクター
                    const blob = new Blob([arrayBufferView], { type: file.type });

                    // Blob を URL に変換して、resolve に渡す
                    const urlCreator = window.URL || window.webkitURL; // window.URL または window.webkitURL は、ブラウザ環境で Blob を URL に変換するための API を提供する
                    const imageUrl = urlCreator.createObjectURL(blob); // createObjectURL：Blob オブジェクトに一意の URL を割り当てる
                    resolve(imageUrl);
                }
                /* --------- ここまで Chat=GPT を頼った部分 --------- */
            };
            reader.readAsDataURL(file);
        });
        return {
            inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
        };
    }

    const run = async () => {
        setGeminiLoading(true);
        setGeminiAnswer((_prevGeminiAnswer) => '');

        if (file !== null && file.length > 0) {
            // For text-and-images input (multimodal), use the gemini-pro-vision model
            const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

            const prompt: string = input;

            const imageParts = await Promise.all(
                Array.from(file).map((fileElm) => fileToGenerativePart(fileElm))
            );

            const result = await model.generateContent([prompt, ...imageParts] as string | Part[]); // 型アサーション：型推論の上書きで対応
            const response = result.response;
            const text = response.text();
            // console.log(text);

            setGeminiAnswer((_prevGeminiAnswer) => text);
            setInput((_prevInput) => '');
            setGeminiLoading(false);
        } else {
            setGeminiLoading(false);
            setInput((_prevInput) => '');
            alert('画像を投稿して下さい');
        }
    }

    const uploadImgView = (fileElm: HTMLInputElement) => {
        setGeminiAnswer((_prevGeminiAnswer) => '');
        const files = fileElm.files as FileList;

        // 画像アップロードの取り消しを行った場合は画像を画面から削除
        if (files.length === 0) setBase64ImageStr((_prevImageStr) => null);

        // FileList のままだと forEach が使えないので配列に変換する
        const fileArray = Array.from(files);

        fileArray.forEach((file) => {
            // ファイルを読み込むために FileReader を利用する
            const reader = new FileReader();

            // ファイルの読み込みが完了したら画像の配列に加える
            reader.onloadend = () => {
                const result = reader.result as string;
                setBase64ImageStr((_prevImageStr) => result);
            };

            // 画像ファイルを base64 形式で読み込む
            reader.readAsDataURL(file);
        });
    };

    const keyDownGeminiRun = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Shift + Enter キーを押下
        if (event.shiftKey && event.key === 'Enter') {
            if (input.length > 0) run();
        }
    }

    return (
        <ProVisionSection>
            <form id="runForm" onSubmit={(formElm: ChangeEvent<HTMLFormElement>) => {
                formElm.preventDefault();
                if (input.length > 0) run();
            }}>
                <p>プロンプト入力後に Shift + Enter キーまたは run ボタンを押下してください</p>
                <textarea
                    value={input}
                    onInput={(inputElm: ChangeEvent<HTMLTextAreaElement>) => setInput((_prevInputElm) => inputElm.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => keyDownGeminiRun(e)}
                    cols={30}
                    rows={5}
                ></textarea>
                <button id="submitBtn" disabled={input.length <= 0}>run</button>
                <input
                    type="file"
                    accept={`${[...fileAccept]}`}
                    onChange={(fileElm: ChangeEvent<HTMLInputElement>) => {
                        setFile(fileElm.target.files);
                        uploadImgView(fileElm.currentTarget);
                    }}
                />
                {input.length > 0 && <p>{input}</p>}
                {base64ImageStr && <img src={base64ImageStr as string} />}
            </form>
            {geminiLoading ?
                <LoadingEl /> :
                <div className="answer">
                    {
                        (input.length <= 0 && !base64ImageStr) ?
                            <p>画像アップ及びプロンプトを入力してください</p> : geminiAnswer
                    }
                </div>
            }
        </ProVisionSection>
    );
}

const ProVisionSection = styled.section`
overflow: hidden;
width: clamp(320px, 100%, 960px);
margin: auto;

    & #runForm {
    margin-bottom: 1em;
    padding: 1em;
    background-color: #e9e9e9;
    border-radius: 8px;
    line-height: 2;
    display: flex;
    flex-flow: row wrap;
    gap: 1em;

    & p {
        width: 100%;
        margin: 0;
    }

    & textarea {
        line-height: 1.6;
    }

    & button {
        appearance: none;
        border: 1px solid transparent;
        background-color: orange;
        color: #fff;
        border-radius: 4px;
        padding: .25em 1em;

        &[disabled] {
            background-color: #b3b3b3;
            color: #333;
        }
    }
}

& .answer {
    line-height: 1.8;
    padding: 1em;
    background-color: #b3b3b3;
    border-radius: 8px;
}

@media screen and (min-width:1025px) {
    display: flex;
    gap: 2%;
    align-items: flex-start;

    & #runForm {
        width: 50%;
        margin-bottom: 0;
    }

    & .answer{
        width: 50%;
    }
}
`;