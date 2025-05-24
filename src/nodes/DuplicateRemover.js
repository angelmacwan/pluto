import './node.css';
import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

// Define initial state for this node type
const getInitialState = () => ({
    subset: '',
    keep: 'first',
    code: `# Remove duplicate rows
X = X.drop_duplicates(
    subset=None,
    keep='first'
)`,
    imports: 'import pandas as pd'
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
        subset = '',
        keep = 'first',
        code = '',
        imports = 'import pandas as pd',
        updateNodeState = () => { }
    } = data;

    const updateState = (updates) => {
        const newState = {
            ...data,
            ...updates
        };

        // Generate code using the updated values
        newState.imports = 'import pandas as pd';
        newState.code = `# Remove duplicate rows
X = X.drop_duplicates(
    subset=${newState.subset ? `[${newState.subset}]` : 'None'},
    keep='${newState.keep}'
)`;

        updateNodeState(newState);
    };

    const handleSubsetChange = (e) => {
        updateState({ subset: e.target.value });
    };

    const handleKeepChange = (e) => {
        updateState({ keep: e.target.value });
    };

    return (
        <div className="customNode node-type-data-processor">
            <Handle
                type="target"
                position={Position.Left}
            />

            <div className="node-header">Duplicate Remover</div>

            <div className="node-body">
                <div className="input-group">
                    <label>
                        Columns to Check:
                        <input
                            type="text"
                            value={subset}
                            onChange={handleSubsetChange}
                            placeholder="Enter column names (comma-separated)"
                        />
                    </label>
                    <small className="helper-text">
                        Leave empty to check all columns
                    </small>
                </div>

                <div className="input-group">
                    <label>
                        Keep:
                        <select
                            value={keep}
                            onChange={handleKeepChange}
                        >
                            <option value="first">First Occurrence</option>
                            <option value="last">Last Occurrence</option>
                            <option value="False">None (Drop All)</option>
                        </select>
                    </label>
                    <small className="helper-text">
                        Which duplicate to keep
                    </small>
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