import React, { memo, useEffect } from 'react';
import BaseNode from './BaseNode';

const getInitialState = () => ({
    imports: 'from sklearn.preprocessing import LabelEncoder',
    code: `le = LabelEncoder()
y = le.fit_transform(y)
print(f"Classes : {le.classes_}")`,
});

export default memo(({ data }) => {
    const { updateNodeState = () => {} } = data;

    useEffect(() => {
        if (updateNodeState && Object.keys(data).length <= 1) {
            updateNodeState(getInitialState());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <BaseNode title="Label Encoder" typeClass="node-type-data-transform">
            <p className="node-description">Encodes target labels y with values between 0 and n_classes-1.</p>
        </BaseNode>
    );
});

export { getInitialState };