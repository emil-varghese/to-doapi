var express = require('express');
var app = express();
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
]


app.get('/', function(req, res) {
	res.send('ToDo API Root');
});

//GET Todos
app.get('/todos', function(req, res) {
	console.log('Inside todos');
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

app.listen(PORT, function () {
	console.log('Express listening on port ' + PORT);
});