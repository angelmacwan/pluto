import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

// Define initial state for PCA node
const getInitialState = () => ({
    n_components: 2,
    whiten: false,
    svd_solver: 'auto',
    imports: `from sklearn.decomposition import PCA
import numpy as np`,
    code: `
pca = PCA(n_components=2, 
    whiten=False,
    svd_solver='auto',
    random_state=42)

X = pca.fit_transform(X)
explained_variance_ratio = pca.explained_variance_ratio_
cumulative_variance_ratio = np.cumsum(explained_variance_ratio)

print(f"Explained variance ratio: {explained_variance_ratio}")
print(f"Cumulative explained variance ratio: {cumulative_variance_ratio}")`,
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
        n_components = 2,
        whiten = false,
        svd_solver = 'auto',
        imports = `from sklearn.decomposition import PCA
import numpy as np`,
        code = getInitialState().code,
        updateNodeState = () => { }
    } = data;

    const updateState = (updates) => {
        const newState = {
            ...data,
            ...updates
        };

        // Update code based on new parameters
        newState.code = `
pca = PCA(n_components=${newState.n_components}, 
    whiten=${newState.whiten ? 'True' : 'False'},
    svd_solver='${newState.svd_solver}',
    random_state=RANDOM_STATE)

X = pca.fit_transform(X)
explained_variance_ratio = pca.explained_variance_ratio_
cumulative_variance_ratio = np.cumsum(explained_variance_ratio)

print(f"Explained variance ratio: {explained_variance_ratio}")
print(f"Cumulative explained variance ratio: {cumulative_variance_ratio}")`;

        updateNodeState(newState);
    };

    const svdSolvers = ['auto', 'full', 'arpack', 'randomized'];

    return (
        <div className='customNode node-type-data-transform'>
            <Handle
                type="target"
                position={Position.Left}
            />

            <div className='node-header'>PCA</div>

            <div className='node-body'>
                <div className="input-group">
                    <label>
                        Number of Components:
                        <input
                            type="number"
                            value={n_components}
                            onChange={(e) => updateState({ n_components: parseInt(e.target.value) || 1 })}
                            min="1"
                            style={{ width: '80px' }}
                        />
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Whiten:
                        <input
                            type="checkbox"
                            checked={whiten}
                            onChange={(e) => updateState({ whiten: e.target.checked })}
                        />
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        SVD Solver:
                        <select
                            value={svd_solver}
                            onChange={(e) => updateState({ svd_solver: e.target.value })}
                            style={{ marginLeft: '8px' }}
                        >
                            {svdSolvers.map(solver => (
                                <option key={solver} value={solver}>
                                    {solver}
                                </option>
                            ))}
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