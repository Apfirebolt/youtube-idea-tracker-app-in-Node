const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {ensureAuthenticated} = require('../helpers/auth');

// Load Idea Model
require('../models/Idea');
const Idea = mongoose.model('ideas');

// Multer upload functions
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/')
  },
  filename(req, file, cb) {
    cb(
        null,
        `img-${Date.now()}${path.extname(file.originalname)}`
    )
  },
})

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = filetypes.test(file.mimetype)

  if (extname && mimetype) {
    return cb(null, true)
  } else {
    cb('Images only!')
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb)
  },
})

// Idea Index Page
router.get('/', ensureAuthenticated, (req, res) => {
  const fadeEffects = ['fade-up', 'fade-right', 'fade-down', 'fade-left', 'fade-up-right', 'fade-up-left']
  Idea.find({user: req.user.id})
    .lean()
    .populate('user')
    .populate('comments.commentUser')
    .sort({date:'desc'})
    .then(ideas => {
      res.render('ideas/list', {
        ideas:ideas,
        effects: fadeEffects,
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

// Get single idea
router.get('/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .populate('user')
  .lean()
  .then(idea => {
    if(idea.user._id != req.user.id){
      req.flash('error_msg', 'Not Authorized');
      res.redirect('/ideas');
    } else {
      res.render('ideas/detail', {
        idea:idea,
        effects: ['fade-right', 'fade-left']
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
    idea.title = req.body.title || idea.title;
    idea.details = req.body.details || idea.details;
    idea.script = req.body.script || idea.script;
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

// Add Idea picture
router.post('/pictures/:id', upload.single('file'), ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    // add picture to idea
    const newPicture = {
      title: req.body.title,
      description: req.body.description,
      name: req.file.filename
    }
    // Add to pictures array
    idea.pictures.unshift(newPicture);
    idea.save()
      .then(idea => {
        req.flash('success_msg', 'Picture added to idea');
        res.redirect(`/ideas/${idea._id}`);
      })
  });
});

// Get request for pictures in a form
router.get('/pictures/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .lean()
  .populate('user')
  .then(idea => {
    if(idea.user._id != req.user.id){
      req.flash('error_msg', 'Not Authorized');
      res.redirect('/ideas');
    } else {
      res.render('pictures/add', {
        idea:idea
      });
    }
  });
});

// Post a comment on an idea
router.post('/comment/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    // new comment
    const newComment = {
      commentBody: req.body.comment,
      commentUser: req.user.id
    }
    // Add to comments array
    idea.comments.unshift(newComment);

    idea.save()
      .then(idea => {
        req.flash('success_msg', 'Your comment is posted.');
        res.redirect('/ideas');
      })
  });
});

// Edit Comment GET request

router.get('/comment/:id/edit/:commentId', ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .select({ comments: {$elemMatch: {_id: req.params.commentId}}})
  .populate('user')
  .lean()
  .then(comment => {
    if(comment.user._id != req.user.id){
      req.flash('error_msg', 'Not Authorized');
      res.redirect('/ideas');
    } else {
      res.render('ideas/edit-comment', {
        comment: comment.comments[0]
      });
    }
  })
});

// Edit comment post request
router.post('/comment/:id/edit/:commentId', ensureAuthenticated, (req, res) => {
  Idea.updateOne({
    _id: request.params.id
  }, {
    $set: {
        'comments.0.commentBody': req.body.comment
    }
  }, function (err, result) {
    console.log(result)
  })
});

// Delete Comment
router.post('/comment/:id/delete/:commentId', ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    // delete comment
    idea.comments.pull({ _id:req.params.commentId })
    idea.save()
      .then(idea => {
        req.flash('success_msg', 'Your comment is removed.');
        res.redirect('/ideas');
      })
  });
});

module.exports = router;