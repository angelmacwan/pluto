import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

// Define initial state for KNN Imputer node
const getInitialState = () => ({
    k: 5,
    shuffle: true,
    stratify: false
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
        k = 5,
        shuffle = true,
        stratify = false,
        updateNodeState = () => { }
    } = data;

    const updateState = (updates) => {
        updateNodeState({
            ...data,
            ...updates
        });
    };

    return (
        <div className='customNode node-type-cv'>
            <Handle
                type="target"
                position={Position.Left}
            />

            <div className='node-header'>Kfold CV</div>

            <div className='node-body'>
                <div className="input-group">
                    <label>
                        K:
                        <input
                            type="number"
                            value={k}
                            onChange={(e) => updateState({ k: parseInt(e.target.value) || 1 })}
                            min="1"
                            style={{ width: '80px' }}
                        />
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Shuffle:
                        <input
                            type="checkbox"
                            checked={shuffle}
                            onChange={(e) => updateState({ shuffle: e.target.checked })}
                        />
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Stratify:
                        <input
                            type="checkbox"
                            checked={stratify}
                            onChange={(e) => updateState({ stratify: e.target.checked })}
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