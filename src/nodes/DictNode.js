import './node.css';
import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

const getInitialState = () => ({
    dictName: 'my_dict',
    entries: '{"key1": "value1", "key2": 42}',
    imports: '',
    code: 'my_dict = {"key1": "value1", "key2": 42}',
});

const buildCode = ({ dictName, entries }) => {
    const name = dictName || 'my_dict';
    const val = entries || '{}';
    return `${name} = ${val}`;
};

export default memo(({ data }) => {
    useEffect(() => {
        if (data.updateNodeState && Object.keys(data).length <= 1) {
            data.updateNodeState(getInitialState());
        }
    }, [data]);

    const {
        dictName = 'my_dict',
        entries = '{"key1": "value1", "key2": 42}',
        updateNodeState = () => {},
    } = data;

    const updateState = (updates) => {
        const next = { ...data, ...updates };
        next.code = buildCode(next);
        next.imports = '';
        updateNodeState(next);
    };

    return (
        <div className="customNode node-type-variable">
            <Handle type="target" position={Position.Left} />
            <div className="node-header">Dictionary</div>
            <div className="node-body">
                <div className="input-group">
                    <label>Variable name</label>
                    <input
                        type="text"
                        value={dictName}
                        onChange={(e) => updateState({ dictName: e.target.value })}
                        placeholder="my_dict"
                    />
                </div>
                <div className="input-group">
                    <label>Dict expression / Key-Values</label>
                    <textarea
                        value={entries}
                        rows={3}
                        onChange={(e) => updateState({ entries: e.target.value })}
                        placeholder='{"key": "val"}'
                    />
                </div>
                <p className="node-description">{buildCode({ dictName, entries })}</p>
            </div>
            <Handle type="source" position={Position.Right} />
        </div>
    );
});

export { getInitialState };
