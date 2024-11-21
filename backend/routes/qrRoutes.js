const express = require('express');
const router = express.Router();
const QRCode = require('../models/QRCode');

// Create a new QR code entry
router.post('/add', async (req, res) => {
  try {
    const qrCode = new QRCode(req.body);
    await qrCode.save();
    res.status(201).json(qrCode);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save QR code' });
  }
});

// Get all QR codes
router.get('/all', async (req, res) => {
  try {
    const qrCodes = await QRCode.find();
    res.json(qrCodes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch QR codes' });
  }
});

// Scan QR Code and update the confirmed status without creating a new entry
router.put('/scan', async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.body.text);

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    qrCode.confirmed = true;
    await qrCode.save();

    res.json(qrCode);
  } catch (error) {
    console.error('Error scanning QR code:', error);
    res.status(500).json({ error: 'Failed to scan QR code' });
  }
});

// Delete QR Code
router.delete('/delete/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await QRCode.findByIdAndDelete(id);
    res.status(200).json({ message: 'QR Code deleted successfully' });
  } catch (error) {
    console.error('Error deleting QR Code:', error);
    res.status(500).json({ message: 'Error deleting QR Code', error });
  }
});

module.exports = router;
