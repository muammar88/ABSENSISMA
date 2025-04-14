function daftar_guru_tendik_index() {
    $("#content-area").html(`<div class="row">
                                <div class="col-lg-12 col-12">
                                    <div class="row">
                                        <div class="col-lg-12">
                                            <div class="card  ">
                                                <div class="card-header border-transparent" style="background-image: linear-gradient(141deg, #7d7d7d 0%, #415192fa 75%) !important;">
                                                    <h3 class="card-title mt-0" style="font-size: .975rem;color: white;"><b>DAFTAR GURU & TENDIK</b></h3>
                                                    <div class="card-tools">
                                                        <div class="input-group input-group-sm " style="width: 500px;">
                                                            <button type="button" class="btn btn-primary  btn-sm  mx-2" onclick="addGuruTendik()">
                                                                <i class="fas fa-chalkboard-teacher"></i> Tambah Guru / Tendik
                                                            </button>
                                                            <input type="text" id="search" class="form-control float-right" style="width: 200px;" placeholder="Search by NAMA / NIP GURU & TENDIK ">
                                                            <div class="input-group-append" >
                                                                <button type="button" class="btn btn-default" onClick="daftar_guru_tendik(20)">
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
                                                                    <th style="width:25%"><center>NAMA</center></th>
                                                                    <th style="width:15%"><center>NIP</center></th>
                                                                    <th style="width:15%"><center>JENIS KELAMIN</center></th>
                                                                    <th style="width:20%"><center>JABATAN</center></th>
                                                                    <th style="width:15%"><center>STATUS</center></th>
                                                                    <th style="width:10%"><center>AKSI</center></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody id="body_daftar_guru_tendik">
                                                                <tr>
                                                                    <td colspan="6"><center>Daftar Guru & Tendik Tidak Ditemukan</center></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                                <div class="card-footer clearfix py-3" id="pagination_daftar_guru_tendik">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`);
}

function daftar_guru_tendik_start() {
    daftar_guru_tendik(20);
}

function daftar_guru_tendik(perpage) {
    get_data(perpage, {
        url: "admin/" + kode + "/daftar_guru_tendik",
        pagination_id: "pagination_daftar_guru_tendik",
        bodyTable_id: "body_daftar_guru_tendik",
        fn: "ListDaftarGuruTendik",
        warning_text:
            ' <td colspan="6"><center>Daftar Guru & Tendik Tidak Ditemukan</center></td>',
        param: {
            search: $("#search").val(),
        },
    });
}

function ListDaftarGuruTendik(JSONData) {
    var json = JSON.parse(JSONData);
    var html = `<tr>
                    <td>${json.fullname}</td>
                    <td><center>${json.nip}</center></td>
                    <td>
                        <center>${
                            json.jenis_kelamin == "laki_laki"
                                ? "Laki-laki"
                                : "Perempuan"
                        }
                        </center>
                    </td>
                    <td>
                        <center style="text-transform:uppercase;">${
                            json.jabatan
                        }</center>
                    </td>
                    <td>
                        <center style="text-transform:uppercase;">
                            ${json.status} <br>(${
        json.status_active == "nonactive" ? "Pensiun" : "Active"
    })
                        </center>
                    </td>
                    <td>
                        <center>
                            <button type="button" class="btn btn-default btn-action" title="Edit Guru Tendik" style="margin:.15rem .1rem  !important" onClick="editGuruTendik(${
                                json.id
                            })">
                                <i class="fas fa-pencil-alt" style="font-size: 11px;"></i>
                            </button>
                            <button type="button" class="btn btn-default btn-action" title="Delete Guru Tendik" style="margin:.15rem .1rem  !important" onClick="deleteGuruTendik(${
                                json.id
                            })">
                                <i class="fas fa-times" style="font-size: 11px;"></i>
                            </button>
                        </center>
                    </td>
                </tr>`;
    return html;
}

function deleteGuruTendik(id) {
    ajax_default(
        {
            url: "admin/" + kode + "/deleteGuruTendik",
            method: "post",
            json: true,
            data: {
                id: id,
            },
        },
        function (e) {
            smile_alert(e.msg);
            daftar_guru_tendik(20);
        },
        function (status, errMsg) {
            frown_alert(errMsg.msg);
        }
    );
}

function editGuruTendik(id) {
    ajax_default(
        {
            url: "admin/" + kode + "/getInfoEditMember",
            method: "post",
            json: true,
            data: {
                id: id,
            },
        },
        function (e) {
            $.confirm({
                columnClass: "col-5",
                title: "Edit Data Guru & Tendik",
                type: "blue",
                theme: "material",
                content: formAddGuruTendik(JSON.stringify(e.value)),
                closeIcon: false,
                buttons: {
                    tutup: function () {
                        return true;
                    },
                    formSubmit: {
                        text: "Perbaharui Data Guru / Tendik Baru",
                        btnClass: "btn-blue",
                        action: function () {
                            var par = ajax_default(
                                {
                                    url:
                                        "admin/" + kode + "/update_guru_tendik",
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
                                daftar_guru_tendik(20);
                            }
                        },
                    },
                },
            });
        },
        function (status, errMsg) {
            frown_alert(errMsg);
        }
    );
}

function addGuruTendik() {
    $.confirm({
        columnClass: "col-5",
        title: "Tambah Guru & Tendik",
        type: "blue",
        theme: "material",
        content: formAddGuruTendik(),
        closeIcon: false,
        buttons: {
            tutup: function () {
                return true;
            },
            formSubmit: {
                text: "Tambah Guru / Tendik Baru",
                btnClass: "btn-blue",
                action: function () {
                    ajax_default(
                        {
                            url: "admin/" + kode + "/add_new_guru_tendik",
                            method: "post",
                            form: true,
                            return: true,
                        },
                        function (e) {
                            smile_alert(e.msg);
                            daftar_guru_tendik(20);
                            // return { status: "success", msg: e.msg };
                        },
                        function (status, errMsg) {
                            frown_alert(errMsg.msg);
                            // return { status: "error", msg: errMsg.msg };
                        }
                    );

                    // console.log("+++++++++++par");
                    // console.log(par);
                    // console.log("+++++++++++par");

                    // if (par.status == "error") {
                    //     frown_alert(par.msg);
                    //     return false;
                    // } else {
                    //     smile_alert(par.msg);
                    //     daftar_guru_tendik(20);
                    // }
                },
            },
        },
    });
}

function formAddGuruTendik(JSONValue) {
    var id = "";
    var username = "";
    var nama = "";
    var nip = "";
    var jenis_kelamin = "";
    var jabatan = "";
    var status = "";
    var status_active = "";

    if (JSONValue != undefined) {
        var value = JSON.parse(JSONValue);
        id = `<input type="hidden" name="id" value="${value.id}">`;
        username = value.username;
        nama = value.nama;
        nip = value.nip;
        jenis_kelamin = value.jenis_kelamin;
        jabatan = value.jabatan;
        status = value.status;
        status_active = value.status_active;
    }
    var form = `<form id="form" class="formName" enctype="multipart/form-data" method="post">
                    <div class="row px-0 py-3 mx-0">
                        ${id}
                        <div class="col-12">
                            <div class="form-group">
                                <label>Nama Guru / Tendik</label>
                                <input type="text" class="form-control form-control-sm" name="nama" placeholder="Nama Guru / Tendik" value="${nama}">
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="form-group">
                                <label>NIP</label>
                                <input type="text" class="form-control form-control-sm" name="nip" placeholder="NIP Guru / Tendik" value="${nip}">
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="form-group">
                                <label>Jenis Kelamin</label>
                                <select class="form-control form-control-sm rounded" name="jenis_kelamin">
                                    <option value="laki_laki" ${
                                        jenis_kelamin == "laki_laki"
                                            ? "selected"
                                            : ""
                                    }>Laki-laki</option>
                                    <option value="perempuan" ${
                                        jenis_kelamin == "perempuan"
                                            ? "selected"
                                            : ""
                                    }>Perempuan</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="form-group">
                                <label>Jabatan</label>
                                <select class="form-control form-control-sm rounded" name="jabatan">
                                    <option value="kepsek" ${
                                        jabatan == "kepsek" ? "selected" : ""
                                    }>Kepala Sekolah</option>
                                    <option value="guru" ${
                                        jabatan == "guru" ? "selected" : ""
                                    }>Guru</option>
                                    <option value="tata_usaha" ${
                                        jabatan == "tata_usaha"
                                            ? "selected"
                                            : ""
                                    }>Tata Usaha</option>

                                    <option value="operator_sekolah" ${
                                        jabatan == "operator_sekolah"
                                            ? "selected"
                                            : ""
                                    }>Operator Sekolah</option>
                                    <option value="pustakawan" ${
                                        jabatan == "pustakawan"
                                            ? "selected"
                                            : ""
                                    }>Pustakawan</option>
                                    <option value="satpam" ${
                                        jabatan == "satpam" ? "selected" : ""
                                    }>Satpam</option>
                                    <option value="penjaga_sekolah" ${
                                        jabatan == "penjaga_sekolah"
                                            ? "selected"
                                            : ""
                                    }>Penjaga Sekolah</option>

                                    <option value="cleaning_service" ${
                                        jabatan == "cleaning_service"
                                            ? "selected"
                                            : ""
                                    }>Clearning Service</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="form-group">
                                <label>Status Pegawai</label>
                                <select class="form-control form-control-sm rounded" name="status">
                                    <option value="pns" ${
                                        status == "pns" ? "selected" : ""
                                    }>PNS</option>
                                    <option value="pppk" ${
                                        status == "pppk" ? "selected" : ""
                                    }>PPPK</option>
                                    <option value="kontrak" ${
                                        status == "kontrak" ? "selected" : ""
                                    }>Kontrak</option>
                                    <option value="honorer" ${
                                        status == "honorer" ? "selected" : ""
                                    }>Honorer</option>
                                </select>
                            </div>
                        </div>
                         <div class="col-6">
                            <div class="form-group">
                                <label>Status Aktif</label>
                                <select class="form-control form-control-sm rounded" name="status_active">
                                    <option value="active" ${
                                        status_active == "active"
                                            ? "selected"
                                            : ""
                                    }>Active</option>
                                    <option value="nonactive" ${
                                        status_active == "nonactive"
                                            ? "selected"
                                            : ""
                                    }>Pensiun</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="form-group">
                                <label>Username</label>
                                <input type="text" class="form-control form-control-sm" name="username" placeholder="Username" value="${username}">
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="form-group">
                                <label>Password</label>
                                <input type="password" class="form-control form-control-sm" name="password" placeholder="Password">
                            </div>
                        </div>
                    </div>
                </form>`;
    return form;
}
