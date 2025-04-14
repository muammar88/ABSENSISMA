function riwayat_absensi_index() {
    var selectTanggal = `<option value='0'>Pilih Semua</option>`;
    for (let i = 1; i <= 31; i++)
        selectTanggal += `<option value='${i}'>${i}</option>`;

    $("#content-area").html(`<div class="row">
                                <div class="col-lg-12 col-12">
                                    <div class="row">
                                        <div class="col-lg-12">
                                            <div class="card  ">
                                                <div class="card-header border-transparent row" style="background-image: linear-gradient(141deg, #7d7d7d 0%, #415192fa 75%) !important;">
                                                    <div class="col-12 mb-2 col-md-2 mb-md-0" >
                                                        <h3 class="card-title mt-0" style="font-size: .975rem;color: white;"><b>RIWAYAT ABSENSI</b></h3>
                                                    </div>
                                                    <div class="card-tools col-12 col-md-10 ">
                                                        <div class="row" >
                                                            <div class="col-12 col-md-9"> 
                                                                <div class="row" >  
                                                                    <div class="col-12 col-md-4 col-lg-2 mb-2 mb-md-2 mb-lg-0">
                                                                        <button type="button" class="btn btn-sm btn-success w-100" onclick="cetakRekapAbsensi()">
                                                                            <i class="fas fa-print"></i> <span class="d-none d-sm-none d-md-inline">Cetak Rekap </span>
                                                                        </button>
                                                                    </div>
                                                                    <div class="col-12 col-md-4 col-lg-2 mb-2 mb-md-2 mb-lg-0 " >
                                                                        <button type="button" class="btn btn-sm btn-success w-100" onclick="cetakRekapRiwayatAbsensi()">
                                                                            <i class="fas fa-print"></i> <span class="d-none d-sm-none d-md-inline">Cetak Riwayat</span>
                                                                        </button>
                                                                    </div>
                                                                    <div class="col-12 col-md-4 col-lg-2 mb-2 mb-md-2 mb-lg-0" >
                                                                        <button type="button" class="btn btn-sm btn-primary w-100"  onClick="addAbsensi()">
                                                                            <i class="fas fa-chalkboard-teacher"></i> <spa== class="d-none d-sm-none d-md-inline">Tambah Absensi</spa==\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
                                                                        </button>
                                                                    </div>
                                                                    <div class="col-12 col-md-6 col-lg-3 mb-2 mb-md-2 mb-lg-0">
                                                                        <input type="date" class="form-control form-control-sm rounded" id="start_date" placeholder="Mulai Tanggal" >
                                                                    </div>
                                                                    <div class="col-12 col-md-6 col-lg-3 mb-2 mb-md-2 mb-lg-0">
                                                                        <input type="date" class="form-control form-control-sm rounded" id="end_date" placeholder="Akhir Tanggal" >
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="col-12 col-md-3 pt-1 mb-2 mb-md-0">   
                                                                <div class="input-group input-group-sm" >
                                                                    <input type="text" id="search" class="form-control form-control-sm float-right rounded-left"  placeholder="Search by NAMA / NIP GURU & TENDIK">
                                                                    <div class="input-group-append" >
                                                                        <button type="button" class="btn btn-sm btn-default" onClick="riwayat_absensi(20)">
                                                                            <i class="fas fa-search"></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
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
            start_date: $("#start_date").val(),
            end_date: $("#end_date").val(),
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

function cetakRekapRiwayatAbsensi() {
    var start_date = $("#start_date").val();
    if (start_date == "") start_date = "-";
    var end_date = $("#end_date").val();
    if (end_date == "") end_date = "-";
    window.open(
        "/cetak-pdf/" + kode + "/" + start_date + "/" + end_date,
        "_blank"
    );
}

function cetakRekapAbsensi() {
    var start_date = $("#start_date").val();
    if (start_date == "") start_date = "-";
    var end_date = $("#end_date").val();
    if (end_date == "") end_date = "-";
    window.open(
        "/cetak-pdf-rekap-absensi/" + kode + "/" + start_date + "/" + end_date,
        "_blank"
    );
}
