const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true, index: true },
  tagline: String,
  description: String,
  materials: [String],
  dimensions: { 
    w: Number, 
    d: Number, 
    h: Number 
  },
  image: String,
  priceRange: String,
  tags: [String],
  published: { type: Boolean, default: true },
}, { timestamps: true });

ProductSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

module.exports = mongoose.model('Product', ProductSchema);