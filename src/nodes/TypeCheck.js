import './node.css';
import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

const getInitialState = () => ({
    resultVar: 'is_type',
    value: 'x',
    expectedType: 'int',
    imports: '',
    code: 'is_type = isinstance(x, int)',
});

const buildCode = ({ resultVar, value, expectedType }) => {
    const res = resultVar || 'is_type';
    const v = value || 'x';
    const t = expectedType || 'int';
    const typeMap = {
        int: 'int',
        float: 'float',
        str: 'str',
        bool: 'bool',
        list: 'list',
        dict: 'dict',
        tuple: 'tuple',
        set: 'set',
        bytes: 'bytes',
        NoneType: 'type(None)',
    };
    const pyType = typeMap[t] || t;
    return `${res} = isinstance(${v}, ${pyType})`;
};

export default memo(({ data }) => {
    useEffect(() => {
        if (data.updateNodeState && Object.keys(data).length <= 1) {
            data.updateNodeState(getInitialState());
        }
    }, [data]);

    const {
        resultVar = 'is_type',
        value = 'x',
        expectedType = 'int',
        updateNodeState = () => {},
    } = data;

    const updateState = (updates) => {
        const next = { ...data, ...updates };
        next.code = buildCode(next);
        next.imports = '';
        updateNodeState(next);
    };

    return (
        <div className="customNode node-type-primitive">
            <Handle type="target" position={Position.Left} />
            <div className="node-header">Type Check</div>
            <div className="node-body">
                <div className="input-group">
                    <label>Result variable</label>
                    <input
                        type="text"
                        value={resultVar}
                        onChange={(e) => updateState({ resultVar: e.target.value })}
                        placeholder="is_type"
                    />
                </div>
                <div className="input-group">
                    <label>Value / Expression</label>
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => updateState({ value: e.target.value })}
                        placeholder="x"
                    />
                </div>
                <div className="input-group">
                    <label>Expected Type</label>
                    <select value={expectedType} onChange={(e) => updateState({ expectedType: e.target.value })}>
                        <option value="int">int</option>
                        <option value="float">float</option>
                        <option value="str">str</option>
                        <option value="bool">bool</option>
                        <option value="list">list</option>
                        <option value="dict">dict</option>
                        <option value="tuple">tuple</option>
                        <option value="set">set</option>
                        <option value="NoneType">NoneType</option>
                    </select>
                </div>
                <p className="node-description">{buildCode({ resultVar, value, expectedType })}</p>
            </div>
            <Handle type="source" position={Position.Right} />
        </div>
    );
});

export { getInitialState };
