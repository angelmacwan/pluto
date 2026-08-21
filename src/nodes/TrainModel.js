import React, { memo, useEffect } from 'react';
import BaseNode from './BaseNode';

const getInitialState = () => ({
    code: `model.fit(X_train, y_train)
y_pred = model.predict(X_test)`,
    imports: '',
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
        <BaseNode title="Train Model" typeClass="node-type-model">
            <p className="node-description">Fits the model and generates predictions.</p>
        </BaseNode>
    );
});

export { getInitialState };
