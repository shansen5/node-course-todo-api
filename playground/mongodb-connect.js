// const MongoClient = require( 'mongodb' ).MongoClient;
const {MongoClient, ObjectID} = require( 'mongodb' );

MongoClient.connect( 'mongodb://localhost:27017/TodoApp', (err, db) => {
  if ( err ) {
    return console.log( 'Unable to connection to mongodb server' );
  }
  console.log( 'Connected to mongodb server' );
  db.collection( 'Users' ).insertOne( {
    name: 'Andrew Mead',
    age: 25,
    location: 'Philadelphia'
  }, (err, result) => {
    if ( err ) {
      return console.log( 'Unable to insert user', err );
    }
    console.log( JSON.stringify( result.ops, undefined, 2 ));
  });
  db.close();
});
