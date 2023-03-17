const mysql = require('mysql');
const db_info_dev = {
    host: 'dev-database.cmpvgajxiyud.ap-northeast-2.rds.amazonaws.com',
    port: '3306',
    user: 'admin',
    password: 'popsline1234',
    database: 'PLAYPOPDB'
}

const db_info_live = {
    host: 'metaversero.cmpvgajxiyud.ap-northeast-2.rds.amazonaws.com',
    port: '3306',
    user: 'metaversero_adm',
    password: 'metaversero_pw1',
    database: 'metaversero'
}

module.exports = {
    init: function () {
        return mysql.createConnection(db_info_dev);
    },
    connect: function(conn) {
        conn.connect(function(err) {
            if(err) console.error('mysql connection error : ' + err);
            else console.log('mysql is connected successfully!');
        });
    }
}
