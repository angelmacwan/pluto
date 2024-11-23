import React, { memo } from 'react';
import './CodeOutput.css';

import { generateCode } from './CodeGenerator';

export default memo(({ data }) => {
    data = data.flat(Infinity);
    let code = [];

    for (let i = 0; i < data.length; i++) {
        const node = data[i];
        const nodeCode = generateCode(node);
        code.push(nodeCode);
    }


    return (
        <div className="code-block-output">
            <div className="code-body">
                <pre>
                    {code.map(elem => (<pre>{elem.imports}</pre>))}
                </pre>
                <br />
                <pre>
                    {code.map(elem => (<pre>{elem.code}</pre>))}
                </pre>
            </div>
        </div>
    );
});