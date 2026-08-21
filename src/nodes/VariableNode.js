import './node.css';
import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

const getInitialState = () => ({
    varName: 'x',
    varValue: '0',
    varType: 'number',
    imports: '',
    code: 'x = 0',
});

const buildCode = ({ varName, varValue, varType }) => {
    const name = varName || 'x';
    const val = varValue ?? '0';
    if (varType === 'string') return `${name} = "${val}"`;
    if (varType === 'boolean') return `${name} = ${val === 'true' || val === 'True' ? 'True' : 'False'}`;
    return `${name} = ${val}`;
};

export default memo(({ data }) => {
    useEffect(() => {
        if (data.updateNodeState && Object.keys(data).length <= 1) {
            data.updateNodeState(getInitialState());
        }
    }, [data]);

    const {
        varName = 'x',
        varValue = '0',
        varType = 'number',
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
            <div className="node-header">Variable</div>
            <div className="node-body">
                <div className="input-group">
                    <label>Name</label>
                    <input
                        type="text"
                        value={varName}
                        onChange={(e) => updateState({ varName: e.target.value })}
                        placeholder="x"
                    />
                </div>
                <div className="input-group">
                    <label>Type</label>
                    <select value={varType} onChange={(e) => updateState({ varType: e.target.value })}>
                        <option value="number">Number</option>
                        <option value="string">String</option>
                        <option value="boolean">Boolean</option>
                        <option value="raw">Raw / Expression</option>
                    </select>
                </div>
                <div className="input-group">
                    <label>Value</label>
                    <input
                        type="text"
                        value={varValue}
                        onChange={(e) => updateState({ varValue: e.target.value })}
                        placeholder="0"
                    />
                </div>
                <p className="node-description">{buildCode({ varName, varValue, varType })}</p>
            </div>
            <Handle type="source" position={Position.Right} />
        </div>
    );
});

export { getInitialState };
