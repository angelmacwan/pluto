import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

// Define initial state for Simple Imputer node
const getInitialState = () => ({
    missing_values: 'nan',
    strategy: 'mean'
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
        updateNodeState = () => { }
    } = data;

    const updateState = (updates) => {
        updateNodeState({
            ...data,
            ...updates
        });
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