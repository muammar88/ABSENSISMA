const bcrypt = require("bcryptjs");

const {
    Op,
    Member,
    Server,
    Provider,
    Produk,
    Produk_server,
    User,
    Absensi,
    DinasLuar,
    Holiday,
    Fakultas,
    Waktu_kerja,
} = require("../db/models");

const inArray = (needle, haystack) => {
    var length = haystack.length;
    for (var i = 0; i < length; i++) {
        if (typeof haystack[i] == "object") {
            if (arrayCompare(haystack[i], needle)) return true;
        } else {
            if (haystack[i] == needle) return true;
        }
    }
    return false;
};

const arrayCompare = (a1, a2) => {
    if (a1.length != a2.length) return false;
    var length = a2.length;
    for (var i = 0; i < length; i++) {
        if (a1[i] !== a2[i]) return false;
    }
    return true;
};

const helper = {};

helper.checkKodeMember = async (value) => {
    check = await Member.findOne({ where: { kode: value } });
    if (check) {
        throw new Error("Kode Member Sudah Terdaftar Dipangkalan Data.");
    }
    return true;
};

helper.checkNomorWhatsapp = async (value, { req }) => {
    const body = req.body;
    if (body.id != undefined) {
        check = await Member.findOne({
            where: { whatsappnumber: value, id: { $not: body.id } },
        });
    } else {
        check = await Member.findOne({ where: { whatsappnumber: value } });
    }
    if (check) {
        throw new Error("Nomor Whatsapp Sudah Terdaftar Dipangkalan Data.");
    }
    return true;
};

helper.checkMemberID = async (value) => {
    check = await Member.findOne({ where: { id: value } });
    if (!check) {
        throw new Error("Member Id Tidak Ditemukan.");
    }
    return true;
};

helper.checkKodeServer = async (value) => {
    check = await Server.findOne({ where: { kode: value } });
    if (check) {
        throw new Error("Kode Server Sudah Terdaftar Dipangkalan Data.");
    }
    return true;
};

helper.checkServerID = async (value) => {
    check = await Server.findOne({ where: { id: value } });
    if (!check) {
        throw new Error("ID Server Tidak Terdaftar Dipangkalan Data.");
    }
    return true;
};

// chec nama
helper.checkName = async (value, { req }) => {
    const body = req.body;
    if (body.id != undefined) {
        check = await Provider.findOne({
            where: { name: value, id: { $not: body.id } },
        });
    } else {
        check = await Provider.findOne({ where: { name: value } });
    }
    if (check) {
        throw new Error("Nama Sudah Terdaftar Dipangkalan Data.");
    }
    return true;
};

helper.checkOperatorID = async (value) => {
    check = await Provider.findOne({ where: { id: value } });
    if (!check) {
        throw new Error("ID Operator Tidak Terdaftar Dipangkalan Data.");
    }
    return true;
};

helper.checkKode = async (value, { req }) => {
    const body = req.body;
    if (body.id != undefined) {
        check = await Produk.findOne({
            where: { kode: value, id: { $not: body.id } },
        });
    } else {
        check = await Produk.findOne({ where: { kode: value } });
    }
    if (check) {
        throw new Error("Kode Sudah Terdaftar Dipangkalan Data.");
    }
    return true;
};

helper.checkProdukID = async (value) => {
    check = await Produk.findOne({ where: { id: value } });
    if (!check) {
        throw new Error("ID Produk Tidak Terdaftar Dipangkalan Data.");
    }
    return true;
};

helper.checkKodeProdukServer = async (value, { req }) => {
    const body = req.body;
    check = await Produk_server.findOne({
        where: { server_id: body.server, kode_produk_server: value },
    });
    if (check) {
        throw new Error("Kode Produk Sudah Terdaftar Dipangkalan Data.");
    }
    return true;
};

helper.checkProdukServerID = async (value) => {
    check = await Produk_server.findOne({ where: { id: value } });
    if (!check) {
        throw new Error("ID Produk Server Tidak Terdaftar Dipangkalan Data.");
    }
    return true;
};

helper.ckLevel = async (value) => {
    if (
        !["superadmin", "administrator_biro", "administrator_biro"].includes(
            value
        )
    ) {
        throw new Error("ID Produk Server Tidak Terdaftar Dipangkalan Data.");
    }
};

helper.checkAbsensiDosen = async (value, { req }) => {
    const body = req.body;
    // get member nip
    await Member.findOne({ where: { id: body.dosen } }).then(async (value) => {
        if (value) {
            check = await Absensi.findOne({
                where: { nip: value.nip, tanggal: body.tanggal },
            });
            if (check) {
                if (body.id == undefined) {
                    throw new Error(
                        "Pada tanggal ini sudah pernah dilakukan absensi."
                    );
                }
            }
        } else {
            throw new Error("ID Dosen tidak ditemukan.");
        }
    });
    return true;
};

helper.checkIDDosen = async (value, { req }) => {
    const body = req.body;
    // get member nip
    await Member.findOne({ where: { id: body.dosen } }).then(async (value) => {
        if (!value) {
            throw new Error("ID Dosen tidak ditemukan.");
        }
    });
    return true;
};

// check id absensi dosen
helper.checkIDAbsensiDosen = async (value, { req }) => {
    const body = req.body;
    check = await Absensi.findOne({
        where: { id: body.id },
    });
    if (!check) {
        throw new Error("ID Absensi tidak ditemukan.");
    }
    return true;
};

// check id dinas luar
helper.checkIDDinasLuar = async (value, { req }) => {
    const body = req.body;
    check = await DinasLuar.findOne({ where: { id: body.id } });
    if (!check) {
        throw new Error(" ID Dinas luar tidak ditemukan.");
    }
    return true;
};

// helper.checkProviderId = async ( value ) => {
//     check = await Provider.findOne({ where: { id: value } });
//     if (!check) {
//         throw new Error("ID Operator Tidak Terdaftar Dipangkalan Data.");
//     }
//     return true;
// }
// helper.checkTopicID = async (value) => {
//     check = await Topic.findOne({ where: { id: value } });
//     if (!check) {
//         throw new Error("Topik Id Tidak Ditemukan.");
//     }
//     return true;
// };

// helper.checkKategoriID = async (value) => {
//     const categori = ["kegiatan", "berita"];
//     if (!inArray(value, categori)) {
//         throw new Error("Kategori Tidak Ditemukan.");
//     }
//     return true;
// };

// helper.checkPostID = async (value) => {
//     check = await Post.findOne({ where: { id: value } });
//     if (!check) {
//         throw new Error("Post Id Tidak Ditemukan.");
//     }
//     return true;
// }

// helper.checkSlideID = async (value) => {
//     check = await Slide.findOne({ where: { id: value } });
//     if (!check) {
//         throw new Error("Slide Id Tidak Ditemukan.");
//     }
//     return true;
// }

// helper.checkAgendaID = async (value) => {
//     check = await Agenda.findOne({ where: { id: value } });
//     if (!check) {
//         throw new Error("Agenda Id Tidak Ditemukan.");
//     }
//     return true;
// }

// // checkMediaSosialID
// helper.checkMediaSosialID = async (value) => {
//     check = await MediaSosial.findOne({ where: { id: value } });
//     if (!check) {
//         return false;
//     }
//     return true;
// }

// // galeri
// helper.checkGaleriID = async (value) => {
//     check = await Galeri.findOne({ where: { id: value } });
//     if (!check) {
//         return false;
//     }
//     return true;
// }

// helper.checkPhotoID = async (value) => {

//     console.log("checkPhotoID++");
//     console.log(value);
//     console.log("checkPhotoID++");

//     check = await Photo.findOne({ where: { id: value } });
//     if (!check) {
//         return false;
//     }
//     return true;
// }

// helper.checkJabatanID = async ( value ) => {
//     check = await Jabatan.findOne({ where: { id: value } });
//     if (!check) {
//         return false;
//     }
//     return true;
// }

// helper.checkStrukturOrganisasiID = async ( value ) => {
//     check = await StrukturOrganisasi.findOne({ where: { id: value } });
//     if (!check) {
//         return false;
//     }
//     return true;
// }

helper.ckPasswordLama = async (value, { req }) => {
    const user = await User.findOne({
        where: { id: req.session.admin_id },
    });

    const validPassword = await bcrypt.compare(value, user.password);
    return validPassword;
};

// melakukan pengecekan nilai dari form perulangan pada holiday
helper.checkBerulang = async (value) => {
    const list = ["annually", "onetime"];
    if (!list.includes(value)) {
        throw new Error("Jenis perulangan tidak ditemukan.");
    }
    return true;
};

// melakukan pengecekan id holiday didalam database
helper.checkHolidayID = async (value) => {
    check = await Holiday.findOne({ where: { id: value } });
    if (!check) {
        throw new Error(" ID Holiday tidak ditemukan.");
    }
    return true;
};

// melakukan pengecekan keberadaan kode pengguna yang sama
helper.checkKodePengguna = async (value, { req }) => {
    const body = req.body;
    if (body.id != undefined) {
        // dalam kondisi update data baru
        check = await User.findOne({
            where: {
                [Op.and]: [{ kode: value }, { id: { [Op.ne]: body.id } }],
            },
        });
        if (check) {
            throw new Error("Kode pengguna sudah terdaftar dipangkalan data.");
        }
    } else {
        // dalam kondisi insert data baru
        check = await User.findOne({ where: { kode: value } });
        if (check) {
            throw new Error("Kode pengguna sudah terdaftar dipangkalan data.");
        }
    }
    return true;
};

// melakukan pengecekan keberadaan username yang sama
helper.checkUsernameExist = async (value, { req }) => {
    const body = req.body;
    if (body.id != undefined) {
        // dalam kondisi update data baru
        check = await User.findOne({
            where: {
                [Op.and]: [{ name: value }, { id: { [Op.ne]: body.id } }],
            },
        });
        if (check) {
            throw new Error(
                "Username pengguna sudah terdaftar dipangkalan data."
            );
        }
    } else {
        // dalam kondisi insert data baru
        check = await User.findOne({ where: { name: value } });
        if (check) {
            throw new Error(
                "Username pengguna sudah terdaftar dipangkalan data."
            );
        }
    }
    return true;
};

// melakukan pengecekan level pengguna
helper.checkLevelPengguna = async (value, { req }) => {
    if (value == 0) {
        throw new Error("Level pengguna wajib dipilih tidak ditemukan.");
    } else {
        const list = ["administrator_biro", "administrator_fakultas"];
        if (!list.includes(value)) {
            throw new Error("Level pengguna tidak ditemukan.");
        }
    }
    return true;
};

// mengecek keberadaan fakultas id di dalam database
helper.checkFakultasPengguna = async (value, { req }) => {
    var body = req.body;
    if (body.id != undefined) {
        if (body.level == "administrator_fakultas") {
            check = await Fakultas.findOne({ where: { id: value } });
            if (!check) {
                throw new Error("ID Fakultas tidak ditemukan.");
            }
        }
    } else {
        if (body.level == "administrator_fakultas") {
            check = await Fakultas.findOne({ where: { id: value } });
            if (!check) {
                throw new Error("ID Fakultas tidak ditemukan.");
            }
        }
    }

    return true;
};

// chek konfirmasi password
helper.checkKonfirmasiPassword = async (value, { req }) => {
    if (value !== req.body.password) {
        throw new Error("Password konfirmasi tidak cocok dengan password");
    }
    return true;
};

// check id pengguna
helper.checkIDPengguna = async (value) => {
    check = await User.findOne({ where: { id: value } });
    if (!check) {
        throw new Error("ID Pengguna tidak ditemukan.");
    }
    return true;
};

helper.checkIDWaktuKerja = async (value) => {
    const query = await Waktu_kerja.findAndCountAll({ id: value });
    const total_waktu_kerja = query.count;
    if (total_waktu_kerja <= 0) {
        throw new Error("ID Waktu Kerja tidak ditemukan.");
    }
    return true;
};

module.exports = helper;
