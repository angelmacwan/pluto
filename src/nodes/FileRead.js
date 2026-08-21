import './node.css';
import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

const getInitialState = () => ({
    resultVar: 'file_content',
    filepath: 'data.txt',
    mode: 'r',
    imports: '',
    code: 'with open("data.txt", "r") as _f:\n    file_content = _f.read()',
});

const buildCode = ({ resultVar, filepath, mode }) => {
    const res = resultVar || 'file_content';
    const path = filepath || 'data.txt';
    const m = mode || 'r';
    return `with open("${path}", "${m}") as _f:\n    ${res} = _f.read()`;
};

export default memo(({ data }) => {
    useEffect(() => {
        if (data.updateNodeState && Object.keys(data).length <= 1) {
            data.updateNodeState(getInitialState());
        }
    }, [data]);

    const {
        resultVar = 'file_content',
        filepath = 'data.txt',
        mode = 'r',
        updateNodeState = () => {},
    } = data;

    const updateState = (updates) => {
        const next = { ...data, ...updates };
        next.code = buildCode(next);
        next.imports = '';
        updateNodeState(next);
    };

    return (
        <div className="customNode node-type-io">
            <Handle type="target" position={Position.Left} />
            <div className="node-header">File Read</div>
            <div className="node-body">
                <div className="input-group">
                    <label>Store in variable</label>
                    <input
                        type="text"
                        value={resultVar}
                        onChange={(e) => updateState({ resultVar: e.target.value })}
                        placeholder="file_content"
                    />
                </div>
                <div className="input-group">
                    <label>File path</label>
                    <input
                        type="text"
                        value={filepath}
                        onChange={(e) => updateState({ filepath: e.target.value })}
                        placeholder="data.txt"
                    />
                </div>
                <div className="input-group">
                    <label>Mode</label>
                    <select value={mode} onChange={(e) => updateState({ mode: e.target.value })}>
                        <option value="r">Read Text ('r')</option>
                        <option value="rb">Read Binary ('rb')</option>
                    </select>
                </div>
                <p className="node-description">{`with open("${filepath}", "${mode}") as _f:`}</p>
            </div>
            <Handle type="source" position={Position.Right} />
        </div>
    );
});

export { getInitialState };
