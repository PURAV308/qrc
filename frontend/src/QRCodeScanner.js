import React, { useState, useEffect } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const QRCodeScanner = () => {
  const [scannedTexts, setScannedTexts] = useState([]);
  const [scannedSet, setScannedSet] = useState(new Set());
  const [cameraError, setCameraError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [duplicateMessage, setDuplicateMessage] = useState(null);
  const navigate = useNavigate();

  // Fetch all scanned QR codes from the backend on initial load
  useEffect(() => {
    axios.get('http://localhost:5000/api/qrcodes/all')
      .then((response) => {
        const scannedData = response.data.map((item) => ({
          id: item._id,
          text: item.text,
          confirmed: item.confirmed,
        }));
        setScannedTexts(scannedData);
        setScannedSet(new Set(scannedData.filter((item) => item.confirmed).map((item) => item.text)));
      })
      .catch((error) => {
        console.error('Error fetching scanned data:', error);
      });
  }, []);

  const openScanner = () => {
    setIsModalOpen(true);
    setCameraError(null);

    const codeReader = new BrowserMultiFormatReader();
    codeReader.getVideoInputDevices()
      .then((videoInputDevices) => {
        if (videoInputDevices.length === 0) {
          setCameraError('No video input devices found');
          return;
        }

        const videoDeviceId = videoInputDevices[0].deviceId;
        codeReader.decodeFromVideoDevice(videoDeviceId, 'video', async (result, error) => {
          if (result) {
            const text = result.text;

            // Check if QR code has already been scanned
            if (!scannedSet.has(text)) {
              const existingCode = scannedTexts.find((item) => item.text === text);

              if (existingCode) {
                // Update the QR code as confirmed in the backend
                try {
                  await axios.put('http://localhost:5000/api/qrcodes/scan', {
                    text: existingCode.id,
                  });
                  
                  setScannedSet((prevSet) => new Set(prevSet).add(text));
                  setScannedTexts((prevTexts) =>
                    prevTexts.map((item) =>
                      item.id === existingCode.id ? { ...item, confirmed: true } : item
                    )
                  );
                  setSuccessMessage('QR Code scanned successfully and marked as confirmed!');
                  setTimeout(() => setSuccessMessage(null), 2000);
                } catch (err) {
                  console.error('Error updating QR code:', err);
                  setDuplicateMessage('Error updating QR code. Please try again.');
                  setTimeout(() => setDuplicateMessage(null), 2000);
                }
              } else {
                setDuplicateMessage('QR Code does not exist in the backend.');
                setTimeout(() => setDuplicateMessage(null), 2000);
              }
            } else {
              // Handle duplicate scanning
              setDuplicateMessage('QR Code already scanned!');
              setTimeout(() => setDuplicateMessage(null), 2000);
            }
          } else if (error && !(error instanceof NotFoundException)) {
            console.error('QR code detection error:', error);
            setCameraError('Error detecting QR code. Please try again.');
          }
        });
      })
      .catch((error) => {
        setCameraError('Error accessing video devices: ' + error);
        console.error('Error accessing video devices:', error);
      });
  };

  const closeScanner = () => {
    setIsModalOpen(false);
  };

  const handleClick = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex ml-10 mt-5 space-x-4">
        <button
          onClick={handleClick}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          HOME
        </button>
        <button
          onClick={openScanner}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          SCANNER
        </button>
      </div>

      {scannedTexts.length > 0 && (
        <div className="text-lg text-green-500 ml-16 pb-10">
          <h3>Scanned QR Codes:</h3>
          <table className="table-auto border-collapse border-2 border-gray-300 mt-4">
            <thead>
              <tr>
                <th className="border-2 border-gray-300 px-4 py-2">No.</th>
                <th className="border-2 border-gray-300 px-4 py-2">Data</th>
                <th className="border-2 border-gray-300 px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {scannedTexts.map((item, index) => (
                <tr key={item.id}>
                  <td className="border-2 border-gray-300 px-4 py-2">{index + 1}</td>
                  <td className="border-2 border-gray-300 px-4 py-2">{item.text}</td>
                  <td
                    className={`border-2 px-4 py-2 ${
                      item.confirmed ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {item.confirmed ? 'Confirmed' : 'Pending'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Scan QR Code</h2>
              <button onClick={closeScanner} className="text-red-500 font-bold">
                CLOSE
              </button>
            </div>
            <video id="video" width="100%" height="auto" className="border border-gray-300" />
            {cameraError && <p className="text-red-500 mt-2">{cameraError}</p>}
            {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
            {duplicateMessage && <p className="text-red-500 mt-2">{duplicateMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeScanner;
