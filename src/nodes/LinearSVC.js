import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

// Define initial state for Linear SVC node
const getInitialState = () => ({
    C: 1.0,                    // Regularization parameter
    max_iter: 1000,            // Maximum number of iterations
    tol: 0.0001,              // Tolerance for stopping criterion
    dual: true,                // Dual or primal formulation
    loss: 'squared_hinge',     // Loss function
    penalty: 'l2',             // Penalty (regularization) type
    imports: 'from sklearn.svm import LinearSVC',
    code: `model = LinearSVC(C = 1.0, max_iter = 1000,
    tol = 0.0001, dual = True, loss = 'squared_hinge', penalty = 'l2')`
});

export default memo(({ data }) => {
    // Initialize state when component mounts if it's empty
    useEffect(() => {
        if (data.updateNodeState && Object.keys(data).length <= 1) {
            data.updateNodeState(getInitialState());
        }
    }, [data]);

    // Destructure values from data, falling back to initial state values
    const {
        C = 1.0,
        max_iter = 1000,
        tol = 0.0001,
        dual = true,
        loss = 'squared_hinge',
        penalty = 'l2',
        imports = 'from sklearn.svm import LinearSVC',
        code = `model = LinearSVC(C = 1.0, max_iter = 1000,
    tol = 0.0001, dual = True, loss = 'squared_hinge', penalty = 'l2')`,

        updateNodeState = () => { }
    } = data;

    const updateState = (updates) => {
        const newState = {
            ...data,
            ...updates
        };
        newState.code = `model = LinearSVC(C = ${newState.C}, max_iter = ${newState.max_iter},
                            tol = ${newState.tol}, dual = ${newState.dual},
                            loss = '${newState.loss}', penalty = '${newState.penalty}')`
        updateNodeState(newState);
    };

    return (
        <div className='customNode node-type-model'>
            <Handle
                type="target"
                position={Position.Left}
            />

            <div className='node-header'>Linear SVC</div>

            <div className='node-body'>
                <div className="input-group">
                    <label>
                        Regularization (C):
                        <input
                            type="number"
                            value={C}
                            onChange={(e) => updateState({ C: parseFloat(e.target.value) || 0.0001 })}
                            min="0.0001"
                            step="0.1"
                            style={{ width: '80px' }}
                        />
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Max Iterations:
                        <input
                            type="number"
                            value={max_iter}
                            onChange={(e) => updateState({ max_iter: parseInt(e.target.value) || 1 })}
                            min="1"
                            style={{ width: '80px' }}
                        />
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Tolerance:
                        <input
                            type="number"
                            value={tol}
                            onChange={(e) => updateState({ tol: parseFloat(e.target.value) || 0.0001 })}
                            min="0.0000001"
                            step="0.0001"
                            style={{ width: '80px' }}
                        />
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Penalty:
                        <select
                            value={penalty}
                            onChange={(e) => updateState({ penalty: e.target.value })}
                        >
                            <option value="l2">L2</option>
                            <option value="l1">L1</option>
                        </select>
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Loss:
                        <select
                            value={loss}
                            onChange={(e) => updateState({ loss: e.target.value })}
                        >
                            <option value="squared_hinge">Squared Hinge</option>
                            <option value="hinge">Hinge</option>
                        </select>
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Dual:
                        <input
                            type="checkbox"
                            checked={dual}
                            onChange={(e) => updateState({ dual: e.target.checked })}
                        />
                    </label>
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Right}
            />
        </div>
    );
});

export { getInitialState };