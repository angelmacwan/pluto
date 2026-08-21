import './node.css';
import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

const getInitialState = () => ({
    comment: 'Your comment here',
    imports: '',
    code: '# Your comment here',
});

const buildCode = ({ comment }) => {
    const text = comment || '';
    return text
        .split('\n')
        .map((line) => (line.startsWith('#') ? line : `# ${line}`))
        .join('\n');
};

export default memo(({ data }) => {
    useEffect(() => {
        if (data.updateNodeState && Object.keys(data).length <= 1) {
            data.updateNodeState(getInitialState());
        }
    }, [data]);

    const {
        comment = 'Your comment here',
        updateNodeState = () => {},
    } = data;

    const updateState = (updates) => {
        const next = { ...data, ...updates };
        next.code = buildCode(next);
        next.imports = '';
        updateNodeState(next);
    };

    return (
        <div className="customNode node-type-custom">
            <Handle type="target" position={Position.Left} />
            <div className="node-header">Comment / Note</div>
            <div className="node-body">
                <div className="input-group">
                    <label>Comment text</label>
                    <textarea
                        value={comment}
                        rows={2}
                        onChange={(e) => updateState({ comment: e.target.value })}
                        placeholder="Your comment here"
                    />
                </div>
            </div>
            <Handle type="source" position={Position.Right} />
        </div>
    );
});

export { getInitialState };
