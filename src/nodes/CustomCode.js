import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

// Define initial state for code block
const getInitialState = () => ({
    code: '',
});

export default memo(({ data }) => {
    // Initialize state when component mounts if it's empty
    useEffect(() => {
        if (data.updateNodeState && Object.keys(data).length <= 1) {
            data.updateNodeState(getInitialState());
        }
    }, [data]);

    // Destructure values from data, falling back to initial state values
    const {
        code = '',
        updateNodeState = () => { }
    } = data;

    const updateState = (updates) => {
        updateNodeState({
            ...data,
            ...updates
        });
    };


    return (
        <div className='customNode node-type-custom'>
            <Handle
                type="target"
                position={Position.Left}
            />

            <div className='node-header'>Code Block</div>

            <div className='node-body' style={{
                background: 'rgb(40, 44, 52)',
            }}>
                <div className="code-section">
                    <textarea
                        style={{
                            fontFamily: 'monospace',
                            padding: '8px',
                            background: 'rgb(40, 44, 52)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                        }}
                        value={code}
                        onChange={(e) => updateState({ code: e.target.value })}
                        rows={12}
                        cols={50}
                        className="code-editor"
                    />
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Right}
            />
        </div>
    );
});

export { getInitialState };

// Add this CSS to your node.css file
/*
.code-editor {
    font-family: monospace;
    width: 100%;
    padding: 8px;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    resize: vertical;
}

.code-section {
    margin: 10px 0;
}

.validation-status {
    font-size: 0.9em;
    padding: 5px;
    border-radius: 4px;
}
*/