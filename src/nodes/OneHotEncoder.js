import './node.css';
import React, { memo, useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';

// Define initial state for this node type
const getInitialState = () => ({
    columns: '',
    dropFirst: false,
    sparse: false,
    handleUnknown: 'error',
    code: `from sklearn.preprocessing import OneHotEncoder
import pandas as pd

# Create encoder
encoder = OneHotEncoder(
    drop='first' if False else None,
    sparse=False,
    handle_unknown='error'
)

# Fit and transform the data
X_encoded = encoder.fit_transform(X[[]])

# Convert to DataFrame if not sparse
if not False:
    X_encoded = pd.DataFrame(
        X_encoded,
        columns=encoder.get_feature_names_out([[]])
    )

# Drop original columns and concatenate with encoded ones
X = pd.concat([
    X.drop(columns=[[]]),
    X_encoded
], axis=1)`,
    imports: 'from sklearn.preprocessing import OneHotEncoder\nimport pandas as pd'
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
        columns = '',
        dropFirst = false,
        sparse = false,
        handleUnknown = 'error',
        code = '',
        imports = 'from sklearn.preprocessing import OneHotEncoder\nimport pandas as pd',
        updateNodeState = () => { }
    } = data;

    const updateState = (updates) => {
        const newState = {
            ...data,
            ...updates
        };

        // Generate code using the updated values
        newState.imports = 'from sklearn.preprocessing import OneHotEncoder\nimport pandas as pd';
        newState.code = `# Create encoder
encoder = OneHotEncoder(
    drop='first' if ${newState.dropFirst} else None,
    sparse=${newState.sparse},
    handle_unknown='${newState.handleUnknown}'
)

# Fit and transform the data
X_encoded = encoder.fit_transform(X[${newState.columns ? `[${newState.columns}]` : ''}])

# Convert to DataFrame if not sparse
if not ${newState.sparse}:
    X_encoded = pd.DataFrame(
        X_encoded,
        columns=encoder.get_feature_names_out(${newState.columns ? `[${newState.columns}]` : ''})
    )

# Drop original columns and concatenate with encoded ones
X = pd.concat([
    X.drop(columns=${newState.columns ? `[${newState.columns}]` : ''}),
    X_encoded
], axis=1)`;

        updateNodeState(newState);
    };

    const handleColumnsChange = (e) => {
        updateState({ columns: e.target.value });
    };

    const handleDropFirstChange = (e) => {
        updateState({ dropFirst: e.target.checked });
    };

    const handleSparseChange = (e) => {
        updateState({ sparse: e.target.checked });
    };

    const handleUnknownChange = (e) => {
        updateState({ handleUnknown: e.target.value });
    };

    return (
        <div className="customNode node-type-data-transform">
            <Handle
                type="target"
                position={Position.Left}
            />

            <div className="node-header">One-Hot Encoder</div>

            <div className="node-body">
                <div className="input-group">
                    <label>
                        Columns to Encode:
                        <input
                            type="text"
                            value={columns}
                            onChange={handleColumnsChange}
                            placeholder="Enter column names (comma-separated)"
                        />
                    </label>
                    <small className="helper-text">
                        Leave empty to encode all categorical columns
                    </small>
                </div>

                <div className="input-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={dropFirst}
                            onChange={handleDropFirstChange}
                        />
                        Drop First Category
                    </label>
                    <small className="helper-text">
                        Reduces multicollinearity by dropping one category
                    </small>
                </div>

                <div className="input-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={sparse}
                            onChange={handleSparseChange}
                        />
                        Use Sparse Matrix
                    </label>
                    <small className="helper-text">
                        More memory efficient for large datasets
                    </small>
                </div>

                <div className="input-group">
                    <label>
                        Handle Unknown:
                        <select
                            value={handleUnknown}
                            onChange={handleUnknownChange}
                        >
                            <option value="error">Error</option>
                            <option value="ignore">Ignore</option>
                        </select>
                    </label>
                    <small className="helper-text">
                        How to handle unknown categories during transform
                    </small>
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