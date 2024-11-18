import './node.css';

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ data }) => {
    return (
        <div className='customNode'>

            <Handle
                type="target"
                position={Position.Left}
            />

            <div>{data.label}</div>

            <Handle
                type="source"
                position={Position.Right}
                id="a"
            />

        </div>
    );
});