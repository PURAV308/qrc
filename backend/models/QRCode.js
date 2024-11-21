const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  text: { type: String, required: true, unique: true, },
  confirmed: { type: Boolean, default: false }
});

module.exports = mongoose.model('QRCode', qrCodeSchema);
