import React, { memo, useEffect } from 'react';
import BaseNode from './BaseNode';

const getInitialState = () => ({
    code: 'df = df.dropna()',
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
        <BaseNode title="Filter NaN" typeClass="node-type-data-processor">
            <p className="node-description">Drops all rows containing NaN values from the DataFrame.</p>
        </BaseNode>
    );
});

export { getInitialState };
