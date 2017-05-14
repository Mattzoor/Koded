var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('snippets');
var service = {};

service.getAll = getAll;
service.getById = getById;
service.getByName = getByName;
service.create = create;
service.update = update;
service.delete = _delete;
service.getSnippets = getSnippets;
service.updateSnippet = updateSnippet;
service.saveSnippet = saveSnippet;
module.exports = service;


function getAll() {
    var deferred = Q.defer();

    db.snippets.find().toArray(function (err, snippets) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        deferred.resolve(snippets);
    });
    return deferred.promise;
}

function getById(_id) {
    var deferred = Q.defer();
    db.snippets.findOne({_id: mongo.helper.toObjectID(_id)}, function (err, snippet) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (snippet) {
            deferred.resolve(snippet);
        } else {
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function getByName(name) {
    var deferred = Q.defer();
    db.snippets.findOne({name : { '$regex': name, $options:'i'}}, function (err, snippet) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (snippet) {
            deferred.resolve(snippet);
        } else {
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function create(snippetParam) {
    var deferred = Q.defer();

    db.snippets.insert(
        snippetParam,
        function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });
    return deferred.promise;
}

function update(_id, snippetParam) {
    var deferred = Q.defer();
    console.log(_id +'      ' + snippetParam);
    // validation
    db.snippets.findById(_id, function (err, snippet) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (snippet.name !== snippetParam.name) {
            // snippet name has changed so check if the new snippet name is already taken
            db.snippets.findOne(
                {name : { '$regex': snippetParam.name, $options:'i'}},
                function (err, snippet) {
                    if (err) deferred.reject(err.name + ': ' + err.message);

                    if (snippet) {
                        // snippetname already exists
                        deferred.reject('name "' + req.body.name + '" is already taken')
                    } else {
                        updatesnippet();
                    }
                });
        } else {
            updatesnippet();
        }
    });

    function updatesnippet() {
        // fields to update
        var set = {
            name: snippetParam.name,
            teacherId: snippetParam.teacherId,
            students: snippetParam.students,
        };

        db.snippets.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();

    db.snippets.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}


function getSnippets(obj) {
    var deferred = Q.defer();
    db.snippets.find({"teacherId": obj._id}).toArray( function (err, snippets) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(snippets);
    });
    return deferred.promise;
}


function updateSnippet(_id, snippetParam) {
    var deferred = Q.defer();
    console.log(_id +'      ' + snippetParam);
    // validation
    db.snippets.findById(_id, function (err, snippet) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if(snippet){
            updatesnippet();
        }
    });

    function updatesnippet() {
        // fields to update
        var set = {
            name: snippetParam.name,
            teacherId: snippetParam.teacherId,
            code: snippetParam.code,
            feedback: snippetParam.feedback
        };

        db.snippets.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}


function saveSnippet(_id, snippetParam) {
    var deferred = Q.defer();
    console.log(_id +'      ' + snippetParam);
    // validation
    db.snippets.findById(_id, function (err, snippet) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if(snippet){
            savesnippet();
        }
    });

    function savesnippet() {
        // fields to update
        var set = {
            name: snippetParam.name,
            teacherId: snippetParam.teacherId,
            code: snippetParam.code,
            feedback: snippetParam.feedback
        };

        db.snippets.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}