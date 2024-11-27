import React, { memo, useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import './CodeOutput.css';
import "prismjs/themes/prism-tomorrow.css";

import { generateCode } from './CodeGenerator';
import { generateAiCode } from './AiCodeGenerator';

const CodeOutput = memo(({ data, useAi }) => {
    const [finalCode, setFinalCode] = useState("");

    useEffect(() => {
        const generateNormalCode = () => {
            const flatData = data.flat(Infinity);
            const code = flatData.map(node => generateCode(node));

            const importsOutput = code.map(c => c.imports).join('\n');
            const codeOutput = code.map(c => c.code).join('\n');

            return `${importsOutput.trim()}\n\n${codeOutput.trim()}`;
        };

        if (!useAi) {
            setFinalCode(generateNormalCode());
        } else {
            setFinalCode('// AI Generated Code\n');
        }
    }, [data, useAi]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(finalCode);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    const getAiCode = async () => {
        try {
            const generatedCode = await generateAiCode(data);
            setFinalCode('// AI Generated Code\n' + generatedCode.replaceAll("```", "").replace("python", ""));
        } catch (err) {
            console.error('Failed to generate AI code:', err);
        }
    };

    return (
        <div className="code-block-output">
            <div className="code-body">
                <SyntaxHighlighter
                    className="code-block"
                    language="python"
                    style={atomOneDark}
                    showLineNumbers={true}
                >
                    {finalCode}
                </SyntaxHighlighter>
            </div>
            <button className='code-block-btn' onClick={handleCopy}>
                COPY
            </button>

            {useAi && (
                <button className='code-block-btn' onClick={getAiCode}>
                    Generate AI Code
                </button>
            )}
        </div>
    );
});

export default CodeOutput;