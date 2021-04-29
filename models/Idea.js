const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const IdeaSchema = new Schema({
  title:{
    type: String,
    required: true
  },
  details:{
    type: String,
    required: true
  },
  script: {
    type: String,
    required: true
  },
  user:{
    type: Schema.Types.ObjectId,
    ref:'users'
  },
  pictures: [{
    name: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: false
    },
    description: {
      type: String,
      required: false
    },
  }],
  comments: [{
    commentBody: {
      type: String,
      required: true
    },
    commentDate:{
      type: Date,
      default: Date.now
    },
    commentUser:{
      type: Schema.Types.ObjectId,
      ref:'users'
    }
  }],
  isPublished: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('ideas', IdeaSchema);