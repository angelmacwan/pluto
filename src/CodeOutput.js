import React, { memo, useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import './CodeOutput.css';
import "prismjs/themes/prism-tomorrow.css";

import { generateGraphCode } from './graphCodegen';

const CodeOutput = memo(({ data, edges = [] }) => {
    const [finalCode, setFinalCode] = useState("");

    useEffect(() => {
        setFinalCode(generateGraphCode(data || [], edges).code);
    }, [data, edges]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(finalCode);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    return (
        <div className="code-block-output">
            {/* Toolbar */}
            <div className="code-block-toolbar">
                <span className="code-block-toolbar-title">
                    Generated Python
                </span>

                <button className='code-block-btn' onClick={handleCopy} title="Copy code">
                    Copy
                </button>
            </div>

            {/* Code display */}
            <SyntaxHighlighter
                className="code-block"
                language="python"
                style={atomOneDark}
                showLineNumbers={true}
                customStyle={{ margin: 0, height: '100%', fontSize: '0.78rem' }}
            >
                {finalCode}
            </SyntaxHighlighter>
        </div>
    );
});

export default CodeOutput;
