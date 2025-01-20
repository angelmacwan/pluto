import './node.css';
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ data }) => {

    data.imports = 'from sklearn.preprocessing import LabelEncoder';
    data.code = `le = LabelEncoder()
y = le.fit_transform(y)
print(f"Classes : {le.classes_}")`;

    return (
        <div className='customNode node-type-data-transform'>
            <Handle
                type="target"
                position={Position.Left}
            />

            <div className='node-header'>Label Encoder</div>

            <div className='node-body'>
            </div>

            <Handle
                type="source"
                position={Position.Right}
            />
        </div>
    );
});