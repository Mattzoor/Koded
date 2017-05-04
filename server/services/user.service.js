var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('users');
db.bind('classrooms');

var service = {};

service.authenticate = authenticate;
service.getAll = getAll;
service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;
service.getClassrooms = getClassrooms;
service.exitClassroom = exitClassroom;

service.updateRoom = updateRoom;
service.addPendReq = addPendReq;
service.removePendReq = removePendReq;
module.exports = service;

function exitClassroom(userId, roomId){
    //console.log("1  " + userId + "    " + roomId);
    var deferred = Q.defer();
    db.users.findOne({_id: mongo.helper.toObjectID(userId)}, function (err, user) {
        if (err) deferred.reject(err.username + ': ' + err.message);

        if(user){
            //console.log("2  " + user + "    " + roomId);
            exit(roomId, user);
        }
    });

    function exit(roomId, user) {
        // fields to update
        var set = {
            classroomIds: []
        };
        console.log("2  " + user.classroomIds);
        if(user.classroomIds != null){
            set.classroomIds = user.classroomIds;
        }
        console.log("3  " + set.classroomIds);
        if(set.classroomIds.indexOf(roomId) != -1){
            var i = set.classroomIds.indexOf(roomId);
            set.classroomIds.splice(i, 1);
            console.log("asd  " + set.classroomIds);
        }
            
        console.log("4  " + set.classroomIds);
        db.users.update(
            { _id: mongo.helper.toObjectID(userId) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.username + ': ' + err.message);

                deferred.resolve();
            });
    }
    return deferred.promise;
}

function getClassrooms(_id){
    var deferred = Q.defer();
    // validation
    db.users.findOne({_id: mongo.helper.toObjectID(_id)}, function (err, user) {
        if (err) deferred.reject(err.username + ': ' + err.message);
        if(user){
            if(user.classroomIds != null){
                classrooms = user.classroomIds; 
                deferred.resolve(classrooms);
            }
        }
    });
    return deferred.promise;
    
}


function authenticate(username, password) {
    var deferred = Q.defer();

    db.users.findOne({ username : { '$regex': username, $options:'i'}}, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user && bcrypt.compareSync(password, user.hash)) {
            // authentication successful
            deferred.resolve({
                _id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                teacher: user.teacher,
                token: jwt.sign({ sub: user._id }, config.secret)
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

    db.users.find().toArray(function (err, users) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        // return users (without hashed passwords)
        users = _.map(users, function (user) {
            return _.omit(user, 'hash');
        });

        deferred.resolve(users);
    });

    return deferred.promise;
}

function getById(_id) {
    var deferred = Q.defer();
    //console.log(_id);
    db.users.findOne({_id: mongo.helper.toObjectID(_id)}, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user) {
            // return user (without hashed password)
            deferred.resolve(_.omit(user, 'hash'));
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function create(userParam) {
    var deferred = Q.defer();

    // validation
    db.users.findOne(
        { username : { '$regex': userParam.username, $options:'i'}},
        function (err, user) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (user) {
                // username already exists
                deferred.reject('Username "' + userParam.username + '" is already taken');
            } else {
                createUser();
            }
        });

    function createUser() {
        // set user object to userParam without the cleartext password
        var user = _.omit(userParam, 'password');

        // add hashed password to user object
        user.hash = bcrypt.hashSync(userParam.password, 10);

        db.users.insert(
            user,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function update(_id, userParam) {
    var deferred = Q.defer();

    // validation
    db.users.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user.username !== userParam.username) {
            // username has changed so check if the new username is already taken
            db.users.findOne(
                { username : { '$regex': userParam.username, $options:'i'}},
                function (err, user) {
                    if (err) deferred.reject(err.name + ': ' + err.message);

                    if (user) {
                        // username already exists
                        deferred.reject('Username "' + req.body.username + '" is already taken')
                    } else {
                        updateUser();
                    }
                });
        } else {
            updateUser();
        }
    });

    function updateUser() {
        // fields to update
        var set = {
            firstName: userParam.firstName,
            lastName: userParam.lastName,
            username: userParam.username,
            teacher: userParam.teacher
        };

        // update password if it was entered
        if (userParam.password) {
            set.hash = bcrypt.hashSync(userParam.password, 10);
        }

        db.users.update(
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

    db.users.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}

function updateRoom(student, classroom){
    var deferred = Q.defer();
        // validation
        db.users.findById(student._id, function (err, user) {
            if (err) deferred.reject(err.username + ': ' + err.message);

            if(user){
                updateRoom(user);
            }
        });

        function updateRoom(user) {
            // fields to update
            var set = {
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                teacher: user.teacher,
                pendingReq: [],
                classroomIds:[]
            };

            if(user.pendingReq != null){
                user.pendingReq.forEach(function(_id) {
                    if(_id != classroom._id){
                        set.pendingReq.push(_id);
                    }
                }, this); 
            }

            if(user.classroomIds != null){
                set.classroomIds = user.classroomIds;
                set.classroomIds.push(classroom._id);   
            }            

            db.users.update(
                { _id: mongo.helper.toObjectID(user._id) },
                { $set: set },
                function (err, doc) {
                    if (err) deferred.reject(err.username + ': ' + err.message);

                    deferred.resolve();
                });
        }
        return deferred.promise;
}


function addPendReq(student,classroom){
    var deferred = Q.defer();
        // validation
        db.users.findById(student._id, function (err, user) {
            if (err) deferred.reject(err.username + ': ' + err.message);

            if(user){
                addPendingReq(user);
            }
        });

        function addPendingReq(user) {
            // fields to update
            var set = {
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                teacher: user.teacher,
                pendingReq: [],
                classroomIds:[]
            };

            if(user.pendingReq != null){
                set.pendingReq = user.pendingReq; 
            }

            if(user.classroomIds != null){
                set.classroomIds = user.classroomIds;   
            }            

            db.users.update(
                { _id: mongo.helper.toObjectID(user._id) },
                { $set: set },
                function (err, doc) {
                    if (err) deferred.reject(err.username + ': ' + err.message);

                    deferred.resolve();
                });
        }
        return deferred.promise;
}

function removePendReq(student,classroom){
    var deferred = Q.defer();
        // validation
        db.users.findById(student._id, function (err, user) {
            if (err) deferred.reject(err.username + ': ' + err.message);

            if(user){
                removePendingReq(user);
            }
        });

        function removePendingReq(user) {
            // fields to update
            var set = {
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                teacher: user.teacher,
                pendingReq: [],
                classroomIds:[]
            };

            if(user.pendingReq != null){
                user.pendingReq.forEach(function(_id) {
                    if(_id != classroom._id){
                        set.pendingReq.push(_id);
                    }
                }, this); 
            }

            if(user.classroomIds != null){
                set.classroomIds = user.classroomIds;   
            }            

            db.users.update(
                { _id: mongo.helper.toObjectID(user._id) },
                { $set: set },
                function (err, doc) {
                    if (err) deferred.reject(err.username + ': ' + err.message);

                    deferred.resolve();
                });
        }
        return deferred.promise;
}