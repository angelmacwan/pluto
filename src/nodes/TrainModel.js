import './node.css';
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ data }) => {

    return (
        <div className='customNode node-type-model'>
            <Handle
                type="target"
                position={Position.Left}
            />

            <div className='node-header'>Train Model</div>

            <div className='node-body'>

            </div>

            <Handle
                type="source"
                position={Position.Right}
            />
        </div>
    );
});
