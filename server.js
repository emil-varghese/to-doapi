var express = require('express');
var app = express();
var bodyParser  = require('body-parser');
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
	var todoId = req.params.id;
	var matchedId;

	for (var i=0 ; i < todos.length ; i++) {
		if (typeof todoId === 'string' && Number(todoId) === todos[i].id) {
			matchedId = todos[i];
		} 
	}

	if (matchedId) {
		res.send(matchedId);
	} else {
		res.status(404).send();
	}

});

//POST
app.post('/todos', function (req, res) {
	var body = req.body;

	body['id'] = todoNextId++;
	//body.id = todoNextId++;
	todos.push(body);

	res.json(body);
});

app.listen(PORT, function () {
	console.log('Express listening on port ' + PORT);
});















