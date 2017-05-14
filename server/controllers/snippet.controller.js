var config = require('config.json');
var express = require('express');
var router = express.Router();
var snippetService = require('services/snippet.service');

// routes
router.post('/create', create);
router.get('/', getAll);
router.get('/current', getCurrent);
router.put('/:_id', update);
router.delete('/:_id', _delete);
router.get('/:_id', getById);
router.get('/name/:name', getByName);
router.get('/getSnippets/:_id', getSnippets);
router.put('/updateSnippet/:_id', updateSnippet);

module.exports = router;

function getById(req, res) {
    snippetService.getById(req.params._id)
        .then(function (snippet) {
            if (snippet) {
                //console.log(user);
                res.send(snippet);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}


function getByName(req, res) {
    snippetService.getByName(req.params.name)
        .then(function (snippet) {
            if (snippet) {
                res.send(snippet);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function create(req, res) {
    snippetService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        }); 
}

function getAll(req, res) {
    snippetService.getAll()
        .then(function (snippet) {
            res.send(snippet);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCurrent(req, res) {
    snippetService.getById(req.snippet.sub)
        .then(function (snippet) {
            if (snippet) {
                res.send(snippet);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function update(req, res) {
    snippetService.update(req.params._id, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function _delete(req, res) {
    snippetService.delete(req.params._id)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getSnippets(req, res) {
    snippetService.getSnippets(req.params)
        .then(function (snippets) {
            if (snippets) {
                res.send(snippets);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateSnippet(req, res) {
    snippetService.updateSnippet(req.params._id, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}