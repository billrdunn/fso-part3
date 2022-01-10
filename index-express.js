// Example of how to create web server using express

// import |express| which is a function to create an express application
const express = require('express')
const app = express()

// activate the json-parser
// without this, request.body is undefined
// the json-parser takes the JSON data of a request, 
    // transforms it to a Javscript object, and attaches
    // it to the body property of a request object, 
    // before the route handler is called
app.use(express.json())

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

    console.log('request.headers :>> ', request.headers);
    response.json(entry)
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})