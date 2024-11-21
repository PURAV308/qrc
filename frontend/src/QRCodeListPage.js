import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const QRCodeList = () => {
  const [qrCodes, setQRCodes] = useState([]);
  const [selectedQRCode, setSelectedQRCode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQrCodes();
  }, []);

  const fetchQrCodes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/qrcodes/all');
      setQRCodes(response.data);
    } catch (error) {
      setErrorMessage('Error fetching QR codes.');
      console.error('Error fetching QR codes:', error);
    }
  };

  const handleConfirm = async (id) => {
    try {

      await axios.put(`http://localhost:5000/api/qrcodes/scan`, { text: id, confirmed: true });


      setQRCodes((prevQRCodes) =>
        prevQRCodes.map((qr) => (qr._id === id ? { ...qr, confirmed: true } : qr))
      );
    } catch (error) {
      console.error('Error confirming QR code:', error);
    }
  };

  const handleDelete = async (id) => {
    try {

      await axios.delete(`http://localhost:5000/api/qrcodes/delete/${id}`);


      setQRCodes((prevQRCodes) => prevQRCodes.filter((qr) => qr._id !== id));
    } catch (error) {
      console.error('Error deleting QR code:', error);
    }
  };

  const handleView = (qr) => {
    setSelectedQRCode(qr);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedQRCode(null);
    setIsModalOpen(false);
  };

  const navigateHome = () => {
    navigate('/');
  };

  return (
    <div className="p-5">
      <div className="mb-4">
        <button
          onClick={navigateHome}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Home
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-4">QR Code List</h1>
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
      {qrCodes.length === 0 ? (
        <p>No QR codes found.</p>
      ) : (
        <table className="table-auto border-collapse border-2 border-gray-300 w-full">
          <thead>
            <tr>
              <th className="border-2 border-gray-300 px-4 py-2">No.</th>
              <th className="border-2 border-gray-300 px-4 py-2">QR Data</th>
              <th className="border-2 border-gray-300 px-4 py-2">Confirmed</th>
              <th className="border-2 border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {qrCodes.map((qr, index) => (
              <tr key={qr._id}>
                <td className="border-2 border-gray-300 px-4 py-2">{index + 1}</td>
                <td className="border-2 border-gray-300 px-4 py-2">{qr.text}</td>
                <td className="border-2 border-gray-300 px-4 py-2">
                  {qr.confirmed ? 'Confirmed' : 'Pending'}
                </td>
                <td className="border-2 border-gray-300 px-4 py-2">
                  <div className="flex space-x-2">
                    {!qr.confirmed ? (
                      <button
                        onClick={() => handleConfirm(qr._id)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      >
                        Confirmed
                      </button>
                    ) : (
                      <button
                        disabled
                        className="bg-gray-300 text-gray-500 px-4 py-2 rounded cursor-not-allowed"
                      >
                        Confirmed
                      </button>
                    )}
                    <button
                      onClick={() => handleView(qr)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(qr._id)}
                      disabled={qr.confirmed}
                      className={`${qr.confirmed
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-red-500 text-white hover:bg-red-600'
                        } px-4 py-2 rounded`}
                    >
                      Delete
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal for Viewing QR Code Details */}
      {isModalOpen && selectedQRCode && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3">
            <h2 className="text-2xl font-bold mb-4">QR Code Details</h2>
            <div className="text-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                  selectedQRCode.text
                )}&size=200x200`}
                alt="QR Code"
                className="mx-auto mb-4"
              />
              <p>
                <strong>Name:</strong> {selectedQRCode.text}
              </p>
              <p>
                <strong>Status:</strong> {selectedQRCode.confirmed ? 'Inactive' : 'Active'}
              </p>
            </div>
            <button
              onClick={closeModal}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mt-4 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeList;
