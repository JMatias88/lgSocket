var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http)

var runningMonitor = false

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
    runningMonitor = false
    // startMonitor()
});


let interval;
io.on("connection", socket => {
    if (interval) {
        clearInterval(interval);
    }
    interval = setInterval(() => monitor(socket), 30000);
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

var lr = 0

function startMonitor() {
    console.log('start Monitor')
    var sql = require("mssql");

    var config = {
        user: 'prog_user',
        password: 'Passw0rd',
        server: 'ARUS3DB08',
        database: 'Produccionr4106'
    };
    sql.connect(config, function (err) {

        if (err) console.log(err);

        var request = new sql.Request();

        request.query("select Id,lgFile,serial,Cdate,State,SUBSTRING([serial],4,1) as Equipo from cajaElectricaLG  where  Cdate >= CAST(GETDATE() AS DATE)  and convert(datetime, convert(varchar, Cdate,108)) between convert(datetime,'03:00:00',108) and convert(datetime,'23:59',108) order by cdate desc", function (err, recordset) {

            if (err)
                console.log('e')
            else {

                lr = recordset.recordset.length
                socket.emit('records', recordset.recordset)
                // if (!runningMonitor) {
                //     setTimeout(() => {
                //         monitor()
                //     }, 30000)
                // }

            }

        });
    });
}

function monitor(socket) {
    // if (!monitor) {
    //     monitor = true
    // }
    var sql = require("mssql");
    console.log("monitor" + Date())

    var config = {
        user: 'prog_user',
        password: 'Passw0rd',
        server: 'ARUS3DB08',
        database: 'Produccionr4106'
    };
    sql.connect(config, function (err) {

        if (err) console.log(err);

        var request = new sql.Request();

        request.query("select Id,lgFile,serial,Cdate,State,SUBSTRING([serial],4,1) as Equipo from cajaElectricaLG  where  Cdate >= CAST(GETDATE() AS DATE)  and convert(datetime, convert(varchar, Cdate,108)) between convert(datetime,'03:00:00',108) and convert(datetime,'23:59',108) order by cdate desc", function (err, recordset) {

            if (err)
                console.log(err)
            else {

                lr = recordset.recordset.length
                console.log(lr)
                socket.emit('records', recordset.recordset)
            }

        });
    });
}

// function newMonitor() {
//     var sql = require("mssql");

//     var config = {
//         user: 'prog_user',
//         password: 'Passw0rd',
//         server: 'ARUS3DB08',
//         database: 'Produccionr4106'
//     };
//     sql.connect(config, function (err) {

//         if (err) {
//             console.log('con')
//             //console.log(err);
//         }
//         else {
//             var request = new sql.Request();

//             request.query("select count(lgFile) as total from cajaElectricaLG where  Cdate >= CAST(GETDATE() AS DATE)  and convert(datetime, convert(varchar, Cdate,108)) between convert(datetime,'03:00:00',108) and convert(datetime,'23:59',108) ", function (err, recordset) {

//                 if (err) {
//                     console.log('request')
//                     //console.log(err)
//                 }

//                 else {
//                     console.log('newmonitor')
//                     console.log(recordset.recordset[0].total)
//                     if (recordset.recordset[0].total > lr) {
//                         console.log('Nuevos Registros: ' + recordset.recordset[0].total - lr)
//                         lr = recordset.recordset[0].total
//                     }
//                 }

//             });
//         }

//     });

// }