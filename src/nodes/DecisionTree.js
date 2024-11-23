import './node.css';
import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

// Define initial state for this node type
const getInitialState = () => ({
    criterion: 'gini',          // Quality of split
    splitter: 'best',           // Splitting strategy
    max_depth: null,            // Maximum depth of the tree
    min_samples_split: 2,       // Minimum samples to split an internal node
    min_samples_leaf: 1,        // Minimum samples to form a leaf node
});

export default memo(({ data }) => {
    // Initialize state when component mounts if it's empty
    useEffect(() => {
        if (data.updateNodeState && Object.keys(data).length <= 1) {
            data.updateNodeState(getInitialState());
        }
    }, []);

    // Destructure values from data, falling back to initial state values
    const {
        criterion = 'gini',
        splitter = 'best',
        max_depth = null,
        min_samples_split = 2,
        min_samples_leaf = 1,
        updateNodeState = () => { }
    } = data;

    const updateState = (updates) => {
        updateNodeState({
            ...data,
            ...updates
        });
    };

    return (
        <div className='customNode node-type-model'>
            <Handle
                type="target"
                position={Position.Left}
            />

            <div className='node-header'>Decision Tree Classifier</div>

            <div className='node-body'>
                <div className="input-group">
                    <label>
                        Criterion:
                        <select
                            value={criterion}
                            onChange={(e) => updateState({ criterion: e.target.value })}
                        >
                            <option value="gini">Gini</option>
                            <option value="entropy">Entropy</option>
                            <option value="log_loss">Log Loss</option>
                        </select>
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Splitter:
                        <select
                            value={splitter}
                            onChange={(e) => updateState({ splitter: e.target.value })}
                        >
                            <option value="best">Best</option>
                            <option value="random">Random</option>
                        </select>
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Max Depth:
                        <input
                            type="number"
                            value={max_depth !== null ? max_depth : ''}
                            onChange={(e) => updateState({ max_depth: e.target.value !== '' ? parseInt(e.target.value) || null : null })}
                            placeholder="None"
                            min="1"
                            style={{ width: '80px' }}
                        />
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Min Samples Split:
                        <input
                            type="number"
                            value={min_samples_split}
                            onChange={(e) => updateState({ min_samples_split: parseInt(e.target.value) || 2 })}
                            min="2"
                            style={{ width: '80px' }}
                        />
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Min Samples Leaf:
                        <input
                            type="number"
                            value={min_samples_leaf}
                            onChange={(e) => updateState({ min_samples_leaf: parseInt(e.target.value) || 1 })}
                            min="1"
                            style={{ width: '80px' }}
                        />
                    </label>
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
