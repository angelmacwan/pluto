import './node.css';
import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

const getInitialState = () => ({
    loopVar: 'i',
    iterable: 'range(10)',
    body: '    print(i)',
    imports: '',
    code: 'for i in range(10):\n    print(i)',
});

const buildCode = ({ loopVar, iterable, body }) => {
    const v = loopVar || 'i';
    const it = iterable || 'range(10)';
    const b = body || '    pass';
    return `for ${v} in ${it}:\n${b}`;
};

export default memo(({ data }) => {
    useEffect(() => {
        if (data.updateNodeState && Object.keys(data).length <= 1) {
            data.updateNodeState(getInitialState());
        }
    }, [data]);

    const {
        loopVar = 'i',
        iterable = 'range(10)',
        body = '    print(i)',
        updateNodeState = () => {},
    } = data;

    const updateState = (updates) => {
        const next = { ...data, ...updates };
        next.code = buildCode(next);
        next.imports = '';
        updateNodeState(next);
    };

    return (
        <div className="customNode node-type-control">
            <Handle type="target" position={Position.Left} />
            <div className="node-header">For Loop</div>
            <div className="node-body">
                <div className="input-group">
                    <label>Loop variable</label>
                    <input
                        type="text"
                        value={loopVar}
                        onChange={(e) => updateState({ loopVar: e.target.value })}
                        placeholder="i"
                    />
                </div>
                <div className="input-group">
                    <label>Iterable</label>
                    <input
                        type="text"
                        value={iterable}
                        onChange={(e) => updateState({ iterable: e.target.value })}
                        placeholder="range(10)"
                    />
                </div>
                <div className="input-group">
                    <label>Body (indented)</label>
                    <textarea
                        value={body}
                        rows={3}
                        onChange={(e) => updateState({ body: e.target.value })}
                        placeholder="    print(i)"
                    />
                </div>
                <p className="node-description">{`for ${loopVar} in ${iterable}:`}</p>
            </div>
            <Handle type="source" position={Position.Right} />
        </div>
    );
});

export { getInitialState };
