const mongoose = require('mongoose')
// Include 3rd-party validator
const uniqueValidator = require('mongoose-unique-validator')

const url = process.env.MONGODB_URI

console.log('Connecting to', url)

mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB', error.message)
  })

const entrySchema = new mongoose.Schema({
  // "required" is a built-in validator provided by Mongoose
  // Can also create custom validators
  name: {
    type: String,
    minLength: 3,
    required: true,
    unique: true,
  },
  number: {
    type: String,
    minLength: 5,
    required: true,
    unique: true,
  },
})
entrySchema.plugin(uniqueValidator)

// Modify the toJSON() method of the schema,
// which is used on all instances of models with this schema
// Note that even though _id property looks like a string, it's actually an object
entrySchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

// The public interface of the module is defined by setting a value to the module.exports variable.
// We will set the value to be the Note model. The other things defined inside of the module,
// like the variables mongoose and url will not be accessible or visible to users of the module.
module.exports = mongoose.model('Entry', entrySchema)
