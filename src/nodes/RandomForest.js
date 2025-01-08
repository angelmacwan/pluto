import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

// Define initial state for Random Forest node
const getInitialState = () => ({
    n_estimators: 100,       // Number of trees in the forest
    max_depth: null,         // Maximum depth of trees
    min_samples_split: 2,    // Minimum samples required to split
    min_samples_leaf: 1,     // Minimum samples required at leaf node
    criterion: 'gini',       // Split criterion
    bootstrap: true,         // Whether to use bootstrap samples
    imports: 'from sklearn.ensemble import RandomForestClassifier',
    code: `model = RandomForestClassifier(n_estimators = 100,
                    criterion = 'gini',
                    max_depth = 12,
                    min_samples_split = 2,
                    min_samples_leaf = 1,
                    bootstrap = True,
                    random_state = RANDOM_SEED)`,
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
        n_estimators = 100,
        max_depth = null,
        min_samples_split = 2,
        min_samples_leaf = 1,
        criterion = 'gini',
        bootstrap = true,
        imports = 'from sklearn.ensemble import RandomForestClassifier',
        code = `model = RandomForestClassifier(n_estimators = 100,
                            criterion = 'gini',
                            max_depth = 12,
                            min_samples_split = 2,
                            min_samples_leaf = 1,
                            bootstrap = True,
                            random_state = RANDOM_SEED)`,
        updateNodeState = () => { }
    } = data;

    const updateState = (updates) => {
        const newState = {
            ...data,
            ...updates
        }

        newState.code = `model = RandomForestClassifier(n_estimators = ${newState.n_estimators},
                                    criterion = '${newState.criterion}',
                                    max_depth = ${newState.max_depth},
                                    min_samples_split = ${newState.min_samples_split},
                                    min_samples_leaf = ${newState.min_samples_leaf},
                                    bootstrap = ${newState.bootstrap},
                                    random_state = RANDOM_SEED)`

        updateNodeState(newState);
    };

    return (
        <div className='customNode node-type-model'>
            <Handle
                type="target"
                position={Position.Left}
            />

            <div className='node-header'>Random Forest Classifier</div>

            <div className='node-body'>
                <div className="input-group">
                    <label>
                        Number of Trees:
                        <input
                            type="number"
                            value={n_estimators}
                            onChange={(e) => updateState({ n_estimators: parseInt(e.target.value) || 1 })}
                            min="1"
                            style={{ width: '80px' }}
                        />
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Max Depth:
                        <input
                            type="number"
                            value={max_depth === null ? '' : max_depth}
                            onChange={(e) => {
                                const value = e.target.value === '' ? null : parseInt(e.target.value);
                                updateState({ max_depth: value });
                            }}
                            min="1"
                            placeholder="None"
                            style={{ width: '80px' }}
                        />
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Min Samples Split:
                        <input
                            type="number"
                            value={min_samples_split}
                            onChange={(e) => updateState({ min_samples_split: parseInt(e.target.value) || 2 })}
                            min="2"
                            style={{ width: '80px' }}
                        />
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Min Samples Leaf:
                        <input
                            type="number"
                            value={min_samples_leaf}
                            onChange={(e) => updateState({ min_samples_leaf: parseInt(e.target.value) || 1 })}
                            min="1"
                            style={{ width: '80px' }}
                        />
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Criterion:
                        <select
                            value={criterion}
                            onChange={(e) => updateState({ criterion: e.target.value })}
                        >
                            <option value="gini">Gini</option>
                            <option value="entropy">Entropy</option>
                        </select>
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Bootstrap:
                        <input
                            type="checkbox"
                            checked={bootstrap}
                            onChange={(e) => updateState({ bootstrap: e.target.checked })}
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