var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('classrooms');

var service = {};

service.getAll = getAll;
service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;

module.exports = service;

function getAll() {
    var deferred = Q.defer();

    db.classrooms.find().toArray(function (err, classrooms) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        // return classrooms (without hashed passwords)
        classrooms = _.map(classrooms, function (classroom) {
            return _.omit(classroom, 'hash');
        });

        deferred.resolve(classrooms);
    });

    return deferred.promise;
}

function getById(_id) {
    var deferred = Q.defer();

    db.classrooms.findById(_id, function (err, classroom) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (classroom) {
            // return classroom (without hashed password)
            deferred.resolve(_.omit(classroom, 'hash'));
        } else {
            // classroom not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function create(classroomParam) {
    var deferred = Q.defer();

    // validation
    db.classrooms.findOne(
        { name: classroomParam.name },
        function (err, classroom) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (classroom) {
                // classroomname already exists
                deferred.reject('name "' + classroomParam.name + '" is already taken');
            } else {
                createclassroom();
            }
        });

    function createclassroom() {

        db.classrooms.insert(
            classroom,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function update(_id, classroomParam) {
    var deferred = Q.defer();

    // validation
    db.classrooms.findById(_id, function (err, classroom) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (classroom.name !== classroomParam.name) {
            // classroom name has changed so check if the new classroom name is already taken
            db.classrooms.findOne(
                { name: classroomParam.name },
                function (err, classroom) {
                    if (err) deferred.reject(err.name + ': ' + err.message);

                    if (classroom) {
                        // classroomname already exists
                        deferred.reject('name "' + req.body.name + '" is already taken')
                    } else {
                        updateclassroom();
                    }
                });
        } else {
            updateclassroom();
        }
    });

    function updateclassroom() {
        // fields to update
        var set = {
            name: classroomParam.name,
            teacherId: classroomParam.teacherId,
            students: classroomParam.students,
        };

        db.classrooms.update(
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

    db.classrooms.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}