// const MongoClient = require( 'mongodb' ).MongoClient;
const {MongoClient, ObjectID} = require( 'mongodb' );

MongoClient.connect( 'mongodb://localhost:27017/TodoApp', (err, db) => {
  if ( err ) {
    return console.log( 'Unable to connection to mongodb server' );
  }
  console.log( 'Connected to mongodb server' );

  /* */
  db.collection( 'Users' ).find( { 
    name : 'Andrew Mead' 
  }).toArray().then( (docs) => {
    console.log( JSON.stringify( docs, undefined, 2 ));
  }, ( err ) => {
    console.log( 'Unable to fetch users', err );
  });
  /* */
  /*
  db.collection( 'Todos' ).find( { completed : false } ).toArray().then( (docs) => {
  db.collection( 'Todos' ).find( { 
    _id: new ObjectID( '58dea7ef9e11bcf5b7293a94' ) 
  }).toArray().then( (docs) => {
    console.log( JSON.stringify( docs, undefined, 2 ));
  }, ( err ) => {
    console.log( 'Unable to fetch todos', err );
  });
  */
  /**/
  db.collection( 'Todos' ).find({
    completed: false
  }).count().then( (count) => {
    console.log( `Todos count: ${count}` );
  }, ( err ) => {
    console.log( 'Unable to fetch todos', err );
  });
  /**/
  // db.close();
});
