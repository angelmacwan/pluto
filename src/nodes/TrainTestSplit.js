import './node.css';

import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(() => {
    const [splitRatio, setSplitRatio] = useState(0);

    return (
        <div className='customNode'>
            <Handle
                type="target"
                position={Position.Left}
            />

            <div className='node-header'>Split Data</div>

            <div className='node-body'>
                <p>
                    Validation Split Ratio
                </p>
                <input onChange={(e) => { setSplitRatio(e.target.value) }} type='number' />
            </div>

            <Handle
                type="source"
                position={Position.Right}
            />
        </div>
    );
});
