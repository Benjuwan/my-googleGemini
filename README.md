# my-googleGemini
`Google Gemini Pro`が試用期間の間に試した内容と備忘録です。<br />

[Google AI Studio](https://makersuite.google.com/app/prompts/new_freeform)

## 概要
- `Gemini Pro`：テキスト入力モード
- `Gemini Pro Vision`：テキストと画像入力モード<br />

上記の2モードを実装しています。

※試用するには[Build with the Gemini API | Google AI for Developers](https://ai.google.dev/)ページで`API_KEY`を発行してください。<br />
別途`.env`ファイルをご用意の上で試用してください。<br />

- `gemini-tutorial-multiModal`ディレクトリ<br />
`gemini-tutorial-multiModal`はバニラJSです。`gemini-tutorial-multiModal/gemini-multiModal.js`に発行した`API_KEY`を直接記述することで「`Gemini Pro Vision`：テキストと画像入力モード」を利用できます。

***

- モードの切り替え
![myGemini-001](https://github.com/Benjuwan/my-googleGemini/assets/90702379/d5bd6903-8806-4a9e-b121-8f14b8d4a07b)

***

- `Gemini Pro`：テキスト入力モード<br />
![myGemini-002](https://github.com/Benjuwan/my-googleGemini/assets/90702379/2e39edef-4c6e-4139-8fc1-6f4e4641032f)

***
上記`gif`画像の文脈に沿った回答

![myGemini-002-ss](https://github.com/Benjuwan/my-googleGemini/assets/90702379/b4679b8f-7cfd-480b-bcbc-75e13c53a30d)

***

- `Gemini Pro Vision`：テキストと画像入力モード
![myGemini-003](https://github.com/Benjuwan/my-googleGemini/assets/90702379/276675cf-e206-4e76-ba7c-2f2d8da08089)

***

## 備忘録
- `Vite`で環境変数を追加する場合は`VITE_ `を付けないと値の取得が不可
- `React`で環境変数を追加する場合は先頭に`REACT_APP_`を付けないと値の取得が不可
- `.env`ファイルは**プロジェクトのルートディレクトリに配置**する
    - `.env`ファイルは`.gitignore`に追加すること（`GitHub`にアップしてはいけない）
- `vite`では環境変数の呼び出しに`process.env`は使用できず、代わりに`import.meta.env`を使用する（参照情報：[vite issue](https://github.com/vitejs/vite/issues/1973)）
    - 使用例：
    ```
    .
    ..
    const response = await fetch(
        `https:/...?key=${import.meta.env.VITE_REACT_APP_GOOGLE_API_KEY}`
    ..
    .
    ```