import './node.css';
import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

const getInitialState = () => ({
    condition: 'x > 0',
    body: '    pass',
    elseBody: '',
    imports: '',
    code: 'if x > 0:\n    pass',
});

const buildCode = ({ condition, body, elseBody }) => {
    const cond = condition || 'True';
    const b = body || '    pass';
    let code = `if ${cond}:\n${b}`;
    if (elseBody && elseBody.trim() !== '') {
        code += `\nelse:\n${elseBody}`;
    }
    return code;
};

export default memo(({ data }) => {
    useEffect(() => {
        if (data.updateNodeState && Object.keys(data).length <= 1) {
            data.updateNodeState(getInitialState());
        }
    }, [data]);

    const {
        condition = 'x > 0',
        body = '    pass',
        elseBody = '',
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
            <div className="node-header">If / Else</div>
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
                <div className="input-group">
                    <label>Else body (optional)</label>
                    <textarea
                        value={elseBody}
                        rows={2}
                        onChange={(e) => updateState({ elseBody: e.target.value })}
                        placeholder="    pass"
                    />
                </div>
            </div>
            <Handle type="source" position={Position.Right} />
        </div>
    );
});

export { getInitialState };
