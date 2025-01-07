import './node.css';
import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

// Define initial state for this node type
const getInitialState = () => ({
    seed: 12,
    code: 'RANDOM_SEED = 12'
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
        seed = 12,
        code = `RANDOM_SEED = ${seed}`,
        updateNodeState = () => { }
    } = data;

    const updateState = (updates) => {
        const newState = {
            ...data,
            ...updates
        };
        newState.code = `RANDOM_SEED = ${newState.seed}`
        updateNodeState({
            ...newState,
        });
    };

    return (
        <div className='customNode node-type-data-processor'>
            <Handle
                type="target"
                position={Position.Left}
            />

            <div className='node-header'>Set Seed</div>

            <div className='node-body'>
                <div className="input-group">
                    <label>
                        <input
                            type="number"
                            value={seed}
                            onChange={(e) => updateState({ seed: e.target.value })}
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