var express = require('express');
var app = express();
var bodyParser  = require('body-parser');
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
	}
];

var todoNextId = 4;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('ToDo API Root');
});

//GET Todos
app.get('/todos', function(req, res) {
	
	res.send(todos);
});

//GET specific Todos
app.get('/todos/:id', function(req,res) {
	var todoId = parseInt(req.params.id,10);
	var matchedId = _.findWhere(todos, {id : todoId});
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
app.post('/todos', function (req, res) {
	var body = req.body;
	var accceptedBody;

	if (!_.isBoolean(body.completed) || !_.isString(body.description) ||
			body.description.trim().length === 0) {
		return res.status(400).send();
	}

	accceptedBody = _.pick(body,'description','completed');

	accceptedBody['id'] = todoNextId++;
	accceptedBody.description = body.description.trim();

	todos.push(accceptedBody);

	res.json(accceptedBody);
});

//DELETE
app.delete('/todos/:id', function(req, res) {
	var toDeleteId = parseInt(req.params.id,10);
	var matchedTodo = _.findWhere(todos,{id : toDeleteId});

	if (matchedTodo) {
		todos = _.without(todos, matchedTodo);
		res.send(matchedTodo)	
	} else {
		res.status(404).json({"error":"No matching id"});
	}



});

app.listen(PORT, function () {
	console.log('Express listening on port ' + PORT);
});















