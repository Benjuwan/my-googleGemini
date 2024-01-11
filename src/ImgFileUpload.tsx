import { ChangeEvent } from "react";

type propsType = {
    base64Images: string;
    setBase64Images: React.Dispatch<React.SetStateAction<string>>;
}

export const ImgFileUpload = ({ base64Images, setBase64Images }: propsType) => {

    const handleInputFile = (fileElm: HTMLInputElement) => {
        const files = fileElm.files as FileList;

        // FileList のままだと forEach が使えないので配列に変換する
        const fileArray = Array.from(files);

        fileArray.forEach((file) => {
            // ファイルを読み込むために FileReader を利用する
            const reader = new FileReader();

            // ファイルの読み込みが完了したら画像の配列に加える
            reader.onloadend = () => {
                const result = reader.result as string;
                setBase64Images((_prevImages) => result);
            };
            // 画像ファイルを base64 形式で読み込む
            reader.readAsDataURL(file);
        });
    };

    return (
        <>
            <input type="file" accept="image/*" onChange={(fileElm: ChangeEvent<HTMLInputElement>) => handleInputFile(fileElm.currentTarget)} />

            {base64Images &&
                <div style={{ 'width': '50%', 'marginTop': '1em' }}><img src={base64Images} alt="" /></div>
            }
        </>
    )
}