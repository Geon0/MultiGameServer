const express = require('express');
const router = express.Router();
const db_config = require('../config/db.js');
const conn = db_config.init();
db_config.connect(conn);

router.use(express.urlencoded({
    extended: true
}))


router.get('/', function(req, res, next) {
    res.send('game controller');
});

router.get('/get-server-check', (req, res) => {
    const {sId} = req.query;
    const sql = `SELECT * FROM MULTI_SERVER_TB WHERE shop_id = ${sId}`;

    conn.query(sql, function (err,rows,fields) {
        if(err) console.log('query'+err);
        else {rows[0]?.status > 0 ? res.json({msg: 'succes'}) : res.json({msg: 'fail'})}
    })
})

router.get('/get-server-close', (req, res) => {
    const {sId} = req.query;
    const sql = `UPDATE MULTI_SERVER_TB SET status = 0 WHERE shop_id = ${sId}`;

    conn.query(sql, function (err,rows,fields) {
        if(err) {
            console.log('query'+err);
            res.status(500).send('Internal Server Error');
        }
        else {
            res.json({msg: 'succes'})
        }
    })
})

router.get('/get-server-open', (req, res) => {
    const {sId} = req.query;
    const sql = `UPDATE MULTI_SERVER_TB SET status = 1 WHERE shop_id = ${sId}`;

    conn.query(sql, function (err,rows,fields) {
        if(err) {
            console.log('query'+err);
            res.status(500).send('Internal Server Error');
        }
        else {
            res.json({msg: 'succes'})
        }
    })
})


module.exports = router;
