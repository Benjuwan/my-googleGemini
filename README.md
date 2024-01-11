# my-googleGemini
`Google Gemini Pro`が試用期間の間に試した内容と備忘録です。<br />

[Google AI Studio](https://makersuite.google.com/app/prompts/new_freeform)

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