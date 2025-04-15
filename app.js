// param
const dotenv = require("dotenv");
const express = require("express");
const session = require("express-session");

dotenv.config();

const app = express();

// routers
const guruRouter = require("./router/router_guru");
const adminRouter = require("./router/router_admin");
const guruTendikRouter = require("./router/admin/router_guru_tendik");
const absensiRouter = require("./router/admin/router_absensi");
const izinRouter = require("./router/admin/router_izin");
const hariLiburRouter = require("./router/admin/router_hari_libur");

const mobileRouter = require("./router/router_mobile_api");

// models
const db = require("./db/models");

// controllers
// const { publicPage } = require("./controllers/public");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

hour = 3600000;

app.use(
    session({
        secret: "Absens1Tacob4",
        name: "secretName",
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: new Date(Date.now() + hour),
            maxAge: hour,
        },
    })
);

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
// app.use("/static", express.static("public"));
// app.use("/public", express.static(path.join(__dirname, "public")));
// app.use("/static", express.static(__dirname + "/public"));
app.use("/static", express.static(__dirname + "/public"));

app.use("/photo", express.static("photo"));

(async () => {
    await db.sequelize.sync();
})();

app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.use("/js", express.static(__dirname + "/node_modules/bootstrap/dist/js"));
app.use("/jquery", express.static(__dirname + "/node_modules/jquery/dist"));
app.use(
    "/jquery-confirm",
    express.static(__dirname + "/node_modules/jquery-confirm/dist")
);

app.use(adminRouter);
app.use(guruTendikRouter);
app.use(absensiRouter);
app.use(izinRouter);
app.use(hariLiburRouter);
app.use(guruRouter);

app.listen(process.env.PORT, "0.0.0.0", function () {
    console.log("Server Running");
});
