import './node.css';
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(() => {

    return (
        <div className='customNode node-type-data-processor'>
            <Handle
                type="target"
                position={Position.Left}
            />

            <div className='node-header'>Filter Nan</div>

            <div className='node-body'>

            </div>

            <Handle
                type="source"
                position={Position.Right}
            />
        </div>
    );
});
