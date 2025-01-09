import './node.css';
import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

// Define initial state for this node type
const getInitialState = () => ({
    splitRatio: 0.8,
    stratify: false,
    shuffle: true,
    code: 'X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)',
    imports: 'from sklearn.model_selection import train_test_split'
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
        splitRatio = 0.8,
        stratify = false,
        shuffle = true,
        code = 'X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)',
        imports = 'from sklearn.model_selection import train_test_split',
        updateNodeState = () => { }
    } = data;

    const updateState = (updates) => {
        const newState = {
            ...data,
            ...updates
        };

        newState.imports = 'from sklearn.model_selection import train_test_split';
        newState.code = `X = df.drop(columns=[target_column])
y = df[target_column]
X_train, X_test, y_train, y_test = train_test_split(X, y,
                        test_size=${newState.splitRatio},
                        random_state=RANDOM_SEED,
                        shuffle=${newState.shuffle ? "True" : "False"},
                        stratify=${newState.stratify ? "y" : "None"})`;

        updateNodeState(newState);
    };

    const handleSplitRatioChange = (e) => {
        // Convert to number and constrain between 0 and 1
        let value = parseFloat(e.target.value);

        // Handle direct decimal input (e.g., 0.8)
        if (value > 0 && value <= 1) {
            updateState({ splitRatio: value });
        }
        // Handle percentage input (e.g., 80)
        else if (value > 1 && value <= 100) {
            updateState({ splitRatio: value / 100 });
        }
    };

    const handleStratifyChange = (e) => {
        updateState({ stratify: e.target.checked });
    };

    const handleShuffleChange = (e) => {
        updateState({ shuffle: e.target.checked });
    };

    return (
        <div className='customNode node-type-data-processor'>
            <Handle
                type="target"
                position={Position.Left}
            />

            <div className='node-header'>Train Test Split</div>

            <div className='node-body'>
                <div className="input-group">
                    <label>
                        Training Split Ratio:
                        <input
                            type="number"
                            value={splitRatio}
                            onChange={handleSplitRatioChange}
                            min="0"
                            max="1"
                            step="0.1"
                            className='input-range-number'
                        />
                    </label>
                    <small className="helper-text">
                        {`Training set: ${(splitRatio * 100).toFixed(1)}% | Test set: ${((1 - splitRatio) * 100).toFixed(1)}%`}
                    </small>
                </div>

                <div className="input-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={shuffle}
                            onChange={handleShuffleChange}
                        />
                        Shuffle data before splitting
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={stratify}
                            onChange={handleStratifyChange}
                        />
                        Stratify split
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