// index.js
const express = require('express');
const path = require('path');
const app = express();

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/js', express.static(path.join(__dirname, '../frontend/js')));

// ルートへのGETリクエストに対する応答
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

module.exports = app;
