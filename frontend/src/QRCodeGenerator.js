import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const QRCodeGenerator = () => {
  const [texts, setTexts] = useState('');
  const [generatedQRCodes, setGeneratedQRCodes] = useState([]);
  const [fileError, setFileError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const handleGenerate = async () => {
    setLoading(true); // Start loading
    const qrEntries = texts.split('\n').filter((line) => line.trim() !== '');
    const newQRCodes = qrEntries.map((text) => ({ text, id: uuidv4() }));
    console.log(newQRCodes);
    
    try {
      // Save each QR code to the backend
      await Promise.all(
        newQRCodes.map((qr) =>
          axios.post('https://qrc-v18r.onrender.com/api/qrcodes/add', { text: qr.text, confirmed: false })
        )
      );

      setGeneratedQRCodes(newQRCodes);
      setTexts('');
      setSuccessMessage('QR codes generated and saved successfully!');

      // Clear success message after 3 seconds and hide QR codes
      setTimeout(() => {
        setSuccessMessage('');
        setGeneratedQRCodes([]);
        setIsModalOpen(false); // Close the modal after generating QR codes
      }, 3000);
    } catch (error) {
      console.error('Error saving QR codes:', error);
      setSuccessMessage('Error generating QR codes, please try again.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleClick = () => {
    navigate('/'); // Navigate back to home page
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(generatedQRCodes.map((qr) => ({ Data: qr.text })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'QR Codes');
    XLSX.writeFile(wb, 'generated_qr_codes.xlsx');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileError('');

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          const qrData = rows.flat().filter((text) => text && typeof text === 'string' && text.trim() !== '').map((text) => ({ text, id: uuidv4() }));

          // Save each QR code to the backend
          await Promise.all(
            qrData.map((qr) =>
              axios.post('https://qrc-v18r.onrender.com/api/qrcodes/add', { text: qr.text, confirmed: false })
            )
          );

          setGeneratedQRCodes(qrData);
        } catch (error) {
          setFileError('Invalid file format. Please upload a valid Excel file.');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleClick}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        HOME
      </button>

      {generatedQRCodes.length > 0 && (
        <button
          onClick={exportToExcel}
          className="bg-yellow-500 text-white px-4 py-2 mt-5 rounded hover:bg-yellow-600"
        >
          EXPORT TO EXCEL
        </button>
      )}

      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-green-500 text-white px-4 py-2 mt-5 rounded hover:bg-green-600"
      >
        OPEN GENERATE QR CODE MODAL
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
          {fileError && <div className="text-red-500 mt-2">{fileError}</div>}
          {successMessage && <div className="text-green-500 mt-2">{successMessage}</div>}
            <h2 className="text-xl font-semibold mb-4">Generate QR Codes</h2>
            <textarea
              placeholder="Enter multiple texts, one per line, to generate multiple QR codes"
              value={texts}
              onChange={(e) => setTexts(e.target.value)}
              className="p-2 px-5 border rounded w-full"
              rows="5"
            />
            <button
              onClick={handleGenerate}
              className="bg-blue-500 text-white px-4 py-2 mt-4 rounded hover:bg-blue-600"
              disabled={loading} // Disable while loading
            >
              {loading ? 'Generating...' : 'GENERATE'} {/* Button text changes */}
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-red-500 text-white px-4 py-2 mt-2 rounded hover:bg-red-600"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        className="mt-4 border p-2 rounded"
      />

      
    </div>
  );
};

export default QRCodeGenerator;
