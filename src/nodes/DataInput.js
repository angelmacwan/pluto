import './node.css';
import React, { memo, useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';

// Define initial state for this node type
const getInitialState = () => ({
    fileType: 'CSV',
    seperator: ',',
    fileName: '',
    fileContent: '',
    targetColumn: '',
    code: 'data = pd.read_csv("data.csv")',
    imports: 'import pandas as pd'
});

export default memo(({ data }) => {
    // Initialize state when component mounts if it's empty
    useEffect(() => {
        if (data.updateNodeState && Object.keys(data).length <= 1) {
            data.updateNodeState(getInitialState());
        }
    }, [data]);

    const [columns, setColumns] = useState([]);

    // Destructure values from data, falling back to initial state values
    const {
        fileType = 'CSV',
        seperator = ',',
        fileName = '',
        fileContent = '',
        targetColumn = '',
        code = 'data = pd.read_csv("data.csv")',
        imports = 'import pandas as pd',
        updateNodeState = () => { }
    } = data;

    useEffect(() => {
        if (fileContent) {
            let headers = [];
            if (fileType === 'CSV' || fileType === 'TSV') {
                const lines = fileContent.split('\n');
                if (lines.length > 0) {
                    headers = lines[0].split(seperator).map(h => h.trim());
                }
            } else if (fileType === 'JSON') {
                try {
                    const jsonData = JSON.parse(fileContent);
                    if (Array.isArray(jsonData) && jsonData.length > 0) {
                        headers = Object.keys(jsonData[0]);
                    }
                } catch (e) {
                    console.error('Error parsing JSON:', e);
                }
            }
            setColumns(headers);
        }
    }, [fileContent, fileType, seperator]);

    const updateState = (updates) => {
        const newState = {
            ...data,
            ...updates
        };

        // Generate code using the updated values
        newState.imports = 'import pandas as pd';
        newState.code = `target_column = '${newState.targetColumn}'
df = pd.read_csv("${newState.fileName}", sep="${newState.seperator}")`

        updateNodeState(newState);
    };

    const handleFileTypeChange = (e) => {
        const newFileType = e.target.value;
        updateState({
            fileType: newFileType,
            seperator: newFileType === 'CSV' ? ',' :
                newFileType === 'TSV' ? '\t' : undefined,
            targetColumn: ''
        });
    };

    const handleseperatorChange = (e) => {
        updateState({
            seperator: e.target.value,
            targetColumn: ''
        });
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                updateState({
                    fileName: file.name,
                    filePath: event.target.value,
                    fileContent: e.target.result,
                    targetColumn: ''
                });
            };
            reader.readAsText(file);
        }
    };

    const handleTargetColumnChange = (e) => {
        updateState({ targetColumn: e.target.value });
    };

    return (
        <div className="customNode node-type-data-loader">
            <Handle
                type="source"
                position={Position.Right}
            />

            <div className="node-header">Data Input</div>

            <div className="node-body">
                <div className="input-group">
                    <label>
                        File Type:
                        <select
                            value={fileType}
                            onChange={handleFileTypeChange}
                        >
                            <option value="CSV">CSV</option>
                            <option value="TSV">TSV</option>
                            <option value="JSON">JSON</option>
                            <option value="XLSX">XLSX</option>
                        </select>
                    </label>
                </div>

                {(fileType === 'CSV' || fileType === 'TSV') && (
                    <div className="input-group">
                        <label>
                            Separator:
                            <select
                                value={seperator}
                                onChange={handleseperatorChange}
                            >
                                <option value=",">Comma (,)</option>
                                <option value="\t">Tab (\t)</option>
                                <option value=";">Semicolon (;)</option>
                                <option value="|">Pipe (|)</option>
                            </select>
                        </label>
                    </div>
                )}

                {columns.length > 0 && (
                    <div className="input-group">
                        <label>
                            Target Column:
                            <select
                                value={targetColumn}
                                onChange={handleTargetColumnChange}
                            >
                                <option value="">Select target column</option>
                                {columns.map((column, index) => (
                                    <option key={index} value={column}>
                                        {column}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                )}

                <div className="input-group">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept={
                            fileType === 'CSV' || fileType === 'TSV' ? '.csv,.tsv' :
                                fileType === 'JSON' ? '.json' :
                                    fileType === 'XLSX' ? '.xlsx,.xls' :
                                        undefined
                        }
                    />
                </div>

                {fileName && (
                    <div className="input-group">
                        <span className="file-name">
                            {fileName}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
});

export { getInitialState };