// const MongoClient = require( 'mongodb' ).MongoClient;
const {MongoClient, ObjectID} = require( 'mongodb' );

MongoClient.connect( 'mongodb://localhost:27017/TodoApp', (err, db) => {
  if ( err ) {
    return console.log( 'Unable to connection to mongodb server' );
  }
  console.log( 'Connected to mongodb server' );

  db.collection( 'Users' ).updateMany( {
    name: /^Fr/
  }, {
    $inc: {
      age: 6
    }
  }).then((result) => {
    console.log( result );
  });

  // db.close();
});
