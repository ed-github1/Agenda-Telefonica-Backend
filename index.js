const express = require("express");
const morgan = require("morgan");
const app = express();

app.use(express.json());

// Exercise 3.7
app.use(morgan("tiny"));

// Exercise 3.8
morgan.token("body", (req, res) => JSON.stringify(req.body));
app.use(
  morgan(":method :url :status :response-time ms - :res[content-length] :body")
);

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (request, response) => {
  response.send("<h1>Hello World</h1>");
});

app.get("/info", (request, response) => {
  const actualDate = new Date().toDateString();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  response.send(`
    <div>
       <h2>Phonebook has info for ${persons.length} persons</h2>
    </div>
    <div>
       <p>${actualDate} <br>${timeZone}</br></p>
    </div>`);
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0;
  return maxId + 1;
};

app.post("/api/persons/", (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({ error: "name missing" });
  }

  if (!body.number) {
    return response.status(400).json({ error: "number missing" });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };

  persons.forEach((p) => {
    if (p.name === person.name) {
      return response.status(400).json("this name already exists in phonebook");
    }
  });

  persons = persons.concat(person);
  response.json(person);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
