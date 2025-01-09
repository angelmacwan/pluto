import './node.css';
import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

// Define initial state for this node type
const getInitialState = () => ({
    columnName: 'none',
    code: 'None',
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
        columnName = 'none',
        code = `X.drop(columns=[${columnName}], inplace=True)`,
        updateNodeState = () => { }
    } = data;

    const updateState = (updates) => {
        const newState = {
            ...data,
            ...updates
        }
        newState.code = `X.drop(columns=['${newState.columnName}'], inplace=True)`
        updateNodeState(newState);
    };


    return (
        <div className='customNode node-type-data-processor'>
            <Handle
                type="target"
                position={Position.Left}
            />

            <div className='node-header'>Drop Column</div>

            <div className='node-body'>

                <div className="input-group">
                    <label>
                        Column Names
                        <br />
                        <input
                            type="text"
                            value={columnName}
                            onChange={(e) => updateState({ columnName: e.target.value })}
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
