import './node.css';
import React, { memo, useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';

// Define initial state for this node type
const getInitialState = () => ({
    strategy: 'mean',
    missingValues: 'np.nan',
    constantValue: '',
    nNeighbors: 5,
    weights: 'uniform',
    metric: 'nan_euclidean',
    code: `from sklearn.impute import SimpleImputer, KNNImputer
import numpy as np

# Create imputer based on strategy
if strategy == 'knn':
    imputer = KNNImputer(
        n_neighbors=5,
        weights='uniform',
        metric='nan_euclidean'
    )
else:
    imputer = SimpleImputer(
        missing_values=np.nan,
        strategy='mean',
        fill_value=None
    )

# Fit and transform the data
X_imputed = imputer.fit_transform(X)`,
    imports: 'from sklearn.impute import SimpleImputer, KNNImputer\nimport numpy as np'
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
        strategy = 'mean',
        missingValues = 'np.nan',
        constantValue = '',
        nNeighbors = 5,
        weights = 'uniform',
        metric = 'nan_euclidean',
        code = '',
        imports = 'from sklearn.impute import SimpleImputer, KNNImputer\nimport numpy as np',
        updateNodeState = () => { }
    } = data;

    const updateState = (updates) => {
        const newState = {
            ...data,
            ...updates
        };

        // Generate code based on the selected strategy
        newState.imports = 'from sklearn.impute import SimpleImputer, KNNImputer\nimport numpy as np';
        
        if (newState.strategy === 'knn') {
            newState.code = `# Create KNN imputer
imputer = KNNImputer(
    n_neighbors=${newState.nNeighbors},
    weights='${newState.weights}',
    metric='${newState.metric}'
)

# Fit and transform the data
X_imputed = imputer.fit_transform(X)`;
        } else {
            newState.code = `# Create simple imputer
imputer = SimpleImputer(
    missing_values=${newState.missingValues},
    strategy='${newState.strategy}'${newState.strategy === 'constant' ? `,
    fill_value=${newState.constantValue}` : ''}
)

# Fit and transform the data
X_imputed = imputer.fit_transform(X)`;
        }

        updateNodeState(newState);
    };

    const handleStrategyChange = (e) => {
        updateState({ strategy: e.target.value });
    };

    const handleMissingValuesChange = (e) => {
        updateState({ missingValues: e.target.value });
    };

    const handleConstantValueChange = (e) => {
        updateState({ constantValue: e.target.value });
    };

    const handleNNeighborsChange = (e) => {
        updateState({ nNeighbors: parseInt(e.target.value) || 5 });
    };

    const handleWeightsChange = (e) => {
        updateState({ weights: e.target.value });
    };

    const handleMetricChange = (e) => {
        updateState({ metric: e.target.value });
    };

    return (
        <div className="customNode node-type-data-processor">
            <Handle
                type="target"
                position={Position.Left}
            />

            <div className="node-header">Missing Value Imputer</div>

            <div className="node-body">
                <div className="input-group">
                    <label>
                        Strategy:
                        <select
                            value={strategy}
                            onChange={handleStrategyChange}
                        >
                            <option value="mean">Mean</option>
                            <option value="median">Median</option>
                            <option value="most_frequent">Mode</option>
                            <option value="constant">Constant</option>
                            <option value="knn">KNN</option>
                        </select>
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Missing Values:
                        <select
                            value={missingValues}
                            onChange={handleMissingValuesChange}
                        >
                            <option value="np.nan">NaN</option>
                            <option value="pd.NA">pandas.NA</option>
                            <option value="-1">-1</option>
                            <option value="0">0</option>
                        </select>
                    </label>
                </div>

                {strategy === 'constant' && (
                    <div className="input-group">
                        <label>
                            Constant Value:
                            <input
                                type="text"
                                value={constantValue}
                                onChange={handleConstantValueChange}
                                placeholder="Enter constant value"
                            />
                        </label>
                    </div>
                )}

                {strategy === 'knn' && (
                    <>
                        <div className="input-group">
                            <label>
                                Number of Neighbors:
                                <input
                                    type="number"
                                    value={nNeighbors}
                                    onChange={handleNNeighborsChange}
                                    min="1"
                                    style={{ width: '80px' }}
                                />
                            </label>
                        </div>

                        <div className="input-group">
                            <label>
                                Weights:
                                <select
                                    value={weights}
                                    onChange={handleWeightsChange}
                                >
                                    <option value="uniform">Uniform</option>
                                    <option value="distance">Distance</option>
                                </select>
                            </label>
                        </div>

                        <div className="input-group">
                            <label>
                                Metric:
                                <select
                                    value={metric}
                                    onChange={handleMetricChange}
                                >
                                    <option value="nan_euclidean">NaN Euclidean</option>
                                    <option value="euclidean">Euclidean</option>
                                    <option value="manhattan">Manhattan</option>
                                </select>
                            </label>
                        </div>
                    </>
                )}
            </div>

            <Handle
                type="source"
                position={Position.Right}
            />
        </div>
    );
});

export { getInitialState }; 