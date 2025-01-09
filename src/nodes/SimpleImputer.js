import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

// Define initial state for Simple Imputer node
const getInitialState = () => ({
    missing_values: 'nan',
    strategy: 'mean',
    code: `imputer = SimpleImputer(missing_values = np.nan, strategy = 'mean')
X_train = imputer.fit_transform(X_train)
X_test = imputer.transform(X_test)`,

    imports: 'from sklearn.impute import SimpleImputer',
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
        missing_values = 'nan',
        strategy = 'mean',
        imports = 'from sklearn.impute import SimpleImputer',
        code = `imputer = SimpleImputer(missing_values = np.nan, strategy = 'mean')
X_train = imputer.fit_transform(X_train)
X_test = imputer.transform(X_test)`,

        updateNodeState = () => { }
    } = data;

    const updateState = (updates) => {
        const newState = {
            ...data,
            ...updates
        }
        newState.code = `imputer = SimpleImputer(missing_values = ${newState.missing_values}, strategy = '${newState.strategy}')

X_train = imputer.fit_transform(X_train)
X_test = imputer.transform(X_test)`
        updateNodeState(newState);
    };

    return (
        <div className='customNode node-type-data-processor'>
            <Handle
                type="target"
                position={Position.Left}
            />

            <div className='node-header'>Simple Imputer</div>

            <div className='node-body'>
                <div className="input-group">
                    <label>
                        Missing Values:
                        <select
                            value={missing_values}
                            onChange={(e) => updateState({ missing_values: e.target.value })}
                        >
                            <option value="pd.NA">pandas.NA</option>
                            <option value="np.nan">np.nan</option>
                        </select>
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Strategy:
                        <select
                            value={strategy}
                            onChange={(e) => updateState({ strategy: e.target.value })}
                        >
                            <option value="mean">Mean</option>
                            <option value="median">Median</option>
                            <option value="most_frequent">Most Frequent</option>
                            <option value="constant">Constant</option>
                        </select>
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