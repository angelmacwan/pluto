import './node.css';
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ data }) => {

    // Destructure values from data with defaults
    const {
        splitRatio = undefined,
        randomSeed = undefined,
        stratify = false,
        shuffle = true,
        updateNodeState = () => { }
    } = data;

    const updateState = (updates) => {
        updateNodeState({
            ...data,
            ...updates
        });
    };

    const handleSplitRatioChange = (e) => {
        // Convert to number and constrain between 0 and 1
        let value = parseFloat(e.target.value);

        // Handle direct decimal input (e.g., 0.8)
        if (value > 0 && value <= 1) {
            updateState({ splitRatio: value });
        }
        // Handle percentage input (e.g., 80)
        else if (value > 1 && value <= 100) {
            updateState({ splitRatio: value / 100 });
        }
    };

    const handleRandomSeedChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value)) {
            updateState({ randomSeed: value });
        }
    };

    const handleStratifyChange = (e) => {
        updateState({ stratify: e.target.checked });
    };

    const handleShuffleChange = (e) => {
        updateState({ shuffle: e.target.checked });
    };

    return (
        <div className='customNode node-type-data-processor'>
            <Handle
                type="target"
                position={Position.Left}
            />

            <div className='node-header'>Split Data</div>

            <div className='node-body'>
                <div>
                    <label>Training Split Ratio</label>
                    <input
                        type="number"
                        onChange={handleSplitRatioChange}
                        min="0"
                        max="1"
                        className='input-range-number'
                    />
                    <br />
                    <small className="helper-text">
                        {`Training set: ${(splitRatio * 100).toFixed(1)}% | Test set: ${((1 - splitRatio) * 100).toFixed(1)}%`}
                    </small>
                </div>

                <div>
                    <label>Random Seed</label>
                    <input
                        type="number"
                        value={randomSeed}
                        onChange={handleRandomSeedChange}
                        className='input-range-number'
                    />
                </div>

                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={shuffle}
                            onChange={handleShuffleChange}
                        />
                        Shuffle data before splitting
                    </label>
                </div>

                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={stratify}
                            onChange={handleStratifyChange}
                        />
                        Stratify split
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
