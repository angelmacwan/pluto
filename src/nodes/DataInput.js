import './node.css';

import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ data }) => {
    const [fileType, setFileType] = useState('CSV');
    const [delimiter, setDelimiter] = useState(',');
    const [fileName, setFileName] = useState('');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFileName(file.name);
            console.log('Uploaded file:', file);
            console.log('Selected file type:', fileType);
            console.log('Selected delimiter:', delimiter);
        }
    };

    return (
        <div className='customNode variable'>
            <div style={{ margin: '10px 0', textAlign: 'center' }}>
                {/* Dropdown for File Type */}
                <label htmlFor="fileType">File Type</label>
                <select
                    id="fileType"
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    style={{ padding: '5px', marginBottom: '10px' }}
                >
                    <option value="CSV">CSV</option>
                    <option value="TSV">TSV</option>
                    <option value="JSON">JSON</option>
                    <option value="XLSX">XLSX</option>
                </select>

                <br />

                {/* Dropdown for Delimiter */}
                {fileType === 'CSV' || fileType === 'TSV' ? (
                    <>
                        <label htmlFor="delimiter">Delimiter</label>
                        <select
                            id="delimiter"
                            value={delimiter}
                            onChange={(e) => setDelimiter(e.target.value)}
                        >
                            <option value=",">Comma (,)</option>
                            <option value="\t">Tab (\\t)</option>
                            <option value=";">Semicolon (;)</option>
                            <option value="|">Pipe (|)</option>
                        </select>
                    </>
                ) : null}

                <br />


                {/* File Upload */}
                <input
                    type="file"
                    id="fileUpload"
                    className="file-upload-input"
                    onChange={handleFileChange}
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
