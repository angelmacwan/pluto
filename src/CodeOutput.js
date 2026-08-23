import React, { memo, useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import './CodeOutput.css';
import "prismjs/themes/prism-tomorrow.css";

import { generateGraphCode } from './graphCodegen';

const CodeOutput = memo(({ data, edges = [] }) => {
    const [finalCode, setFinalCode] = useState("");
    const [codeOutput, setcodeOutput] = useState("");
    const [viewOutput, setViewOutput] = useState(false);
    const [running, setRunning] = useState(false);

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

    const runCode = async () => {
        const current_url = window.location.href;
        if (current_url.includes("angelmacwan.github.io")) {
            alert("THIS FEATURE IS ONLY AVAILABLE ON LOCAL INSTALLATION");
            return;
        }
        setRunning(true);
        try {
            const res = await fetch('/run_code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: finalCode }),
            });

            const response = await res.json();
            setcodeOutput(response.error || response.output || '');
            setViewOutput(true);
        } catch (error) {
            console.error(error);
            setcodeOutput("SOMETHING WENT WRONG");
            setViewOutput(true);
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="code-block-output">
            {/* Toolbar */}
            <div className="code-block-toolbar">
                <span className="code-block-toolbar-title">
                    {viewOutput ? 'Output' : 'Generated Python'}
                </span>

                <button className='code-block-btn' onClick={handleCopy} title="Copy code">
                    Copy
                </button>

                <button
                    className='code-block-btn'
                    onClick={() => setViewOutput(!viewOutput)}
                    title="Toggle output view"
                >
                    {viewOutput ? 'Code' : 'Output'}
                </button>

                {running ? (
                    <span className='code-block-btn-disabled'>Running…</span>
                ) : (
                    <button className='code-block-btn' onClick={runCode} title="Run code">
                        ▶ Run
                    </button>
                )}
            </div>

            {/* Code / Output display */}
            {!viewOutput && (
                <SyntaxHighlighter
                    className="code-block"
                    language="python"
                    style={atomOneDark}
                    showLineNumbers={true}
                    customStyle={{ margin: 0, height: '100%', fontSize: '0.78rem' }}
                >
                    {finalCode}
                </SyntaxHighlighter>
            )}
            {viewOutput && (
                <SyntaxHighlighter
                    className="code-block"
                    language="bash"
                    style={atomOneDark}
                    showLineNumbers={false}
                    customStyle={{ margin: 0, height: '100%', fontSize: '0.78rem' }}
                >
                    {codeOutput || '(no output)'}
                </SyntaxHighlighter>
            )}
        </div>
    );
});

export default CodeOutput;
