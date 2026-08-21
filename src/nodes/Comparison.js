import './node.css';
import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

const getInitialState = () => ({
    resultVar: 'is_valid',
    valueA: 'x',
    operator: '==',
    valueB: '10',
    imports: '',
    code: 'is_valid = x == 10',
});

const buildCode = ({ resultVar, valueA, operator, valueB }) => {
    const res = resultVar || 'condition';
    const a = valueA || 'x';
    const op = operator || '==';
    const b = valueB ?? '';

    if (op === 'not') {
        return `${res} = not ${a}`;
    }
    return `${res} = ${a} ${op} ${b}`;
};

export default memo(({ data }) => {
    useEffect(() => {
        if (data.updateNodeState && Object.keys(data).length <= 1) {
            data.updateNodeState(getInitialState());
        }
    }, [data]);

    const {
        resultVar = 'is_valid',
        valueA = 'x',
        operator = '==',
        valueB = '10',
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
            <div className="node-header">Compare / Boolean</div>
            <div className="node-body">
                <div className="input-group">
                    <label>Result variable</label>
                    <input
                        type="text"
                        value={resultVar}
                        onChange={(e) => updateState({ resultVar: e.target.value })}
                        placeholder="is_valid"
                    />
                </div>
                <div className="input-group">
                    <label>Value A</label>
                    <input
                        type="text"
                        value={valueA}
                        onChange={(e) => updateState({ valueA: e.target.value })}
                        placeholder="x"
                    />
                </div>
                <div className="input-group">
                    <label>Operator</label>
                    <select value={operator} onChange={(e) => updateState({ operator: e.target.value })}>
                        <option value="==">== (Equal)</option>
                        <option value="!=">!= (Not equal)</option>
                        <option value="<">&lt; (Less than)</option>
                        <option value="<=">&lt;= (Less than or equal)</option>
                        <option value=">">&gt; (Greater than)</option>
                        <option value=">=">&gt;= (Greater than or equal)</option>
                        <option value="and">and</option>
                        <option value="or">or</option>
                        <option value="not">not (unary on A)</option>
                        <option value="in">in</option>
                        <option value="not in">not in</option>
                        <option value="is">is</option>
                        <option value="is not">is not</option>
                    </select>
                </div>
                {operator !== 'not' && (
                    <div className="input-group">
                        <label>Value B</label>
                        <input
                            type="text"
                            value={valueB}
                            onChange={(e) => updateState({ valueB: e.target.value })}
                            placeholder="10"
                        />
                    </div>
                )}
                <p className="node-description">{buildCode({ resultVar, valueA, operator, valueB })}</p>
            </div>
            <Handle type="source" position={Position.Right} />
        </div>
    );
});

export { getInitialState };
