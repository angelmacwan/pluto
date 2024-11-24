import './node.css';
import React, { memo, useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ data }) => {
    const {
        fileType = 'CSV',
        seperator = ',',
        fileName = '',
        fileContent = '',
        targetColumn = '',
        updateNodeState = () => { }
    } = data;

    const [columns, setColumns] = useState([]);

    useEffect(() => {
        if (fileContent) {
            let headers = [];
            if (fileType === 'CSV' || fileType === 'TSV') {
                // Get first line and split by separator
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
        updateNodeState({
            ...data,
            ...updates
        });
    };

    const handleFileTypeChange = (e) => {
        const newFileType = e.target.value;
        updateState({
            fileType: newFileType,
            seperator: newFileType === 'CSV' ? ',' :
                newFileType === 'TSV' ? '\t' :
                    undefined,
            targetColumn: '' // Reset target column when file type changes
        });
    };

    const handleseperatorChange = (e) => {
        updateState({
            seperator: e.target.value,
            targetColumn: '' // Reset target column when separator changes
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
                    fileType,
                    seperator,
                    targetColumn: '' // Reset target column when file changes
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
            <div className="node-header">Data Input</div>

            <div className="node-body">
                {/* File Type Selection */}
                <label htmlFor="fileType">File Type</label>
                <select
                    id="fileType"
                    value={fileType}
                    onChange={handleFileTypeChange}
                    className="mb-2 w-full p-1 border rounded"
                >
                    <option value="CSV">CSV</option>
                    <option value="TSV">TSV</option>
                    <option value="JSON">JSON</option>
                    <option value="XLSX">XLSX</option>
                </select>

                {/* Separator Selection */}
                {(fileType === 'CSV' || fileType === 'TSV') && (
                    <div className="mt-2">
                        <label htmlFor="seperator">Separator</label>
                        <select
                            id="seperator"
                            value={seperator}
                            onChange={handleseperatorChange}
                            className="w-full p-1 border rounded"
                        >
                            <option value=",">Comma (,)</option>
                            <option value="\t">Tab (\t)</option>
                            <option value=";">Semicolon (;)</option>
                            <option value="|">Pipe (|)</option>
                        </select>
                    </div>
                )}

                {/* Target Column Selection */}
                {columns.length > 0 && (
                    <div className="mt-2">
                        <label htmlFor="targetColumn">Target Column</label>
                        <select
                            id="targetColumn"
                            value={targetColumn}
                            onChange={handleTargetColumnChange}
                            className="w-full p-1 border rounded"
                        >
                            <option value="">Select target column</option>
                            {columns.map((column, index) => (
                                <option key={index} value={column}>
                                    {column}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* File Upload */}
                <div className="mt-2">
                    <input
                        type="file"
                        id="fileUpload"
                        className="file-upload-input"
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
                    <p className="file-name mt-2 text-sm text-gray-600">
                        {fileName}
                    </p>
                )}
            </div>

            <Handle
                type="source"
                position={Position.Right}
            />
        </div>
    );
});
