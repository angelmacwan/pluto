import React, { memo } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import './CodeOutput.css';
import "prismjs/themes/prism-tomorrow.css";

import { generateCode } from './CodeGenerator';

export default memo(({ data, useAi }) => {

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(finalCode);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    data = data.flat(Infinity);
    let code = [];

    for (let i = 0; i < data.length; i++) {
        const node = data[i];
        const nodeCode = generateCode(node);
        code.push(nodeCode);
    }

    let importsOutput = ""
    let codeOutpus = ""
    for (let i = 0; i < code.length; i++) {
        importsOutput += code[i].imports + "\n";
        codeOutpus += code[i].code + "\n";
    }

    importsOutput = importsOutput.trim();
    codeOutpus = codeOutpus.trim();

    const finalCode = useAi ?
        `//THIS CODE IS AI GENERATED\n${importsOutput}\n\n${codeOutpus}` :
        `${importsOutput}\n\n${codeOutpus}`;

    const generateAiCode = () => {
        console.log("generating AI CODE")
    }

    return (
        <div className="code-block-output">
            <div className="code-body">
                <SyntaxHighlighter className="code-block" language="python" style={atomOneDark} showLineNumbers={true}>
                    {finalCode}
                </SyntaxHighlighter>
            </div>
            <button className='code-block-btn' onClick={() => handleCopy()}>COPY</button>

            {(useAi) && (
                <button className='code-block-btn' onClick={() => generateAiCode()}>Generate AI Code</button>
            )}

        </div >
    );
});