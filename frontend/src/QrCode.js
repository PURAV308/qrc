import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const QrCode = () => {
  const navigate = useNavigate();
  const [scannedTexts, setScannedTexts] = useState([]);

  // Fetch scanned QR codes from the backend on component mount
  useEffect(() => {
    const fetchScannedData = async () => {
      try {
        const response = await axios.get('https://qrc-v18r.onrender.com/api/qrcodes/all'); // Replace with your backend endpoint
        setScannedTexts(response.data); // Assuming the backend sends an array of scanned QR codes
      } catch (error) {
        console.error('Error fetching QR Code data from backend:', error);
      }
    };

    fetchScannedData();
  }, []);

  const handleGenerateClick = () => {
    navigate('/generate');
  };

  const handleScannerClick = () => {
    navigate('/scanner');
  };

  const handleListClick = () => {
    navigate('/qr-code-list');
  };

  // Save new scanned QR codes to the backend
  const saveScannedDataToBackend = async (scannedText) => {
    try {
      await axios.post('https://qrc-v18r.onrender.com/api/qrcodes/add', {
        text: scannedText,
        confirmed: false,
      });
      console.log('QR Code saved to backend:', scannedText);

      // Refresh the scanned texts after saving
      const response = await axios.get('https://qrc-v18r.onrender.com/api/qrcodes');
      setScannedTexts(response.data);
    } catch (error) {
      console.error('Error saving QR Code to backend:', error);
    }
  };

  return (
    <div className="w-screen h-screen">
      <h2 className="text-5xl text-center font-bold pt-5">QR Code</h2>

      <div className="flex ml-10 mt-5 space-x-4">
        <button
          onClick={handleGenerateClick}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          QR Code Generator
        </button>
        <button
          onClick={handleScannerClick}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          QR Code Scanner
        </button>
        <button
          onClick={handleListClick}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          QR Code List
        </button>
      </div>

      <div className="ml-10 mt-5 pb-5">
        {scannedTexts.length > 0 ? (
          <div className="text-lg text-green-500">
            <h3>Scanned QR Codes:</h3>
            <table className="table-auto border-collapse border-2 border-gray-300 mt-4">
              <thead>
                <tr>
                  <th className="border-2 border-gray-300 px-4 py-2">No.</th>
                  <th className="border-2 border-gray-300 px-4 py-2">Data</th>
                </tr>
              </thead>
              <tbody>
                {scannedTexts.map((text, index) => (
                  <tr key={index}>
                    <td className="border-2 border-gray-300 px-4 py-2">{index + 1}</td>
                    <td className="border-2 border-gray-300 px-4 py-2">{text.text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="ml-10 mt-5 text-red-500">No QR codes found.</p>
        )}
      </div>
    </div>
  );
};

export default QrCode;
