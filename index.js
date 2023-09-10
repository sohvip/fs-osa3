const express = require('express')
const fetch = require('node-fetch')
const morgan = require('morgan')
const app = express()

app.use(express.json())

morgan.token('person', (request) => {
    if (request.method === 'POST') {
        return JSON.stringify(request.body)
    }
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'))

let persons = [
  { 
    "name": "Arto Hellas", 
    "number": "040-123456",
    "id": 1
  },
  { 
    "name": "Ada Lovelace", 
    "number": "39-44-5323523",
    "id": 2
  },
  { 
    "name": "Dan Abramov", 
    "number": "12-43-234345",
    "id": 3
  },
  { 
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122",
    "id": 4
  }
]

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.get('/info', async (request, response) => {
    const getPersons = await fetch('http://localhost:3001/api/persons')
    const personsData = await getPersons.json()
    const amount = personsData.length
    const currentDate = new Date()
    const dateOptions = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZoneName: 'long'
    }
    const dateFormatted = new Intl.DateTimeFormat('en-GB', dateOptions).format(currentDate)
    response.send(`<p>Phonebook has info for ${amount} people</p>${dateFormatted}<p>`)
})

app.post('/api/persons', (request, response) => {
    const generateId = Math.floor(Math.random() * 10000)
    console.log(generateId)
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'content missing'
        })
    } else if (persons.find(person => person.name === body.name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId
    }
    persons.concat(person)
    response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
