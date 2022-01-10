// Example of how to create http web server

// import node's web server module (CommonJS) 
// equivalent to ES6 version: "import http from 'http'"
const http = require('http')
const { builtinModules } = require('module')

// hardcode for now
const entries = [
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

// create a new web sever
// the event handler is called every time a HTTP request is made to the server's address
// request is responded to with status code 200 
// content of site is returned with response.end()
const app = http.createServer((request, response) => {
    response.writeHead(200, {'Content-Type': 'text/plain'})
    response.end(JSON.stringify(entries))
})

// bind the http server to listen to HTTP requests sent to port 3001
const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)