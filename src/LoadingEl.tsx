import { memo, useEffect } from "react";
import styled from "styled-components";

export const LoadingEl = memo(() => {
    /* ローディングテキストのアニメーション演出の準備と補助 */
    useEffect(() => {
        const isLoadingEl: HTMLParagraphElement | null = document.querySelector('.isLoading');
        const isLoadingElWords: string[] | undefined = isLoadingEl?.textContent?.split('');
        const loadingWords: string[] | undefined = isLoadingElWords?.map((word, i) => {
            return `<span class="txtFrames" style="animation-delay:${(i + 1) * 0.025}s">${word}</span>`;
        });

        if (
            isLoadingEl !== null &&
            typeof loadingWords !== "undefined"
        ) {
            isLoadingEl.innerHTML = loadingWords?.join('');
        }
    }, []);

    return <LoadingElm className="isLoading">...Google Gemini が回答を生成中</LoadingElm>
});

const LoadingElm = styled.p`
overflow: hidden;
letter-spacing: .25em;

& span {
    display: inline-block;
    transform: translateY(1em);

    &.txtFrames{
        animation: txtFrames .75s infinite ease-in-out;

        @keyframes txtFrames {
            0%{transform:translateY(1em)}
            50%, 100%{transform:translateY(0)}
        }
    }
}
`;