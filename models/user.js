/**
 * Created by vedi on 23/08/14.
 */

'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('../config/mongoose'),
	Schema = mongoose.Schema,
	_ = require('lodash'),
	crypto = require('crypto');

var ROLES = {
	USER: 'user',
	STAFF: 'staff',
	ADMIN: 'admin'
};

/**
 * User Schema
 */
var UserSchema = new Schema({
	username: {
		type: String,
		unique: true,
		required: true
	},
	hashedPassword: {
		type: String,
		required: true
	},
	salt: {
		type: String,
		required: true
	},
	roles: {
		type: [{
			type: String,
			enum: _.keys(ROLES)
		}],
		default: [ROLES.USER]
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function (password) {
	if (this.salt && password) {
		return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
	} else {
		return password;
	}
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function (password) {
	return this.hashedPassword === this.hashPassword(password);
};

UserSchema.virtual('password')
	.set(function(password) {
		this._plainPassword = password;
		this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
		this.hashedPassword = this.hashPassword(password);
	})
	.get(function() {
		return this._plainPassword;
	});

UserSchema.statics.ROLES = ROLES;

module.exports = mongoose.model('User', UserSchema);
