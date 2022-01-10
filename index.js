// Example of how to create web server using express

// import |express| which is a function to create an express application
const express = require('express')
const morgan = require('morgan')

// cors library prevents CORS error when linking frontend to backend
const cors = require('cors')

const app = express()

app.use(cors())

// for deployment
// whenever express gets and HTTP request it will first check if the build
// directory contains a file corresponding to the request's address
// if a correct file is found, express will return it
app.use(express.static('build'))

let entries = [
    {
        id: 1,
        name: 'Bill',
        number: 12345
    },
    {
        id: 2,
        name: 'Harriet',
        number: 345467
    },
    {
        id: 3,
        name: 'Luke',
        number: 456735
    },
]


// implement our own middleware
const requestLogger = (request, response, next) => {
    console.log('Method: ', request.method)
    console.log('Path:   ', request.path)
    console.log('Body:   ', request.body)
    console.log('---')
    
    // yield control to next middleware
    next()
}

// note we add this middleware AFTER the routes. It is only called
// if none of the routes are called, so it catches unknown requests
const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

// activate the json-parser (middleware)
// without this, request.body is undefined
// the json-parser takes the JSON data of a request, 
// transforms it to a Javscript object, and attaches
// it to the |body| property of a request object, 
// before the route handler is called
app.use(express.json())

// create own morgan token and use it
// note "app.use(morgan('tiny'))" is useful too
morgan.token('data', (request, response) => {
    return JSON.stringify(request.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
// app.use(requestLogger)


const generateId = () => {
    const maxId = entries.length > 0
        ? Math.max(...entries.map(entry => entry.id))
        : 0
    return maxId + 1
}

// first route: define an event handler to handle HTTP GET requests to app's root
// |request| contains all the info of the HTTP request
// |response| defines how the request is responded to
app.get('/', (request, response) => {
    // Content-Type is automatically set to 'text/html'
    // status code of response defaults to 200
    response.send('<h1>Hello world!</h1>')
})

// second route: defines event handler to handle HTTP requests to the entries path
app.get('/api/entries', (request, response) => {
    // Content-Type is automatically set to 'application/json'
    response.json(entries)
})

app.get('/info', (request, response) => {
    response.send(`
        <div>
        Phonebook has info for ${entries.length} people
        </div>
        <div>
        ${new Date()}
        </div>`)
})

app.get('/api/entries/:id', (request, response) => {
    const id = Number(request.params.id)
    const entry = entries.find(note => note.id === id)

    if (entry) {
        response.json(entry)
    } else {
        response.status(404).end()
    }

})

app.delete('/api/entries/:id', (request, response) => {
    const id = Number(request.params.id)
    entries = entries.filter(entry => entry.id !== id)

    // note no data is returned with the response
    response.status(204).end()
})

app.post('/api/entries', (request, response) => {
    const body = request.body
    if (!body.name) {
        return response.status(400).json({
            error: 'name mising'
        })
    }
    if (!body.number) {
        return response.status(400).json({
            error: 'number mising'
        })
    }
    if (entries.find(entry => entry.name === body.name)) {
        return response.status(400).json({
            error: 'name already in phonebook'
        })
    }
    
    const entry = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    entries = entries.concat(entry)

    response.json(entry)
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})