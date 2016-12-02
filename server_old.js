var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var _ = require('underscore');

var PORT = process.env.PORT || 3000;

var todos = [{
	id: 1,
	description: 'Lunch meeting',
	completed: false
}, {
	id: 2,
	description: 'Pick up meet',
	completed: false
}, {
	id: 3,
	description: 'Put out Trash',
	completed: true
}];

var todoNextId = 4;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('ToDo API Root');
});

//GET Todos?completed=true&q=description
app.get('/todos', function(req, res) {
	var queryParams = req.query;
	var filteredTodos = todos;
	var completedParam;

	//console.log(queryParams);

	if (queryParams.hasOwnProperty('completed') && _.isString(queryParams.completed) && queryParams.completed.trim().length > 0) {
		completedParam = queryParams.completed;
	}

	if (queryParams.hasOwnProperty('q') && queryParams.q.trim().length > 0) {

		filteredTodos = _.filter(filteredTodos, function(todo) {
			return todo.description.indexOf(queryParams.q) > -1;
		});
	}

	if (completedParam === 'true') {
		filteredTodos = _.where(filteredTodos, {
			completed: true
		});
	} else if (completedParam === 'false') {
		filteredTodos = _.where(filteredTodos, {
			completed: false
		});
	}

	res.send(filteredTodos);
});

//GET specific Todos
app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedId = _.findWhere(todos, {
		id: todoId
	});
	/*
	for (var i=0 ; i < todos.length ; i++) {
		if (typeof todoId === 'string' && Number(todoId) === todos[i].id) {
			matchedId = todos[i];
		} 
	}
	*/

	if (matchedId) {
		res.send(matchedId);
	} else {
		res.status(404).send();
	}

});

//POST
app.post('/todos', function(req, res) {
	var body = req.body;
	var accceptedBody;

	if (!_.isBoolean(body.completed) || !_.isString(body.description) ||
		body.description.trim().length === 0) {
		return res.status(400).send();
	}

	accceptedBody = _.pick(body, 'description', 'completed');

	accceptedBody['id'] = todoNextId++;
	accceptedBody.description = body.description.trim();

	todos.push(accceptedBody);

	res.json(accceptedBody);
});

//DELETE
app.delete('/todos/:id', function(req, res) {
	var toDeleteId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: toDeleteId
	});

	if (matchedTodo) {
		todos = _.without(todos, matchedTodo);
		res.send(matchedTodo)
	} else {
		res.status(404).json({
			"error": "No matching id"
		});
	}
});

//PUT
app.put('/todos/:id', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});

	var validAttributes = {};

	if (!matchedTodo) {
		return res.status(404).send();
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).send();
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	}

	_.extend(matchedTodo, validAttributes);

	res.json(matchedTodo);

});

app.listen(PORT, function() {
	console.log('Express listening on port ' + PORT);
});