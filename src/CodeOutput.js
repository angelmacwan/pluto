import React, { memo } from 'react';
import './CodeOutput.css';

export default memo(({ data }) => {
    data = data.flat(Infinity);

    return (
        <div className="code-block-output">
            <div className="code-body">

                <pre>
                    {
                        data.map((node, index) => (
                            <code key={index}>
                                <p>{node.type}</p>
                                {JSON.stringify(node.data, null, 2)}
                            </code>
                        ))}
                </pre>
            </div>
        </div>
    );
});