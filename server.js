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
			$like: '%' + query.q.trim() + '%'
		};
	}

	db.todo.findAll({
		where: where
	}).then(function(todos) {
		res.send(todos);
	}).catch(function(e) {
		res.status(500).send();
	});

});

//GET specific Todos
app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.findById(todoId).then(function(todo) {
		if (!!todo) { //Boolean true
			res.send(todo.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).send();
	});
});

//POST
app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function(todo) {
		res.json(todo.toJSON());
	}).catch(function(e) {
		res.status(400).json(e);
	});

});

//DELETE
app.delete('/todos/:id', function(req, res) {
	var toDeleteId = parseInt(req.params.id, 10);
	var where = {};
	where.id = toDeleteId;

	db.todo.destroy({
		where: where
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				"error": "Not found with id"
			});
		} else {
			res.status(204).json({
				"success": rowsDeleted + " items deleted"
			});
		}

	}).catch(function(e) {
		res.status(500).send();
	});
});

//PUT
app.put('/todos/:id', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');
	var todoId = parseInt(req.params.id, 10);

	var attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.findById(todoId).then(function(todo) {
		if (todo) {
			todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());
			}, function(e) {
				res.status(400).json(e);
			});

		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	});

});

//Users functions
//Users POST
app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function(user) {
		res.json(user.toJSON());
	}).catch(function(e) {
		res.status(400).json(e);
	});

});


//Sync up DB
db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT);
	});
});