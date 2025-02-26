import { ChangeEvent, useState } from "react";
import { Chat } from "./Chat";
import { ProVision } from "./ProVision";

export const App = () => {
  const [selectApp, setSelectApp] = useState<string>('pro');

  return (
    <>
      <select style={{ 'marginBottom': '2.5em' }} onChange={(selectElm: ChangeEvent<HTMLSelectElement>) => setSelectApp(selectElm.target.value)}>
        <option value="pro">テキスト入力 mode</option>
        <option value="pro-vision">テキストと画像入力 mode</option>
      </select>
      {selectApp === 'pro' && <Chat />}
      {selectApp === 'pro-vision' && <ProVision />}
    </>
  );
}