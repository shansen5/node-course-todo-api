// const MongoClient = require( 'mongodb' ).MongoClient;
const {MongoClient, ObjectID} = require( 'mongodb' );

MongoClient.connect( 'mongodb://localhost:27017/TodoApp', (err, db) => {
  if ( err ) {
    return console.log( 'Unable to connection to mongodb server' );
  }
  console.log( 'Connected to mongodb server' );

  /*
  db.collection( 'Todos' ).deleteMany( {text: 'Eat lunch'} ).then((result) => {
    console.log( result );
  });

  db.collection( 'Todos' ).deleteOne( {text: 'Eat lunch'} ).then((result) => {
    console.log( result );
  });

  db.collection( 'Todos' ).findOneAndDelete( {completed: false} ).then((result) => {
    console.log( result );
  });
  */

  db.collection( 'Users' ).findOneAndDelete( {
    _id: new ObjectID( '58ddf24d5faccc3ca528246f')
  } ).then((result) => {
    console.log( result );
  });

  db.collection( 'Users' ).deleteMany( {
    age: 25
  } ).then((result) => {
    console.log( result );
  });

  /* 
  db.collection( 'Users' ).find( { 
    name : 'Andrew Mead' 
  }).toArray().then( (docs) => {
    console.log( JSON.stringify( docs, undefined, 2 ));
  }, ( err ) => {
    console.log( 'Unable to fetch users', err );
  });
   */
  // db.close();
});
