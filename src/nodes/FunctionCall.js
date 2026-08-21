import './node.css';
import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

const getInitialState = () => ({
    funcName: 'my_function',
    args: 'x, y',
    resultVar: '',
    imports: '',
    code: 'my_function(x, y)',
});

const buildCode = ({ funcName, args, resultVar }) => {
    const name = funcName || 'my_function';
    const a = args ?? '';
    const call = `${name}(${a})`;
    return resultVar && resultVar.trim() !== '' ? `${resultVar.trim()} = ${call}` : call;
};

export default memo(({ data }) => {
    useEffect(() => {
        if (data.updateNodeState && Object.keys(data).length <= 1) {
            data.updateNodeState(getInitialState());
        }
    }, [data]);

    const {
        funcName = 'my_function',
        args = 'x, y',
        resultVar = '',
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
            <div className="node-header">Function Call</div>
            <div className="node-body">
                <div className="input-group">
                    <label>Function name</label>
                    <input
                        type="text"
                        value={funcName}
                        onChange={(e) => updateState({ funcName: e.target.value })}
                        placeholder="my_function"
                    />
                </div>
                <div className="input-group">
                    <label>Arguments</label>
                    <input
                        type="text"
                        value={args}
                        onChange={(e) => updateState({ args: e.target.value })}
                        placeholder="x, y"
                    />
                </div>
                <div className="input-group">
                    <label>Store result in (optional)</label>
                    <input
                        type="text"
                        value={resultVar}
                        onChange={(e) => updateState({ resultVar: e.target.value })}
                        placeholder="result"
                    />
                </div>
                <p className="node-description">{buildCode({ funcName, args, resultVar })}</p>
            </div>
            <Handle type="source" position={Position.Right} />
        </div>
    );
});

export { getInitialState };
