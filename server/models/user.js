const mongoose = require( 'mongoose' );
const validator = require( 'validator' );
const jwt = require( 'jsonwebtoken' );
const _ = require( 'lodash' );
const bcrypt = require( 'bcrypt' );

var UserSchema = new mongoose.Schema( {
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

UserSchema.methods.toJSON = function() {
  var user = this;
  var userObject = user.toObject();
  return _.pick( userObject, [ '_id', 'name', 'email' ]);
};

UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign( {
    _id: user._id.toHexString(),
    access
  }, 'secret_salt' ).toString();
  user.tokens.push( { access, token });

  return user.save().then( () => {
    return token;
  });
};

UserSchema.statics.findByToken = function( token ) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify( token, 'secret_salt' );
  } catch ( e ) {
    return Promise.reject( 'AuthenticationError' );
  };
  return User.findOne( {
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

UserSchema.statics.findByCredentials = function( email, password ) {
  var User = this;
  return User.findOne( {email} ).then( (user) => {
    if ( !user ) {
      return Promise.reject( 'AuthenticationError' );
    }

    return new Promise( (resolve, reject) => {
      bcrypt.compare( password, user.password, (err, result) => {
        if ( !result ) {
          reject( err );
        }
        resolve( user );
      });
    });
  });
};

UserSchema.pre( 'save', function( next ) {
  var user = this;
  if ( user.isModified( 'password' )) {
    bcrypt.genSalt( 10, (err, salt) => {
      bcrypt.hash( user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

var User = mongoose.model( 'User', UserSchema );

module.exports = {User};
