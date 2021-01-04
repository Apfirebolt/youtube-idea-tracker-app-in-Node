const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const {ensureAuthenticated} = require('../helpers/auth');

// Load Idea Model
require('../models/Idea');
const Idea = mongoose.model('ideas');

// Idea Index Page
router.get('/', ensureAuthenticated, (req, res) => {
  Idea.find({user: req.user.id})
    .lean()
    .sort({date:'desc'})
    .then(ideas => {
      res.render('ideas/list', {
        ideas:ideas
      });
    });
});

// Add Idea Form
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('ideas/create');
});

// Edit Idea Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .lean()
  .then(idea => {
    if(idea.user != req.user.id){
      req.flash('error_msg', 'Not Authorized');
      res.redirect('/ideas');
    } else {
      res.render('ideas/edit', {
        idea:idea
      });
    }
  });
});

// Delete Idea Form
router.get('/delete/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .lean()
  .then(idea => {
    if(idea.user != req.user.id){
      req.flash('error_msg', 'Not Authorized');
      res.redirect('/ideas');
    } else {
      res.render('ideas/delete', {
        idea:idea
      });
    }
  });
});

// Add Idea form process
router.post('/', ensureAuthenticated, (req, res) => {
  let errors = [];

  if(!req.body.title){
    errors.push({text:'Please add a title'});
  }
  if(!req.body.details){
    errors.push({text:'Please add some details'});
  }
  if(!req.body.script){
    errors.push({text:'Please add a script to the video'});
  }
  if(errors.length > 0){
    res.render('ideas/create', {
      errors: errors,
      title: req.body.title,
      details: req.body.details,
      script: req.body.script,
    });
  } else {
    const newIdea = {
      title: req.body.title,
      details: req.body.details,
      script: req.body.script,
      user: req.user.id
    }
    new Idea(newIdea)
      .save()
      .then(idea => {
        req.flash('success_msg', 'Video idea updated successfully.');
        res.redirect('/ideas');
      })
  }
});

// Edit Form process
router.post('/edit/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    // new values
    idea.title = req.body.title;
    idea.details = req.body.details;
    idea.script = req.body.script;
    idea.published = req.body.script === 'Yes' ? true : false;
    idea.save()
      .then(idea => {
        req.flash('success_msg', 'Video idea updated');
        res.redirect('/ideas');
      })
  });
});

// Delete Idea
router.post('/delete/:id', ensureAuthenticated, (req, res) => {
  Idea.deleteOne({_id: req.params.id})
    .then(() => {
      req.flash('success_msg', 'Video idea removed');
      res.redirect('/ideas');
    });
});

module.exports = router;