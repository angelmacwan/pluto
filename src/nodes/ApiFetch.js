import './node.css';
import React, { memo, useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';

// Define initial state for this node type
const getInitialState = () => ({
    url: '',
    method: 'GET',
    headers: '{\n  "Content-Type": "application/json"\n}',
    params: '{}',
    body: '{}',
    targetColumn: '',
    code: `import requests
import pandas as pd

# API Request
url = ""
headers = {"Content-Type": "application/json"}
params = {}
body = {}

response = requests.get(url, headers=headers, params=params, json=body)
data = response.json()

# Convert to DataFrame
df = pd.DataFrame(data)`,
    imports: 'import requests\nimport pandas as pd'
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
        url = '',
        method = 'GET',
        headers = '{\n  "Content-Type": "application/json"\n}',
        params = '{}',
        body = '{}',
        targetColumn = '',
        code = '',
        imports = 'import requests\nimport pandas as pd',
        updateNodeState = () => { }
    } = data;

    const [error, setError] = useState('');

    const updateState = (updates) => {
        const newState = {
            ...data,
            ...updates
        };

        // Generate code using the updated values
        newState.imports = 'import requests\nimport pandas as pd';
        newState.code = `# API Request
url = "${newState.url}"
headers = ${newState.headers}
params = ${newState.params}
body = ${newState.body}

response = requests.${newState.method.toLowerCase()}(url, headers=headers, params=params, json=body)
data = response.json()

# Convert to DataFrame
df = pd.DataFrame(data)`;

        updateNodeState(newState);
    };

    const handleUrlChange = (e) => {
        updateState({ url: e.target.value });
    };

    const handleMethodChange = (e) => {
        updateState({ method: e.target.value });
    };

    const handleHeadersChange = (e) => {
        try {
            const headersObj = JSON.parse(e.target.value);
            updateState({ headers: e.target.value });
            setError('');
        } catch (err) {
            setError('Invalid JSON format for headers');
        }
    };

    const handleParamsChange = (e) => {
        try {
            const paramsObj = JSON.parse(e.target.value);
            updateState({ params: e.target.value });
            setError('');
        } catch (err) {
            setError('Invalid JSON format for parameters');
        }
    };

    const handleBodyChange = (e) => {
        try {
            const bodyObj = JSON.parse(e.target.value);
            updateState({ body: e.target.value });
            setError('');
        } catch (err) {
            setError('Invalid JSON format for body');
        }
    };

    return (
        <div className="customNode node-type-data-loader">
            <Handle
                type="source"
                position={Position.Right}
            />

            <div className="node-header">API Fetch</div>

            <div className="node-body">
                <div className="input-group">
                    <label>
                        URL:
                        <input
                            type="text"
                            value={url}
                            onChange={handleUrlChange}
                            placeholder="https://api.example.com/data"
                        />
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Method:
                        <select
                            value={method}
                            onChange={handleMethodChange}
                        >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                            <option value="PATCH">PATCH</option>
                        </select>
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Headers:
                        <textarea
                            value={headers}
                            onChange={handleHeadersChange}
                            rows={4}
                            placeholder='{\n  "Content-Type": "application/json"\n}'
                        />
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Parameters:
                        <textarea
                            value={params}
                            onChange={handleParamsChange}
                            rows={4}
                            placeholder='{\n  "key": "value"\n}'
                        />
                    </label>
                </div>

                {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
                    <div className="input-group">
                        <label>
                            Request Body:
                            <textarea
                                value={body}
                                onChange={handleBodyChange}
                                rows={4}
                                placeholder='{\n  "key": "value"\n}'
                            />
                        </label>
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
});

export { getInitialState }; 