var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

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
	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('completed')) {
		if (query.completed === 'true') {
			where.completed = true;
		} else if (query.completed === 'false') {
			where.completed = false;
		}
	} 

	if (query.hasOwnProperty('q') && query.q.trim().length > 0) {
		where.description = {
					$like: '%'+query.q.trim()+'%'
				};
	}
	console.log(where);

	db.todo.findAll({where: where}).then (function(todos) {
		res.send(todos);
	}).catch (function (e) {
		res.status(500).send();
	});

});

//GET specific Todos
app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.findById(todoId).then(function (todo){
		if (!!todo) { //Boolean true
			res.send(todo.toJSON());
		} else {
			res.status(404).send();
		}
	}, function (e) {
		res.status(500).send();
	});
});

//POST
app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function (todo) {
		res.json(todo.toJSON());
	}).catch(function (e) {
		res.status(400).json(e);
	});

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

//Sync up DB
db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT);
	});
});
