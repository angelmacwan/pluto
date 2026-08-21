import './node.css';
import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

const getInitialState = () => ({
    listName: 'my_list',
    items: '1, 2, 3',
    imports: '',
    code: 'my_list = [1, 2, 3]',
});

const buildCode = ({ listName, items }) => {
    const name = listName || 'my_list';
    const raw = items ?? '';
    return `${name} = [${raw}]`;
};

export default memo(({ data }) => {
    useEffect(() => {
        if (data.updateNodeState && Object.keys(data).length <= 1) {
            data.updateNodeState(getInitialState());
        }
    }, [data]);

    const {
        listName = 'my_list',
        items = '1, 2, 3',
        updateNodeState = () => {},
    } = data;

    const updateState = (updates) => {
        const next = { ...data, ...updates };
        next.code = buildCode(next);
        next.imports = '';
        updateNodeState(next);
    };

    return (
        <div className="customNode node-type-variable">
            <Handle type="target" position={Position.Left} />
            <div className="node-header">List</div>
            <div className="node-body">
                <div className="input-group">
                    <label>Variable name</label>
                    <input
                        type="text"
                        value={listName}
                        onChange={(e) => updateState({ listName: e.target.value })}
                        placeholder="my_list"
                    />
                </div>
                <div className="input-group">
                    <label>Items (comma-separated)</label>
                    <input
                        type="text"
                        value={items}
                        onChange={(e) => updateState({ items: e.target.value })}
                        placeholder="1, 2, 3"
                    />
                </div>
                <p className="node-description">{buildCode({ listName, items })}</p>
            </div>
            <Handle type="source" position={Position.Right} />
        </div>
    );
});

export { getInitialState };
