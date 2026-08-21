import './node.css';
import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

const getInitialState = () => ({
    funcName: 'my_function',
    params: 'x, y',
    body: '    return x + y',
    imports: '',
    code: 'def my_function(x, y):\n    return x + y',
});

const buildCode = ({ funcName, params, body }) => {
    const name = funcName || 'my_function';
    const p = params ?? '';
    const b = body || '    pass';
    return `def ${name}(${p}):\n${b}`;
};

export default memo(({ data }) => {
    useEffect(() => {
        if (data.updateNodeState && Object.keys(data).length <= 1) {
            data.updateNodeState(getInitialState());
        }
    }, [data]);

    const {
        funcName = 'my_function',
        params = 'x, y',
        body = '    return x + y',
        updateNodeState = () => {},
    } = data;

    const updateState = (updates) => {
        const next = { ...data, ...updates };
        next.code = buildCode(next);
        next.imports = '';
        updateNodeState(next);
    };

    return (
        <div className="customNode node-type-function">
            <Handle type="target" position={Position.Left} />
            <div className="node-header">Function Def</div>
            <div className="node-body">
                <div className="input-group">
                    <label>Name</label>
                    <input
                        type="text"
                        value={funcName}
                        onChange={(e) => updateState({ funcName: e.target.value })}
                        placeholder="my_function"
                    />
                </div>
                <div className="input-group">
                    <label>Parameters</label>
                    <input
                        type="text"
                        value={params}
                        onChange={(e) => updateState({ params: e.target.value })}
                        placeholder="x, y"
                    />
                </div>
                <div className="input-group">
                    <label>Body (indented)</label>
                    <textarea
                        value={body}
                        rows={4}
                        onChange={(e) => updateState({ body: e.target.value })}
                        placeholder="    return x + y"
                    />
                </div>
                <p className="node-description">{`def ${funcName}(${params}):`}</p>
            </div>
            <Handle type="source" position={Position.Right} />
        </div>
    );
});

export { getInitialState };
