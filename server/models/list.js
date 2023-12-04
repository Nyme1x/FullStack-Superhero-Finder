const mongoose = require('mongoose');

const superheroListSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    superheroIds: [String],
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'private'
    },
    description: {
      type: String,
      default: ''
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviews: [{
      reviewerName: String,
      comment: String,
      rating: Number,
      hidden: { type: Boolean, default: false }, // Add this field
      createdAt: {
          type: Date,
          default: Date.now
      }
  }]
});

const SuperheroList = mongoose.model('list', superheroListSchema);

module.exports = SuperheroList;
