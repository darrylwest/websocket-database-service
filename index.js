
module.exports = require('./lib/services/DatabaseAccessService');

module.exports.client = {
    DatabaseClient:require('./lib/client/DatabaseClient'),
    DatabaseRequest:require('./lib/models/DatabaseRequest')
};
