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

  //Exercises 3.18
  Person.find({}).then((persons) =>
    response.send(`
    <div>
       <h2>Phonebook has info for ${persons.length} persons</h2>
    </div>
    <div>
       <p>${actualDate} <br>${timeZone}</br></p>
    </div>`)
  );
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.post("/api/persons/", (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({ error: "name missing" });
  }

  if (!body.number) {
    return response.status(400).json({ error: "number missing" });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
    //id: generateId(),
  });

  persons.forEach((p) => {
    if (p.name === person.name) {
      return response.status(400).json("this name already exists in phonebook");
    }
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });

  persons = persons.concat(person);
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => {
      next(error);
    });
});

//Exercises 3.15

app.delete("/api/persons/:id", (request, response) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => {
      next(error);
    });

  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

//Exercises 3.17
app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

//Exercises 3.16

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

//Exercises 3.16

const errorHandler = (error, request, response, next) => {
  console.log(error.message);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted Id" });
  }
  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
