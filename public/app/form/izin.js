function izin_index() {
    $("#content-area").html(`<div class="row">
                                <div class="col-lg-12 col-12">
                                    <div class="row">
                                        <div class="col-lg-12">
                                            <div class="card  ">
                                                <div class="card-header border-transparent" style="background-image: linear-gradient(141deg, #7d7d7d 0%, #415192fa 75%) !important;">
                                                    <h3 class="card-title mt-0" style="font-size: .975rem;color: white;"><b>DAFTAR IZIN</b></h3>
                                                    <div class="card-tools">
                                                        <div class="input-group input-group-sm " style="width: 500px;">
                                                            <button type="button" class="btn btn-primary btn-sm mx-2" onClick="addIzin()">
                                                                <i class="fas fa-plus"></i> Tambah Dinas Luar Guru & Tendik
                                                            </button>
                                                            <input type="text" id="search" class="form-control float-right"  style="width: 200px;" placeholder="Search by NAMA, NIP GURU & TENDIK">
                                                            <div class="input-group-append" >
                                                                <button type="button" class="btn btn-default" onClick="izin(20)">
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
                                                                    <th style="width:35%"><center>NAMA / NIP GURU & TENDIK</center></th>
                                                                    <th style="width:20%"><center>TANGGAL MULAI</center></th>
                                                                    <th style="width:20%"><center>TANGGAL AKHIR</center></th>
                                                                    <th style="width:15%"><center>STATUS</center></th>
                                                                    <th style="width:10%"><center>AKSI</center></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody id="body_izin">
                                                                <tr>
                                                                    <td colspan="5"><center>Daftar Izin Tidak Ditemukan</center></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                                <div class="card-footer clearfix py-3" id="pagination_izin">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`);
}

function izin_start() {
    izin(20);
}

function izin(perpage) {
    get_data(perpage, {
        url: "admin/" + kode + "/daftar_izin",
        pagination_id: "pagination_izin",
        bodyTable_id: "body_izin",
        fn: "ListIzin",
        warning_text:
            '<td colspan="5"><center>Daftar Izin Tidak Ditemukan</center></td>',
        param: {
            search: $("#search").val(),
        },
    });
}

function ListIzin(JSONData) {
    var json = JSON.parse(JSONData);
    var html = `<tr>
                    <td>${json.fullname}<br>${json.nip}</td>
                    <td><center>${json.start_date}</center></td>
                    <td><center>${json.end_date}</center></td>
                    <td><center style="text-transform:uppercase;">${json.status}</center></td>
                    <td>
                        <center>
                            <button type="button" class="btn btn-default btn-action" title="Edit Izin" style="margin:.15rem .1rem  !important" onclick="editIzin(${json.id})">
                                <i class="fas fa-pencil-alt" style="font-size: 11px;"></i>
                            </button>
                            <button type="button" class="btn btn-default btn-action" title="Hapus Izin" style="margin:.15rem .1rem  !important" onclick="deleteIzin(${json.id})">
                                <i class="fas fa-times" style="font-size: 11px;"></i>
                            </button>
                        </center>
                    </td>
                </tr>`;
    return html;
}

function editIzin(id) {
    ajax_default(
        {
            url: "admin/" + kode + "/info_edit_izin",
            method: "post",
            json: true,
            data: {
                id: id,
            },
        },
        function (e) {
            $.confirm({
                columnClass: "col-5",
                title: "Edit Izin Guru & Tendik",
                type: "blue",
                theme: "material",
                content: formAddIzin(
                    JSON.stringify(e.data),
                    JSON.stringify(e.value)
                ),
                closeIcon: false,
                buttons: {
                    tutup: function () {
                        return true;
                    },
                    formSubmit: {
                        text: "Simpan Perubahan",
                        btnClass: "btn-blue",
                        action: function () {
                            var par = ajax_default(
                                {
                                    url: "admin/" + kode + "/update_izin",
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
                                izin(20);
                            }
                        },
                    },
                },
            });
        }
    );
}

function addIzin() {
    ajax_default(
        {
            url: "admin/" + kode + "/info_list_absensi",
            method: "get",
        },
        function (e) {
            $.confirm({
                columnClass: "col-5",
                title: "Tambah Izin Guru & Tendik",
                type: "blue",
                theme: "material",
                content: formAddIzin(JSON.stringify(e.data)),
                closeIcon: false,
                buttons: {
                    tutup: function () {
                        return true;
                    },
                    formSubmit: {
                        text: "Tambah Izin Guru & Tendik",
                        btnClass: "btn-blue",
                        action: function () {
                            var par = ajax_default(
                                {
                                    url: "admin/" + kode + "/add_izin",
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
                                izin(20);
                            }
                        },
                    },
                },
            });
        }
    );
}

function formAddIzin(JSONData, JSONValue) {
    var json = JSON.parse(JSONData);
    var id = "";
    var guru_tendik = "";
    var tanggal_mulai = "";
    var tanggal_akhir = "";
    var status = "";

    if (JSONValue != undefined) {
        var value = JSON.parse(JSONValue);
        id = `<input type="hidden" name="id" value="${value.id}">`;
        guru_tendik = value.guru_tendik;
        tanggal_mulai = value.start_date;
        tanggal_akhir = value.end_date;
        status = value.status;
    }
    var form = `<form id="form" class="formName" enctype="multipart/form-data" method="post">
                    <div class="row px-0 py-3 mx-0">
                        <div class="col-12">
                            <div class="form-group">
                                <label>Guru & Tendik</label>
                                ${id}
                                <select class="form-control form-control-sm rounded" name="guru_tendik">`;
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
                                <label>Tanggal Mulai</label>
                                <input type="date" class="form-control form-control-sm" name="tanggal_mulai" placeholder="Tanggal Mulai" value="${tanggal_mulai}">
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="form-group">
                                <label>Tanggal Akhir</label>
                                <input type="date" class="form-control form-control-sm" name="tanggal_akhir" placeholder="Tanggal Akhir" value="${tanggal_akhir}">
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="form-group">
                                <label>Status</label>
                                <select class="form-control form-control-sm rounded" name="status">
                                    <option value="dinasluar" ${
                                        status == "dinasluar" ? "selected" : ""
                                    }>Dinas Luar</option>
                                    <option value="izin" ${
                                        status == "izin" ? "selected" : ""
                                    }>Izin</option>
                                    <option value="cutihamil" ${
                                        status == "cutihamil" ? "selected" : ""
                                    }>Cuti Hamil</option>
                                    <option value="sakit" ${
                                        status == "sakit" ? "selected" : ""
                                    }>Sakit</option>

                                </select>
                            </div>
                        </div>
                    </div>
                </form>`;
    return form;
}

function deleteIzin(id) {
    ajax_default(
        {
            url: "admin/" + kode + "/delete_izin",
            method: "post",
            json: true,
            data: {
                id: id,
            },
        },
        function (e) {
            smile_alert(e.msg);
            izin(20);
        },
        function (status, errMsg) {
            frown_alert(errMsg);
        }
    );
}
