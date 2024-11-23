import './node.css';
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ data }) => {

    const {
        fileType = 'CSV',
        seperator = ',',
        fileName = '',
        updateNodeState = () => { }
    } = data;

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
                    undefined
        });
    };

    const handleseperatorChange = (e) => {
        updateState({ seperator: e.target.value });
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Create a new FileReader
            const reader = new FileReader();

            reader.onload = (e) => {
                updateState({
                    fileName: file.name,
                    fileContent: e.target.result,
                    fileType,
                    seperator
                });
            };

            // Read the file as text
            reader.readAsText(file);
        }
    };

    return (
        <div className='customNode node-type-data-loader'>
            <div className='node-header'>Data Input</div>

            <div className='node-body'>
                {/* Dropdown for File Type */}
                <label htmlFor="fileType">File Type</label>
                <select
                    id="fileType"
                    value={fileType}
                    onChange={handleFileTypeChange}
                    style={{ padding: '5px', marginBottom: '10px' }}
                >
                    <option value="CSV">CSV</option>
                    <option value="TSV">TSV</option>
                    <option value="JSON">JSON</option>
                    <option value="XLSX">XLSX</option>
                </select>

                <br />

                {/* Dropdown for seperator */}
                {(fileType === 'CSV' || fileType === 'TSV') && (
                    <>
                        <label htmlFor="seperator">seperator</label>
                        <select
                            id="seperator"
                            value={seperator}
                            onChange={handleseperatorChange}
                        >
                            <option value=",">Comma (,)</option>
                            <option value="\t">Tab (\t)</option>
                            <option value=";">Semicolon (;)</option>
                            <option value="|">Pipe (|)</option>
                        </select>
                    </>
                )}

                <br />

                {/* File Upload */}
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
                <br />

                <p className="file-name">{fileName}</p>
            </div>

            <Handle
                type="source"
                position={Position.Right}
            />
        </div>
    );
});
