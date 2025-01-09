import './node.css';
import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

// Define initial state for this node type
const getInitialState = () => ({
    n_neighbors: 5,          // Number of neighbors
    algorithm: 'auto',       // Algorithm used for computation
    leaf_size: 30,           // Leaf size for tree-based algorithms
    metric: 'minkowski',     // Distance metric
    code: 'model = KNeighborsClassifier(n_neighbors=5)',
    imports: 'from sklearn.neighbors import KNeighborsClassifier'
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
        algorithm = 'auto',
        leaf_size = 30,
        metric = 'minkowski',
        code = 'model = KNeighborsClassifier(n_neighbors=5)',
        imports = 'from sklearn.neighbors import KNeighborsClassifier',
        updateNodeState = () => { }
    } = data;

    const updateState = (updates) => {
        const newState = {
            ...data,
            ...updates
        };

        // Generate code using the updated values
        newState.code = `model = KNeighborsClassifier(n_neighbors=${newState.n_neighbors}, algorithm='${newState.algorithm}', leaf_size=${newState.leaf_size}, metric='${newState.metric}')`;
        newState.imports = 'from sklearn.neighbors import KNeighborsClassifier';

        updateNodeState(newState);
    };

    return (
        <div className='customNode node-type-model'>
            <Handle
                type="target"
                position={Position.Left}
            />

            <div className='node-header'>KNN Classifier</div>

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
                        Algorithm:
                        <select
                            value={algorithm}
                            onChange={(e) => updateState({ algorithm: e.target.value })}
                        >
                            <option value="auto">Auto</option>
                            <option value="ball_tree">Ball Tree</option>
                            <option value="kd_tree">KD Tree</option>
                            <option value="brute">Brute</option>
                        </select>
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Leaf Size:
                        <input
                            type="number"
                            value={leaf_size}
                            onChange={(e) => updateState({ leaf_size: parseInt(e.target.value) || 1 })}
                            min="1"
                            style={{ width: '80px' }}
                        />
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Metric:
                        <select
                            value={metric}
                            onChange={(e) => updateState({ metric: e.target.value })}
                        >
                            <option value="minkowski">Minkowski</option>
                            <option value="euclidean">Euclidean</option>
                            <option value="manhattan">Manhattan</option>
                            <option value="chebyshev">Chebyshev</option>
                            <option value="hamming">Hamming</option>
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