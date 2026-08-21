import './node.css';
import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

const getInitialState = () => ({
    importStatement: 'import math',
    imports: 'import math',
    code: '',
});

export default memo(({ data }) => {
    useEffect(() => {
        if (data.updateNodeState && Object.keys(data).length <= 1) {
            data.updateNodeState(getInitialState());
        }
    }, [data]);

    const {
        importStatement = 'import math',
        updateNodeState = () => {},
    } = data;

    const updateState = (updates) => {
        const next = { ...data, ...updates };
        next.imports = next.importStatement || '';
        next.code = '';
        updateNodeState(next);
    };

    return (
        <div className="customNode node-type-primitive">
            <Handle type="target" position={Position.Left} />
            <div className="node-header">Import Library</div>
            <div className="node-body">
                <div className="input-group">
                    <label>Import statement</label>
                    <input
                        type="text"
                        value={importStatement}
                        onChange={(e) => updateState({ importStatement: e.target.value })}
                        placeholder="import math"
                    />
                </div>
                <p className="node-description">{importStatement}</p>
            </div>
            <Handle type="source" position={Position.Right} />
        </div>
    );
});

export { getInitialState };
