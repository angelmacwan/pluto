import './node.css';
import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

const getInitialState = () => ({
    resultVar: 'result',
    operandA: 'a',
    operator: '+',
    operandB: 'b',
    imports: '',
    code: 'result = a + b',
});

const buildCode = ({ resultVar, operandA, operator, operandB }) => {
    const res = resultVar || 'result';
    const a = operandA || '0';
    const op = operator || '+';
    const b = operandB || '0';
    return `${res} = ${a} ${op} ${b}`;
};

export default memo(({ data }) => {
    useEffect(() => {
        if (data.updateNodeState && Object.keys(data).length <= 1) {
            data.updateNodeState(getInitialState());
        }
    }, [data]);

    const {
        resultVar = 'result',
        operandA = 'a',
        operator = '+',
        operandB = 'b',
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
            <div className="node-header">Math / Operation</div>
            <div className="node-body">
                <div className="input-group">
                    <label>Result variable</label>
                    <input
                        type="text"
                        value={resultVar}
                        onChange={(e) => updateState({ resultVar: e.target.value })}
                        placeholder="result"
                    />
                </div>
                <div className="input-group">
                    <label>Operand A</label>
                    <input
                        type="text"
                        value={operandA}
                        onChange={(e) => updateState({ operandA: e.target.value })}
                        placeholder="a"
                    />
                </div>
                <div className="input-group">
                    <label>Operator</label>
                    <select value={operator} onChange={(e) => updateState({ operator: e.target.value })}>
                        <option value="+">+ (Add / Concat)</option>
                        <option value="-">- (Subtract)</option>
                        <option value="*">* (Multiply)</option>
                        <option value="/">/ (Divide)</option>
                        <option value="//">{'// (Integer Divide)'}</option>
                        <option value="%">% (Modulo)</option>
                        <option value="**">** (Power)</option>
                    </select>
                </div>
                <div className="input-group">
                    <label>Operand B</label>
                    <input
                        type="text"
                        value={operandB}
                        onChange={(e) => updateState({ operandB: e.target.value })}
                        placeholder="b"
                    />
                </div>
                <p className="node-description">{buildCode({ resultVar, operandA, operator, operandB })}</p>
            </div>
            <Handle type="source" position={Position.Right} />
        </div>
    );
});

export { getInitialState };
