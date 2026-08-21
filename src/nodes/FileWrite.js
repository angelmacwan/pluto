import './node.css';
import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

const getInitialState = () => ({
    filepath: 'output.txt',
    content: 'result',
    mode: 'w',
    imports: '',
    code: 'with open("output.txt", "w") as _f:\n    _f.write(str(result))',
});

const buildCode = ({ filepath, content, mode }) => {
    const path = filepath || 'output.txt';
    const val = content || '""';
    const m = mode || 'w';
    return `with open("${path}", "${m}") as _f:\n    _f.write(str(${val}))`;
};

export default memo(({ data }) => {
    useEffect(() => {
        if (data.updateNodeState && Object.keys(data).length <= 1) {
            data.updateNodeState(getInitialState());
        }
    }, [data]);

    const {
        filepath = 'output.txt',
        content = 'result',
        mode = 'w',
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
            <div className="node-header">File Write</div>
            <div className="node-body">
                <div className="input-group">
                    <label>File path</label>
                    <input
                        type="text"
                        value={filepath}
                        onChange={(e) => updateState({ filepath: e.target.value })}
                        placeholder="output.txt"
                    />
                </div>
                <div className="input-group">
                    <label>Content / Expression</label>
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => updateState({ content: e.target.value })}
                        placeholder="result"
                    />
                </div>
                <div className="input-group">
                    <label>Mode</label>
                    <select value={mode} onChange={(e) => updateState({ mode: e.target.value })}>
                        <option value="w">Write / Overwrite ('w')</option>
                        <option value="a">Append ('a')</option>
                    </select>
                </div>
                <p className="node-description">{`with open("${filepath}", "${mode}") as _f:`}</p>
            </div>
            <Handle type="source" position={Position.Right} />
        </div>
    );
});

export { getInitialState };
