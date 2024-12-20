import './node.css';
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const getInitialState = () => ({

});

export default memo(() => {

    return (
        <div className='customNode node-type-output'>
            <Handle
                type="target"
                position={Position.Left}
            />

            <div className='node-header'>Classification Report</div>

            <div className='node-body'>

            </div>

            <Handle
                type="source"
                position={Position.Right}
            />
        </div>
    );
});

export { getInitialState };
