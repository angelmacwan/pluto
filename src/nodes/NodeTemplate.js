import './node.css';

import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ data }) => {
    return (
        <div className='customNode'>
            <Handle
                type="target"
                position={Position.Left}
            />

            <p>Template</p>

            <div>
                {data.name}
            </div>

            <Handle
                type="source"
                position={Position.Right}
            />
        </div>
    );
});
