const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

async function migrate() {
  const localUri = 'mongodb://localhost:27017/prepster';
  // Adding the database name 'prepster' to the Atlas URI
  const atlasUri = 'mongodb+srv://dinzsoftwares_db_user:cKB7TkiaYcVDsk94@cluster0prepster.gsmpyba.mongodb.net/prepster?appName=Cluster0prepster';

  const localClient = new MongoClient(localUri);
  const atlasClient = new MongoClient(atlasUri);

  try {
    console.log('Connecting to local MongoDB...');
    await localClient.connect();
    console.log('Connected to local MongoDB.');

    console.log('Connecting to Atlas MongoDB...');
    await atlasClient.connect();
    console.log('Connected to Atlas MongoDB.');

    const localDb = localClient.db();
    const atlasDb = atlasClient.db();

    // Get all collections from local DB
    const collections = await localDb.listCollections().toArray();
    
    for (let colInfo of collections) {
      const colName = colInfo.name;
      // Skip system collections if any
      if (colName.startsWith('system.')) continue;
      
      console.log(`\nMigrating collection: ${colName}`);
      
      const localCol = localDb.collection(colName);
      const atlasCol = atlasDb.collection(colName);

      // Fetch all documents from local collection
      const docs = await localCol.find({}).toArray();
      
      if (docs.length > 0) {
        // Clear existing data in atlas to avoid duplicate key errors on _id
        console.log(`Clearing existing data in Atlas for ${colName}...`);
        await atlasCol.deleteMany({});
        
        // Insert docs into Atlas
        console.log(`Inserting ${docs.length} documents into Atlas ${colName}...`);
        await atlasCol.insertMany(docs);
        console.log(`Successfully migrated ${colName}.`);
      } else {
        console.log(`Collection ${colName} is empty. Skipping.`);
      }
    }
    
    console.log('\nMigration completed successfully!');

  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await localClient.close();
    await atlasClient.close();
  }
}

migrate();
