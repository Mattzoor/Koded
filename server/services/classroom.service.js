var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('classrooms');
db.bind('users');

var service = {};


service.authenticate = authenticate;
service.getAll = getAll;
service.getById = getById;
service.create = create;
//service.update = update;
service.delete = _delete;
service.getByTeacherId = getByTeacherId;
service.getByStudentId = getByStudentId;
service.sendReq = sendReq;
service.getReq = getReq;

module.exports = service;

function authenticate(_id) {
    var deferred = Q.defer();

    db.classrooms.findOne({_id: mongo.helper.toObjectID(_id)}, function (err, classroom) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (classroom) {
            // authentication successful
            deferred.resolve({
                _id: classroom._id,
                roomName: classroom.roomName,
                teacherId: classroom.teacherId
            });
        } else {
            // authentication failed
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function getAll() {
    var deferred = Q.defer();

    db.classrooms.find().toArray(function (err, classrooms) {
        if (err) deferred.reject(err.roomName + ': ' + err.message);

        deferred.resolve(classrooms);
    });
    console.log(deferred.promise);
    return deferred.promise;
}

function getById(_id) {
    var deferred = Q.defer();

    db.classrooms.findById(_id, function (err, classroom) {
        if (err) deferred.reject(err.roomName + ': ' + err.message);

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
        {roomName : { '$regex': classroomParam.roomName, $options:'i'}},
        function (err, classroom) {
            if (err) deferred.reject(err.roomName + ': ' + err.message);

            if (classroom) {
                // classroomname already exists
                deferred.reject('roomName "' + classroomParam.roomName + '" is already taken');
            } else {
                createClassroom();
            }
        });

    function createClassroom() {
        db.classrooms.insert(
            classroomParam,
            function (err, doc) {
                if (err) deferred.reject(err.roomName + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}
/*
function update(_id, classroomParam) {
    var deferred = Q.defer();
    console.log(_id +'      ' + classroomParam);
    // validation
    db.classrooms.findById(_id, function (err, classroom) {
        if (err) deferred.reject(err.roomName + ': ' + err.message);

        if (classroom.roomName !== classroomParam.roomName) {
            // classroom roomName has changed so check if the new classroom roomName is already taken
            db.classrooms.findOne(
                {roomName : { '$regex': classroomParam.roomName, $options:'i'}},
                function (err, classroom) {
                    if (err) deferred.reject(err.roomName + ': ' + err.message);

                    if (classroom) {
                        // classroomname already exists
                        deferred.reject('roomName "' + req.body.roomName + '" is already taken')
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
            roomName: classroomParam.roomName,
            teacherId: classroomParam.teacherId,
            students: classroomParam.students,
        };

        db.classrooms.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.roomName + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}
*/

function _delete(_id) {
    var deferred = Q.defer();

    db.classrooms.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.roomName + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}

//Specific Methods
function getByTeacherId(obj) {
    var deferred = Q.defer();
    db.classrooms.find({"teacherId": obj.teacherId}).toArray( function (err, classrooms) {
        if (err) deferred.reject(err.roomName + ': ' + err.message);
        deferred.resolve(classrooms);
    });
    return deferred.promise;
}

function getByStudentId(obj) {
    var deferred = Q.defer();
    /*db.classrooms.find({"teacherId": obj.teacherId}).toArray( function (err, classrooms) {
        if (err) deferred.reject(err.roomName + ': ' + err.message);
        deferred.resolve(classrooms);
    });*/
    return deferred.promise;
}

function sendReq(roomName, studentParam){
    
    var deferred = Q.defer();
    // validation
    db.classrooms.findOne({ "roomName" : { '$regex': roomName.roomName, $options:'i'}}, function (err, classroom) {
        if (err) deferred.reject(err.roomName + ': ' + err.message);

        if(classroom){
            sendReqToRoom(classroom);
        }
    });

    function sendReqToRoom(classroom) {
        // fields to update
        var set = {
            roomName: classroom.roomName,
            teacherId: classroom.teacherId,
            students: [],
            pendingReq: []
        };

        if(classroom.students != null){
            set.students = classroom.students;
        }

        if(classroom.pendingReq != null){                
            set.pendingReq = classroom.pendingReq;
            
        }
        if(set.pendingReq.indexOf(studentParam._id) == -1){
            set.pendingReq.push(studentParam._id);
        }
            

        db.classrooms.update(
            { _id: mongo.helper.toObjectID(classroom._id) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.roomName + ': ' + err.message);

                deferred.resolve();
            });
    }
    return deferred.promise;
}

function getReq(_id){
    var deferred = Q.defer();

    db.classrooms.findOne({ _id: mongo.helper.toObjectID(_id._id)}, function (err, classroom) {
        if (err) deferred.reject(err._id + ': ' + err.message);
        
        if(classroom){
            getReqToRoom(classroom);
        }
    });
    function getReqToRoom(classroom) {
        
        var pendingReq = [];
        var pendingStud = [];
        // fields to update
        if(classroom.pendingReq != null){                
            pendingReq = classroom.pendingReq;
            pendingStud = new Array();
        }
        
        console.log();
        pendingReq.forEach(function(_id){
            
            //pendingStud.push(hej);
            var hej = {};
            db.users.findOne({ _id: mongo.helper.toObjectID(_id)},function (err, user) {
                if (err) deferred.reject(err.username + ': ' + err.message);
                
                if (user) {
                    hej = user;
                    pendingStud.push(hej);
                }
                
            });
            pendingStud.push(hej);
        });

        console.log(pendingStud);
        deferred.resolve(pendingStud);
    }
    return deferred.promise;
}