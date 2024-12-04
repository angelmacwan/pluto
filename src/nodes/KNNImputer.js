import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

// Define initial state for KNN Imputer node
const getInitialState = () => ({
    n_neighbors: 5,
    weights: 'uniform',
    metric: 'nan_euclidean'
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
        n_neighbors = 5,
        weights = 'uniform',
        metric = 'nan_euclidean',
        updateNodeState = () => { }
    } = data;

    const updateState = (updates) => {
        updateNodeState({
            ...data,
            ...updates
        });
    };

    return (
        <div className='customNode node-type-data-processor'>
            <Handle
                type="target"
                position={Position.Left}
            />

            <div className='node-header'>KNN Imputer</div>

            <div className='node-body'>
                <div className="input-group">
                    <label>
                        Number of Neighbors:
                        <input
                            type="number"
                            value={n_neighbors}
                            onChange={(e) => updateState({ n_neighbors: parseInt(e.target.value) || 1 })}
                            min="1"
                            style={{ width: '80px' }}
                        />
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Weights:
                        <select
                            value={weights}
                            onChange={(e) => updateState({ weights: e.target.value })}
                        >
                            <option value="uniform">Uniform</option>
                            <option value="distance">Distance</option>
                        </select>
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Metric:
                        <select
                            value={metric}
                            onChange={(e) => updateState({ metric: e.target.value })}
                        >
                            <option value="nan_euclidean">NaN Euclidean</option>
                            <option value="euclidean">Euclidean</option>
                            <option value="manhattan">Manhattan</option>
                            <option value="cosine">Cosine</option>
                        </select>
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