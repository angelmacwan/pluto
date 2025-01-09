import './node.css';
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ data }) => {

    data.imports = 'from sklearn.metrics import classification_report';
    data.code = 'print(classification_report(y_test, y_pred))';

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