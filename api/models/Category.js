const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  image: String,
  allowedFilters: {
    materials: [String],
    styles: [String],
    sizes: [String]
  }
}, { timestamps: true });

// Map _id to id for frontend
CategorySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

module.exports = mongoose.model('Category', CategorySchema);