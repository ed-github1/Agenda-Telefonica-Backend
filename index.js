require("dotenv").config();

const express = require("express");
const morgan = require("morgan");

const app = express();
const Person = require("./models/person");
app.use(express.json());
app.use(express.static("dist"));

app.use(morgan("tiny"));

morgan.token("body", (req, res) => JSON.stringify(req.body));
app.use(
  morgan(":method :url :status :response-time ms - :res[content-length] :body")
);

let persons = [];

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
  Person.find({}).then((persons) => {
    response.json(persons);
  });
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

  const person =  new Person({
    name: body.name,
    number: body.number,
    id: generateId(),
  });

  persons.forEach((p) => {
    if (p.name === person.name) {
      return response.status(400).json("this name already exists in phonebook");
    }
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  })

  persons = persons.concat(person);
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id),then(person => 
    response.json(persons)
  )
   
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
