import './node.css';
import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

// Define initial state for this node type
const getInitialState = () => ({
    withMean: true,          // Center data to zero mean
    withStd: true,           // Scale data to unit variance
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
        withMean = true,
        withStd = true,
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

            <div className='node-header'>Standard Scaler</div>

            <div className='node-body'>
                <div className="input-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={withMean}
                            onChange={(e) => updateState({ withMean: e.target.checked })}
                        />
                        Center to zero mean
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={withStd}
                            onChange={(e) => updateState({ withStd: e.target.checked })}
                        />
                        Scale to Standard Deviation
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