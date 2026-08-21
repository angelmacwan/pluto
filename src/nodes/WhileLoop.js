import './node.css';
import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

const getInitialState = () => ({
    condition: 'x > 0',
    body: '    x -= 1',
    imports: '',
    code: 'while x > 0:\n    x -= 1',
});

const buildCode = ({ condition, body }) => {
    const cond = condition || 'True';
    const b = body || '    pass';
    return `while ${cond}:\n${b}`;
};

export default memo(({ data }) => {
    useEffect(() => {
        if (data.updateNodeState && Object.keys(data).length <= 1) {
            data.updateNodeState(getInitialState());
        }
    }, [data]);

    const {
        condition = 'x > 0',
        body = '    x -= 1',
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
            <div className="node-header">While Loop</div>
            <div className="node-body">
                <div className="input-group">
                    <label>Condition</label>
                    <input
                        type="text"
                        value={condition}
                        onChange={(e) => updateState({ condition: e.target.value })}
                        placeholder="x > 0"
                    />
                </div>
                <div className="input-group">
                    <label>Body (indented)</label>
                    <textarea
                        value={body}
                        rows={3}
                        onChange={(e) => updateState({ body: e.target.value })}
                        placeholder="    pass"
                    />
                </div>
                <p className="node-description">{`while ${condition}:`}</p>
            </div>
            <Handle type="source" position={Position.Right} />
        </div>
    );
});

export { getInitialState };
