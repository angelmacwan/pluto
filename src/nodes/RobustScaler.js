import './node.css';
import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

// Define initial state for this node type
const getInitialState = () => ({
    withCentering: true,       // Center data by removing the median
    withScaling: true,         // Scale data to the interquartile range
    quantileRange: [25.0, 75.0], // Default interquartile range
    unitVariance: false,       // Scale data to unit variance
    code: 'scaler = RobustScaler()\nX_train = scaler.fit_transform(X_train)\nX_test = scaler.transform(X_test)',
    imports: 'from sklearn.preprocessing import RobustScaler',
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
        withCentering = true,
        withScaling = true,
        quantileRange = [25.0, 75.0],
        unitVariance = false,
        code = 'scaler = RobustScaler()\nX_train = scaler.fit_transform(X_train)\nX_test = scaler.transform(X_test)',
        imports = 'from sklearn.preprocessing import RobustScaler',
        updateNodeState = () => { }
    } = data;

    const updateState = (updates) => {
        const newState = {
            ...data,
            ...updates
        };
        newState.code = `scaler = RobustScaler(with_centering = ${newState.withCentering ? "True" : "False"},
            with_scaling = ${newState.withScaling ? "True" : "False"},
            quantile_range = (${newState.quantileRange}), unit_variance = ${newState.unitVariance ? "True" : "False"})

X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)`;
        updateNodeState(newState);
    };

    const updateQuantileRange = (index, value) => {
        const updatedRange = [...quantileRange];
        updatedRange[index] = parseFloat(value) || 0;
        updateState({ quantileRange: updatedRange });
    };

    return (
        <div className='customNode node-type-data-processor'>
            <Handle
                type="target"
                position={Position.Left}
            />

            <div className='node-header'>Robust Scaler</div>

            <div className='node-body'>
                <div className="input-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={withCentering}
                            onChange={(e) => updateState({ withCentering: e.target.checked })}
                        />
                        Center by median
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={withScaling}
                            onChange={(e) => updateState({ withScaling: e.target.checked })}
                        />
                        Scale by IQR
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Quantile Range:
                        <div className="quantile-range-inputs">
                            <input
                                type="number"
                                value={quantileRange[0]}
                                onChange={(e) => updateQuantileRange(0, e.target.value)}
                                style={{ width: '60px', marginRight: '5px' }}
                            />
                            -
                            <input
                                type="number"
                                value={quantileRange[1]}
                                onChange={(e) => updateQuantileRange(1, e.target.value)}
                                style={{ width: '60px', marginLeft: '5px' }}
                            />
                        </div>
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={unitVariance}
                            onChange={(e) => updateState({ unitVariance: e.target.checked })}
                        />
                        Scale to unit variance
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
