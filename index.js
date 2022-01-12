// Example of how to create web server using express

const express = require('express')
// Morgan is used for logging
const morgan = require('morgan')
const app = express()
// cors library prevents CORS error when linking frontend to backend
const cors = require('cors')
// Ensure that the environment variables from the .env file are available globally
require('dotenv').config()
const Entry = require('./models/entry')

// Use middlewares

// For deployment:
// Whenever express gets and HTTP request it will first check if the build
// directory contains a file corresponding to the request's address
// if a correct file is found, express will return it
app.use(express.static('build'))
app.use(cors())
// Activate the json-parser (middleware):
// Without this, request.body is undefined. The json-parser takes the JSON data of a request, 
// transforms it to a Javscript object, and attaches it to the |body| property of a request object, 
// before the route handler is called
app.use(express.json())

// Implement my own middlewares:

// Express error handlers are middleware that are defined with a function
// that accepts four parameters
const errorHandler = (error, request, response, next) => {
    // TIP: when dealing with promises, always add error and exception handling
    // and print the object that caused the exception to the console
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    } 
    else if (error.name === 'ValidationError') {
        return response.status(400).send({error: error.message})
    }

    next(error)
}

// const requestLogger = (request, response, next) => {
//     console.log('Method: ', request.method)
//     console.log('Path:   ', request.path)
//     console.log('Body:   ', request.body)
//     console.log('---')
    
//     // yield control to next middleware
//     next()
// }

// note we add this middleware AFTER the routes. It is only called
// if none of the routes are called, so it catches unknown requests
const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

// create own morgan token and use it
// note "app.use(morgan('tiny'))" is useful too
morgan.token('data', (request, response) => {
    return JSON.stringify(request.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
// app.use(requestLogger)
// This has to be the last loaded middleware
app.use(errorHandler)

// Routes:

// Define an event handler to handle HTTP GET requests to app's root
// |request| contains all the info of the HTTP request
// |response| defines how the request is responded to
app.get('/', (request, response) => {
    // Content-Type is automatically set to 'text/html'
    // status code of response defaults to 200
    response.send('<h1>Hello world!</h1>')
})

// Defines event handler to handle HTTP requests to the entries path
app.get('/api/entries', (request, response) => {
    // Content-Type is automatically set to 'application/json'
    Entry.find({}).then(entries => {
        response.json(entries)
    })
})

app.get('/info', (request, response) => {
    Entry.find({}).then(entries => {
        response.send(`<div>
            Phonebook has info for ${entries.length} people
            </div>
            <div>
            ${new Date()}
            </div>`)
    })
})

app.get('/api/entries/:id', (request, response, next) => {
    // Mongoose's findById method is used to get an individual entry
    Entry.findById(request.params.id)
        .then(entry => {
            entry ? response.json(entry) : response.status(404).end()
        })
        // Event handler passes error forward with the next function
        // If next was called without a parameter, it would simply move 
        // to the next route or middleware. If the next function is called
        // with a parameter, the execution will continue to the error handler middleware
        .catch(error => next(error))
})

app.delete('/api/entries/:id', (request, response, next) => {

    Entry.findByIdAndRemove(request.params.id)
        .then(() => {
            // note no data is returned with the response
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/entries', (request, response, next) => {
    const body = request.body

    // if (!body.name) {
    //     return response.status(400).json({error: 'name missing'})
    // }
    // if (!body.number) {
    //     return response.status(400).json({error: 'number missing'})
    // }

    const entry = new Entry({
        name: body.name,
        number: body.number
    })

    // The response is sent inside of the callback function for the save operation. 
    // This ensures that the response is sent only if the operation succeeded.
    // The data sent back in the response is the new entry, formatted with the toJSON method
    entry.save()
        // Mongoose returns a savedEntry object and we format it
        // (note this is just to illustrate promise chaining and is not needed here)
        .then(savedEntry => {
            return savedEntry.toJSON()
        })
        // The then method of a promise also returns a promise
        .then(savedAndFormattedEntry => {
            response.json(savedAndFormattedEntry)
        })
        .catch(error => next(error))

    // Multiple then methods is an example of promise chaining
    // It does not provide much benefit here, but it is useful
    // when many asynchronous operations need to be done in sequence.
})

app.put('/api/entries/:id', (request, response, next) => {
    const body = request.body

    const entry = {
        name: body.name,
        number: body.number
    }

    // { new: true } is required so that the event handler is called with 
    // the new modified document instead of the original
    Entry.findByIdAndUpdate(request.params.id, entry, { new: true })
        .then(updatedNote => {
            response.json(updatedNote)
        })
        .catch(error => next(error))
})

// Must be loaded after routes!
app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})