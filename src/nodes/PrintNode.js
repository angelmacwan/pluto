import './node.css';
import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

const getInitialState = () => ({
    expression: 'x',
    imports: '',
    code: 'print(x)',
});

export default memo(({ data }) => {
    useEffect(() => {
        if (data.updateNodeState && Object.keys(data).length <= 1) {
            data.updateNodeState(getInitialState());
        }
    }, [data]);

    const {
        expression = 'x',
        updateNodeState = () => {},
    } = data;

    const updateState = (updates) => {
        const next = { ...data, ...updates };
        next.code = `print(${next.expression || 'x'})`;
        next.imports = '';
        updateNodeState(next);
    };

    return (
        <div className="customNode node-type-output">
            <Handle type="target" position={Position.Left} />
            <div className="node-header">Print</div>
            <div className="node-body">
                <div className="input-group">
                    <label>Expression</label>
                    <input
                        type="text"
                        value={expression}
                        onChange={(e) => updateState({ expression: e.target.value })}
                        placeholder="x"
                    />
                </div>
                <p className="node-description">{`print(${expression || 'x'})`}</p>
            </div>
            <Handle type="source" position={Position.Right} />
        </div>
    );
});

export { getInitialState };
