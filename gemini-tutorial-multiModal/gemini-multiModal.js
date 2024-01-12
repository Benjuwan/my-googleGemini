import { GoogleGenerativeAI } from "@google/generative-ai";

/* 各種 DOM 要素 */
const formElm = document.querySelector('form#runForm'); // 包括する form 要素
formElm.querySelector('#submitBtn').setAttribute('disabled', 'true');

const inputElm = document.querySelector('input[type="text"]'); // プロンプト入力欄
const fileElm = document.querySelector('input[type="file"]'); // プロンプト入力欄
const thubnailElm = document.querySelector('.thubnail'); // 画像 の反映用
const answerElm = document.querySelector('.answer'); // gemini の解答反映用
const geminiLoading = document.querySelector('.geminiLoading') // loading

// Fetch your API_KEY
const API_KEY = "発行したAPI_KEYをここに記述してください";

// Access your API key (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(API_KEY);

// Converts a File object to a GoogleGenerativeAI.Part object.
const fileToGenerativePart = async (file) => {
    const base64EncodedDataPromise = new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
}

const run = async (
    inputValueLength,
    inputValue
) => {
    geminiLoading.classList.add('OnView');
    if (formElm.querySelector('p')) formElm.querySelector('p').remove();
    formElm.insertAdjacentHTML('beforeend', `<p>${inputValue}</p>`);
    if (answerElm.classList.contains('OnView')) {
        answerElm.innerHTML = '';
        answerElm.classList.remove('OnView');
    }

    if (inputValueLength > 0 && fileElm.value.length > 0) {
        // For text-and-images input (multimodal), use the gemini-pro-vision model
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

        const prompt = inputValue;

        const fileInputEl = document.querySelector("input[type=file]");
        const imageParts = await Promise.all(
            [...fileInputEl.files].map(fileToGenerativePart)
        );

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();
        // console.log(text);

        answerElm.insertAdjacentHTML('afterbegin', `<p>${text}</p>`);
        answerElm.classList.add('OnView');
        inputElm.value = '';
        fileElm.value = '';
        geminiLoading.classList.remove('OnView');
    } else {
        geminiLoading.classList.remove('OnView');
        alert('プロンプトの入力または、画像を投稿してください');
    }
}

const uploadImgView = (files) => {
    // FileList のままだと forEach が使えないので配列に変換する
    const fileArray = Array.from(files);

    // 画像アップロードをキャンセルすると表示している画像を削除
    if (files.length === 0) thubnailElm.querySelector('img').remove();

    fileArray.forEach((file) => {
        // ファイルを読み込むために FileReader を利用する
        const reader = new FileReader();

        // ファイルの読み込みが完了したら画像の配列に加える
        reader.onloadend = () => {
            const readerResult = reader.result;
            if (thubnailElm.querySelector('img')) {
                thubnailElm.querySelector('img').remove();
            }
            thubnailElm.insertAdjacentHTML('afterbegin', `<img src=${readerResult} />`);
        };

        // 画像ファイルを base64 形式で読み込む
        reader.readAsDataURL(file);
    });
}

/* ------------- 処理実行イベントハンドラ ------------- */
formElm.addEventListener('submit', (e) => {
    e.preventDefault();
    run(inputElm.value.length, inputElm.value);
});

fileElm.addEventListener('change', (e) => {
    uploadImgView(e.target.files);
});

inputElm.addEventListener('input', (e) => {
    if (e.target.value.length > 0) {
        formElm.querySelector('#submitBtn').removeAttribute('disabled');
    } else {
        formElm.querySelector('#submitBtn').setAttribute('disabled', 'true');
    }
});