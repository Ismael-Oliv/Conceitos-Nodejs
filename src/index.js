const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "customer not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const UserAlreadyExist = users.some((user) => 
    user.username === username
  );

  if (UserAlreadyExist) {
    return response.status(400).send({ error: "Mensagem do erro" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user)
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const ExistUser = users.find(usuario=> usuario.username === user.username)
  return response.json(ExistUser.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).send(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params

  const Todo = user.todos.find(todo => todo.id === id)
  if (!Todo) {
    return response.status(404).send({ error: "Mensagem do erro" });
  }

  Todo.title = title;
  Todo.deadline = new Date(deadline);

  return response.json(Todo);

});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const {user}  = request
  const { id } = request.params

  const todo = user.todos.find(todo => todo.id === id)

  if(!todo){
    return response.status(404).json({error: "Todo not found"})
  }

  todo.done = true

  return response.json(todo)

});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todo = user.todos.find(todo => todo.id === id)

  if(!todo){
    return response.status(404).json({
      error: "Todo not found"
    })
  }

  const newTodo = user.todos.filter(user => user.id !== id)

  user.todos = newTodo

  return response.status(204).send()
});

module.exports = app;
