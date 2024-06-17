const mongoose = require("mongoose");

const password = process.argv[2];

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const url = `mongodb+srv://edghartapia:${password}@persons.sovcyqe.mongodb.net/AgendaTelefonica?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

const person = new Person({
  name: process.argv[3], // Exercise 3.11
  number: process.argv[4], // Exercise 3.11
});

person.save().then((result) => {
  console.log("person saved");
  mongoose.connection.close();
});

Person.find({}).then((result) => {
  result.forEach((person) => {
    console.log(person);
  });
  mongoose.connection.close();
});
