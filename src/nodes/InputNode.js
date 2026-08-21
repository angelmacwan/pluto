import './node.css';
import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

const getInitialState = () => ({
    resultVar: 'user_input',
    prompt: 'Enter value: ',
    castType: 'str',
    imports: '',
    code: 'user_input = input("Enter value: ")',
});

const buildCode = ({ resultVar, prompt, castType }) => {
    const res = resultVar || 'user_input';
    const p = prompt ?? '';
    const inputCall = `input("${p}")`;
    if (castType === 'int') return `${res} = int(${inputCall})`;
    if (castType === 'float') return `${res} = float(${inputCall})`;
    return `${res} = ${inputCall}`;
};

export default memo(({ data }) => {
    useEffect(() => {
        if (data.updateNodeState && Object.keys(data).length <= 1) {
            data.updateNodeState(getInitialState());
        }
    }, [data]);

    const {
        resultVar = 'user_input',
        prompt = 'Enter value: ',
        castType = 'str',
        updateNodeState = () => {},
    } = data;

    const updateState = (updates) => {
        const next = { ...data, ...updates };
        next.code = buildCode(next);
        next.imports = '';
        updateNodeState(next);
    };

    return (
        <div className="customNode node-type-primitive">
            <Handle type="target" position={Position.Left} />
            <div className="node-header">User Input</div>
            <div className="node-body">
                <div className="input-group">
                    <label>Store in variable</label>
                    <input
                        type="text"
                        value={resultVar}
                        onChange={(e) => updateState({ resultVar: e.target.value })}
                        placeholder="user_input"
                    />
                </div>
                <div className="input-group">
                    <label>Prompt text</label>
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => updateState({ prompt: e.target.value })}
                        placeholder="Enter value: "
                    />
                </div>
                <div className="input-group">
                    <label>Convert Type</label>
                    <select value={castType} onChange={(e) => updateState({ castType: e.target.value })}>
                        <option value="str">String (str)</option>
                        <option value="int">Integer (int)</option>
                        <option value="float">Float (float)</option>
                    </select>
                </div>
                <p className="node-description">{buildCode({ resultVar, prompt, castType })}</p>
            </div>
            <Handle type="source" position={Position.Right} />
        </div>
    );
});

export { getInitialState };
