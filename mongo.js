// This file has been split into multiple files so is now redundant!
// But it's useful to make files like these when developing

const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://billrdunn:${password}@cluster0.dv6cc.mongodb.net/phonebook-app?retryWrites=true&w=majority`

mongoose.connect(url)

// Define the scheme for an entry
// tells mongoose how entry objects are to be stored in the database
const entrySchema = new mongoose.Schema({
  name: String,
  number: String,
})

// ... with a matching model
// Models are constructors
// this constructor (Entry) also includes methods to save to the database
const Entry = mongoose.model('Entry', entrySchema)

// Note that document databases like Mongo are schemaless,
// meaning the database does not casre about the structure of its data.
// It is possible to store documents with completely different fields
// in the same collection.

// Mongoose allows us to define a schema at the applicaion level that
// defines the shape of documents stored in the collection

if (process.argv.length === 3) {
  // Objects are retrived from the database with the find method of the entry model
  // as we are using {}, we get all the entries
  // could do: "Entry.find({name: Bill}).then(result => {...})
  Entry.find({}).then((result) => {
    console.log('Current entries in phonebook:')
    result.forEach((entry) => {
      console.log(entry)
    })
    console.log('---\n')
    mongoose.connection.close()
  })
} else {
  const entry = new Entry({
    name: process.argv[3],
    number: process.argv[4],
  })

  // The result of the save method is in |result|
  entry.save().then((result) => {
    console.log(`Added ${entry.name} ${entry.number} to phonebook`)

    // Must close connection to finish program execution
    mongoose.connection.close()
  })
}
