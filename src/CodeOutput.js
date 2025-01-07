import React, { memo, useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import './CodeOutput.css';
import "prismjs/themes/prism-tomorrow.css";

import { generateAiCode } from './AiCodeGenerator';

const CodeOutput = memo(({ data, useAi }) => {
    const [finalCode, setFinalCode] = useState("");
    const [codeOutput, setcodeOutput] = useState("");
    const [buttonIsDisabled, setbuttonIsDisabled] = useState(false);
    const [viewOutput, setViewOutput] = useState(false);

    useEffect(() => {
        const generateNormalCode = () => {

            function onlyUnique(value, index, self) {
                return self.indexOf(value) === index;
            }


            const flatData = data.flat(Infinity);

            let code = [];
            let imports = []
            for (let node of flatData) {
                code.push(node.data.code);
                imports.push(node.data.imports);
            }

            const importsOutput = imports.filter(x => x !== '').filter(onlyUnique).join('\n');
            const codeOutput = code.join('\n\n');

            return `${importsOutput.trim()}\n\n${codeOutput.trim()}`;
        };

        if (!useAi) {
            setFinalCode(generateNormalCode());
        } else {
            setFinalCode('# AI Generated Code');
        }
    }, [data, useAi]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(finalCode);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    const getAiCode = async (data) => {
        setbuttonIsDisabled(true)
        try {
            const generatedCode = await generateAiCode(data);
            setFinalCode('# AI Generated Code\n' + generatedCode.replaceAll("```", "").replace("python", ""));
            setbuttonIsDisabled(false)
        } catch (err) {
            console.error('Failed to generate AI code:', err);
            setbuttonIsDisabled(false)
        }
    };

    const runCode = async () => {
        const current_url = window.location.href;
        if (current_url.includes("angelmacwan.github.io")) {
            alert("THIS FEATURE IS ONLY AVAILABLE ON LOCAL INSTALLATION");
            return;
        }
        try {
            const res = await fetch('http://127.0.0.1:5000/run_code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: finalCode }),
            });

            const response = await res.json();

            if (response.error) {
                setcodeOutput(response.error);
                return;
            }

            setcodeOutput(response.output);
        } catch (error) {
            console.error(error);
            setcodeOutput("SOMETHING WENT WRONG");
        }
    }

    return (
        <div className="code-block-output">
            <div className="code-body">
                {buttonIsDisabled && (
                    <div className="code-loader"></div>
                )}

                {!viewOutput && (
                    <SyntaxHighlighter
                        className="code-block"
                        language="python"
                        style={atomOneDark}
                        showLineNumbers={true}
                    >
                        {finalCode}
                    </SyntaxHighlighter>
                )}
                {viewOutput && (
                    <div className="code-block">
                        <SyntaxHighlighter
                            className="code-block"
                            language="bash"
                            style={atomOneDark}
                            showLineNumbers={true}
                        >
                            {codeOutput}
                        </SyntaxHighlighter>
                    </div>
                )}

            </div>

            {/* BUTTONS */}

            <button className='code-block-btn' onClick={handleCopy}>
                Copy
            </button>

            <button className='code-block-btn' onClick={() => setViewOutput(!viewOutput)}>
                View Output
            </button>

            <button className='code-block-btn' onClick={runCode}>
                Run
            </button>

            {useAi && (
                <button
                    disabled={buttonIsDisabled}
                    className={buttonIsDisabled ? 'code-block-btn-disabled' : 'code-block-btn'}
                    onClick={() => getAiCode(data)}>
                    Generate AI Code
                </button>
            )}
        </div>
    );
});

export default CodeOutput;