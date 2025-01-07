import './node.css';
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ data }) => {

    data.code = `model.fit(X_train, y_train)
y_pred = model.predict(X_test)`

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
