import './node.css';
import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

const getInitialState = () => ({
    imports: 'from sklearn.metrics import classification_report',
    code: 'print(classification_report(y_test, y_pred))',
});

export default memo(({ data }) => {


    // Initialize state when component mounts if it's empty
    useEffect(() => {
        if (data.updateNodeState && Object.keys(data).length <= 1) {
            data.updateNodeState(getInitialState());
        }
    }, [data]);


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
