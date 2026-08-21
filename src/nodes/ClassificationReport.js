import React, { memo, useEffect } from 'react';
import BaseNode from './BaseNode';

const getInitialState = () => ({
    imports: 'from sklearn.metrics import classification_report',
    code: `print(f"Classification Report for {str(type(model).__name__)}")
print(classification_report(y_test, y_pred))`,
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
        <BaseNode title="Classification Report" typeClass="node-type-output" hasOutput={false}>
            <p className="node-description">Prints precision, recall, F1 score, and accuracy.</p>
        </BaseNode>
    );
});

export { getInitialState };