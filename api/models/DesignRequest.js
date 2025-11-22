const mongoose = require('mongoose');

const DesignRequestSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  flowType: { type: String, enum: ['predefined', 'custom'], required: true },
  productId: String,
  productName: String,
  category: String,
  specifications: { type: Map, of: mongoose.Schema.Types.Mixed },
  contact: {
    name: String,
    phone: String,
    email: String,
    city: String,
    address: String
  },
  budget: String,
  timeline: String,
  status: { 
    type: String, 
    enum: ['New', 'Contacted', 'Quoted', 'Production', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'New'
  },
  notes: [String],
}, { timestamps: true });

DesignRequestSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

module.exports = mongoose.model('DesignRequest', DesignRequestSchema);