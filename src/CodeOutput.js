import React, { memo } from 'react';
import './CodeOutput.css';


export default memo(({ data }) => {
    return (
        <div className="code-block-output">
            <div className="code-body">
                <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
        </div>
    );
});