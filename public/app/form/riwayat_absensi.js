function riwayat_absensi_index() {
    $("#content-area").html(`<div class="row">
                                <div class="col-lg-12 col-12">
                                    <div class="row">
                                        <div class="col-lg-12">
                                            <div class="card  ">
                                                <div class="card-header border-transparent" style="background-image: linear-gradient(141deg, #7d7d7d 0%, #415192fa 75%) !important;">
                                                    <h3 class="card-title mt-0" style="font-size: .975rem;color: white;"><b>RIWAYAT ABSENSI</b></h3>
                                                    <div class="card-tools">
                                                        <div class="input-group input-group-sm " style="width: 1000px;">
                                                            <button type="button" class="btn btn-success btn-sm" onclick="cetakRekapAbsensi()">
                                                                <i class="fas fa-print"></i> Cetak Rekap Absensi
                                                            </button>
                                                            <button type="button" class="btn btn-primary  btn-sm  mx-2" onClick="addAbsensi()">
                                                                <i class="fas fa-chalkboard-teacher"></i> Tambah Absensi
                                                            </button>
                                                            <select class="form-control rounded" id="bulan">
                                                                <option value="0">Pilih Bulan</option>
                                                                <option value="1">Januari</option>
                                                                <option value="2">Februari</option>
                                                                <option value="3">Maret</option>
                                                                <option value="4">April</option>
                                                                <option value="5">Mei</option>
                                                                <option value="6">Juni</option>
                                                                <option value="7">Juli</option>
                                                                <option value="8">Agustus</option>
                                                                <option value="9">September</option>
                                                                <option value="10">Oktober</option>
                                                                <option value="11">November</option>
                                                                <option value="12">Desember</option>
                                                            </select>
                                                            <select class="form-control mx-2 rounded" id="tahun">
                                                                <option value="0">Pilih Tahun</option>
                                                            </select>
                                                            <input type="text" id="search" class="form-control float-right"  style="width: 200px;" placeholder="Search by NAMA / NIP GURU & TENDIK">
                                                            <div class="input-group-append" >
                                                                <button type="button" class="btn btn-default" onClick="riwayat_absensi(20)">
                                                                    <i class="fas fa-search"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="card-body p-0">
                                                    <div class="table-responsive">
                                                        <table class="table m-0">
                                                            <thead>
                                                                <tr>
                                                                    <th style="width:30%"><center>NAMA / NIP GURU & TENDIK</center></th>
                                                                    <th style="width:10%"><center>MASUK</center></th>
                                                                    <th style="width:10%"><center>KELUAR</center></th>
                                                                    <th style="width:15%"><center>TANGGAL</center></th>
                                                                    <th style="width:15%"><center>WAKTU KERJA</center></th>
                                                                    <th style="width:10%"><center>ALAMAT IP</center></th>
                                                                    <th style="width:10%"><center>AKSI</center></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody id="body_riwayat_absensi">
                                                                <tr>
                                                                    <td colspan="7"><center>Daftar Riwayat Absensi Tidak Ditemukan</center></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                                <div class="card-footer clearfix py-3" id="pagination_riwayat_absensi">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`);
}

function riwayat_absensi_start() {
    var d = new Date();
    var year = d.getFullYear();

    var option = `<option value="0">Pilih Tahun</option>`;
    for (let index = year; index >= 2022; index--) {
        option += `<option value="${index}">${index}</option>`;
    }
    $("#tahun").html(option);

    riwayat_absensi(20);
}

function riwayat_absensi(perpage) {
    get_data(perpage, {
        url: "admin/" + kode + "/riwayat_absensi",
        pagination_id: "pagination_riwayat_absensi",
        bodyTable_id: "body_riwayat_absensi",
        fn: "ListAbsensi",
        warning_text:
            ' <td colspan="7"><center>Daftar Riwayat Absensi Tidak Ditemukan</center></td>',
        param: {
            search: $("#search").val(),
            bulan: $("#bulan").val(),
            tahun: $("#tahun").val(),
        },
    });
}

function ListAbsensi(JSONData) {
    var json = JSON.parse(JSONData);
    return `<tr>
                <td>${json.fullname}<br>${json.nip}</td>
                <td><center>${
                    json.masuk == null ? "-" : json.masuk
                }</center></td>
                <td><center>${
                    json.keluar == null ? "-" : json.keluar
                }</center></td>
                <td><center>${json.tanggal}</center></td>
                <td><center>${json.total_kerja}<c/enter></td>
                <td><center>${
                    json.ip == null ? "Tidak ditemukan" : json.ip
                }<c/enter></td>
                <td>
                    <center>
                        <button type="button" class="btn btn-default btn-action" title="Edit Absensi Guru & Tendik" style="margin:.15rem .1rem  !important" onClick="editAbsensi(${
                            json.id
                        })">
                            <i class="fas fa-pencil-alt" style="font-size: 11px;"></i>
                        </button>
                        <button type="button" class="btn btn-default btn-action" title="Delete Absensi Guru & Tendik" style="margin:.15rem .1rem  !important" onClick="deleteAbsensi(${
                            json.id
                        })">
                            <i class="fas fa-times" style="font-size: 11px;"></i>
                        </button>
                    </center>
                </td>
            </tr>`;
}

function deleteAbsensi(id) {
    ajax_default(
        {
            url: "admin/" + kode + "/delete_absensi",
            method: "post",
            data: {
                id: id,
            },
        },
        function (e) {
            smile_alert(e.msg);
            riwayat_absensi(20);
        },
        function (status, errMsg) {
            frown_alert(errMsg);
        }
    );
}

function editAbsensi(id) {
    ajax_default(
        {
            url: "admin/" + kode + "/get_info_edit_absensi",
            method: "post",
            data: {
                id: id,
            },
        },
        function (e) {
            $.confirm({
                columnClass: "col-5",
                title: "Edit Absensi Guru & Tendik",
                type: "blue",
                theme: "material",
                content: formAddAbsensi(
                    JSON.stringify(e.data),
                    JSON.stringify(e.value)
                ),
                closeIcon: false,
                buttons: {
                    tutup: function () {
                        return true;
                    },
                    formSubmit: {
                        text: "Tambah Absensi Guru & Tendik",
                        btnClass: "btn-blue",
                        action: function () {
                            var par = ajax_default(
                                {
                                    url: "admin/" + kode + "/update_absensi",
                                    method: "post",
                                    form: true,
                                    return: true,
                                },
                                function (e) {
                                    return { status: "success", msg: e.msg };
                                },
                                function (status, errMsg) {
                                    return { status: "error", msg: errMsg };
                                }
                            );
                            console.log("xxxxxxxxxx");
                            console.log(par);
                            console.log("xxxxxxxxxx");
                            if (par.status == "error") {
                                frown_alert(par.msg);
                                return false;
                            } else {
                                smile_alert(par.msg);
                                riwayat_absensi(20);
                            }
                        },
                    },
                },
            });
        }
    );
}

function addAbsensi() {
    ajax_default(
        {
            url: "admin/" + kode + "/info_list_absensi",
            method: "get",
        },
        function (e) {
            $.confirm({
                columnClass: "col-5",
                title: "Tambah Absensi Guru & Tendik",
                type: "blue",
                theme: "material",
                content: formAddAbsensi(JSON.stringify(e.data)),
                closeIcon: false,
                buttons: {
                    tutup: function () {
                        return true;
                    },
                    formSubmit: {
                        text: "Tambah Absensi Guru & Tendik",
                        btnClass: "btn-blue",
                        action: function () {
                            var par = ajax_default(
                                {
                                    url:
                                        "admin/" +
                                        kode +
                                        "/add_absensi_guru_tendik",
                                    method: "post",
                                    form: true,
                                    return: true,
                                },
                                function (e) {
                                    return { status: "success", msg: e.msg };
                                },
                                function (status, errMsg) {
                                    return { status: "error", msg: errMsg };
                                }
                            );
                            if (par.status == "error") {
                                frown_alert(par.msg);
                                return false;
                            } else {
                                smile_alert(par.msg);
                                riwayat_absensi(20);
                            }
                        },
                    },
                },
            });
        }
    );
}

function formAddAbsensi(JSONData, JSONValue) {
    var json = JSON.parse(JSONData);

    var id = "";
    var guru_tendik = "";
    var tanggal = "";
    var waktu_masuk = "";
    var waktu_keluar = "";
    if (JSONValue != undefined) {
        var value = JSON.parse(JSONValue);
        id = `<input type="hidden" name="id" value="${value.id}">`;
        guru_tendik = value.guru_tendik;
        tanggal = value.tanggal;
        waktu_masuk = value.masuk;
        waktu_keluar = value.keluar;
    }
    var form = `<form id="form" class="formName" enctype="multipart/form-data" method="post">
                    <div class="row px-0 py-3 mx-0">
                        <div class="col-12">
                            <div class="form-group">
                                <label>Guru & Tendik</label>
                                ${id}
                                <select class="form-control rounded" name="guru_tendik">`;
    for (x in json.member_list) {
        form += `<option value="${json.member_list[x].id}" ${
            json.member_list[x].id == guru_tendik ? "selected" : ""
        }>${json.member_list[x].fullname} -> (NIP : ${
            json.member_list[x].nip
        })</option>`;
    }
    form += `</select>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="form-group">
                                <label>Tanggal</label>
                                <input type="date" class="form-control form-control-sm" name="tanggal" placeholder="Tanggal" value="${tanggal}">
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="form-group">
                                <label>Waktu Masuk</label>
                                <input type="time" class="form-control form-control-sm" name="waktu_masuk" placeholder="Waktu Masuk" value="${waktu_masuk}">
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="form-group">
                                <label>Waktu Keluar</label>
                                <input type="time" class="form-control form-control-sm" name="waktu_keluar" placeholder="Waktu Keluar" value="${waktu_keluar}">
                            </div>
                        </div>
                    </div>
                </form>`;
    return form;
}

function cetakRekapAbsensi() {
    var bulan = $("#bulan").val();
    var tahun = $("#tahun").val();
    if (bulan != 0 || tahun != 0) {
        // url: "admin/" + kode + "/info_list_absensi",
        window.open("/cetak-pdf/" + kode + "/" + bulan + "/" + tahun, "_blank");
        // ajax_default(
        //     {
        //         url: "admin/" + kode + "/" + bulan + "/" + tahun,
        //         method: "get",
        //     },
        //     function (e) {}
        // );
    } else {
        frown_alert("Bulan atau tahun tidak boleh kosong.");
    }
}
