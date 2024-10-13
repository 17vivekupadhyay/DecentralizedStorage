import React, { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers'; // Update this based on your ethers version
import { create } from 'ipfs-http-client';
import './App.css';

// Initialize IPFS client (using Infura as an example)
const ipfs = create({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' });

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [fileHash, setFileHash] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]); // List of uploaded file hashes (CIDs)
  const [uploading, setUploading] = useState(false);

  // Function to connect to MetaMask
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setWalletAddress(accounts[0]); // Store the connected wallet address
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      alert('MetaMask is not installed. Please install MetaMask to use this app.');
    }
  };

  // Function to upload file to IPFS
  const uploadFileToIPFS = async (event) => {
    const file = event.target.files[0]; // Get the selected file

    if (!file) {
      alert('No file selected');
      return;
    }

    setUploading(true); // Indicate that the file is being uploaded
    console.log('Uploading file to IPFS:', file);

    try {
      const addedFile = await ipfs.add(file); // Upload file to IPFS
      console.log('File uploaded to IPFS:', addedFile); // Log IPFS response
      setFileHash(addedFile.path); // Store the latest uploaded IPFS hash (CID)

      // Add the new file CID to the list of uploaded files
      setUploadedFiles([...uploadedFiles, addedFile.path]);
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
    } finally {
      setUploading(false); // Stop the upload indicator
    }
  };

  // Effect to detect MetaMask account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setWalletAddress(accounts[0] || ''); // Handle account changes
      });
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h2>Decentralized Storage with IPFS</h2>
        {walletAddress ? (
          <div>
            <p>Connected Wallet: {walletAddress}</p>
            <h3>Upload File to IPFS</h3>
            <input type="file" onChange={uploadFileToIPFS} />
            {uploading && <p>Uploading file, please wait...</p>}
            {fileHash && (
              <p>
                Latest uploaded file! IPFS Hash: <a href={`https://ipfs.io/ipfs/${fileHash}`} target="_blank" rel="noopener noreferrer">{fileHash}</a>
              </p>
            )}

            {/* Display the list of uploaded files */}
            {uploadedFiles.length > 0 && (
              <div>
                <h3>Uploaded Files</h3>
                <ul>
                  {uploadedFiles.map((hash, index) => (
                    <li key={index}>
                      <a href={`https://ipfs.io/ipfs/${hash}`} target="_blank" rel="noopener noreferrer">
                        {hash}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}
      </header>
    </div>
  );
}

export default App;
