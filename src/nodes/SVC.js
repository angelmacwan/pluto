import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

// Define initial state for SVC node
const getInitialState = () => ({
    C: 1.0,                    // Regularization parameter
    kernel: 'rbf',             // Kernel type
    degree: 3,                 // Degree for poly kernel
    gamma: 'scale',            // Kernel coefficient
    coef0: 0.0,               // Independent term in poly/sigmoid
    probability: false,        // Enable probability estimates
    tol: 0.001,               // Tolerance for stopping criterion
    max_iter: -1,             // Maximum iterations (-1 for no limit)
    imports: 'from sklearn.svm import SVC',
    code: `model = SVC(C = 1.0, kernel = 'rbf', degree = 3,
    gamma = 'scale', coef0 = 0.0,
    probability = False, tol = 0.001, max_iter = -1)`,
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
        kernel = 'rbf',
        degree = 3,
        gamma = 'scale',
        coef0 = 0.0,
        probability = false,
        tol = 0.001,
        max_iter = -1,
        imports = 'from sklearn.svm import SVC',
        code = `model = SVC(C = 1.0, kernel = 'rbf', degree = 3,
        gamma = 'scale', coef0 = 0.0,
        probability = False, tol = 0.001, max_iter = -1)`,

        updateNodeState = () => { }
    } = data;

    const updateState = (updates) => {
        const newState = {
            ...data,
            ...updates
        }

        newState.code = `model = SVC(C = ${newState.C}, kernel = '${newState.kernel}',
                degree = ${newState.degree}, gamma = '${newState.gamma}',
                coef0 = ${newState.coef0}, probability = ${newState.probability ? "True" : "False"},
                tol = ${newState.tol}, max_iter = ${newState.max_iter})`

        updateNodeState(newState);
    };

    return (
        <div className='customNode node-type-model'>
            <Handle
                type="target"
                position={Position.Left}
            />

            <div className='node-header'>SVC</div>

            <div className='node-body'>
                <div className="input-group">
                    <label>
                        Kernel:
                        <select
                            value={kernel}
                            onChange={(e) => updateState({ kernel: e.target.value })}
                        >
                            <option value="rbf">RBF</option>
                            <option value="linear">Linear</option>
                            <option value="poly">Polynomial</option>
                            <option value="sigmoid">Sigmoid</option>
                        </select>
                    </label>
                </div>

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
                        Gamma:
                        <select
                            value={gamma}
                            onChange={(e) => updateState({ gamma: e.target.value })}
                        >
                            <option value="scale">scale</option>
                            <option value="auto">auto</option>
                        </select>
                    </label>
                </div>

                {kernel === 'poly' && (
                    <div className="input-group">
                        <label>
                            Degree:
                            <input
                                type="number"
                                value={degree}
                                onChange={(e) => updateState({ degree: parseInt(e.target.value) || 1 })}
                                min="1"
                                style={{ width: '80px' }}
                            />
                        </label>
                    </div>
                )}

                {(kernel === 'poly' || kernel === 'sigmoid') && (
                    <div className="input-group">
                        <label>
                            Coef0:
                            <input
                                type="number"
                                value={coef0}
                                onChange={(e) => updateState({ coef0: parseFloat(e.target.value) || 0 })}
                                step="0.1"
                                style={{ width: '80px' }}
                            />
                        </label>
                    </div>
                )}

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
                        Max Iterations:
                        <input
                            type="number"
                            value={max_iter}
                            onChange={(e) => updateState({ max_iter: parseInt(e.target.value) })}
                            min="-1"
                            style={{ width: '80px' }}
                        />
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Enable Probability:
                        <input
                            type="checkbox"
                            checked={probability}
                            onChange={(e) => updateState({ probability: e.target.checked })}
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