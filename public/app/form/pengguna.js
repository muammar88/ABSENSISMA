function pengguna_index() {
    $("#content-area").html(`<div class="row">
                                <div class="col-lg-12 col-12">
                                    <div class="row">
                                        <div class="col-lg-12">
                                            <div class="card  ">
                                                <div class="card-header border-transparent" style="background-image: linear-gradient(141deg, #7d7d7d 0%, #415192fa 75%) !important;">
                                                    <h3 class="card-title mt-0" style="font-size: .975rem;color: white;"><b>DAFTAR PENGGUNA</b></h3>
                                                    <div class="card-tools">
                                                        <div class="input-group input-group-sm " style="width: 500px;">
                                                            <button type="button" class="btn btn-primary btn-sm mx-2" onClick="addPengguna()">
                                                                <i class="fas fa-plus"></i> Tambah Pengguna
                                                            </button>
                                                            <input type="text" id="search" class="form-control float-right"  style="width: 200px;" placeholder="Search by KODE PENGGUNA, NAMA PENGGUNA">
                                                            <div class="input-group-append" >
                                                                <button type="button" class="btn btn-default" onClick="daftar_pengguna()">
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
                                                                    <th style="width:10%"><center>KODE</center></th>
                                                                    <th style="width:20%"><center>USERNAME</center></th>
                                                                    <th style="width:20%"><center>LEVEL</center></th>
                                                                    <th style="width:20%"><center>FAKULTAS</center></th>
                                                                    <th style="width:20%"><center>PEMBAHARUAN</center></th>
                                                                    <th style="width:10%"><center>AKSI</center></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody id="body_daftar_pengguna">
                                                                <tr>
                                                                    <td colspan="6"><center>Daftar pengguna tidak ditemukan</center></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                                <div class="card-footer clearfix py-3" id="pagination_daftar_pengguna">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`);
}

function pengguna_start() {
    daftar_pengguna(20);
}

function daftar_pengguna(perpage) {
    get_data(perpage, {
        url: "admin/" + kode + "/daftar_pengguna",
        pagination_id: "pagination_daftar_pengguna",
        bodyTable_id: "body_daftar_pengguna",
        fn: "ListDaftarPengguna",
        warning_text:
            '<td colspan="6"><center>Daftar Hari Libur Tidak Ditemukan</center></td>',
        param: {
            search: $("#search").val(),
        },
    });
}

function ListDaftarPengguna(JSONData) {
    var json = JSON.parse(JSONData);

    var btn = `<button type="button" class="btn btn-default btn-action" title="Edit Pengguna" style="margin:.15rem .1rem  !important" onclick="editPengguna(${json.id})">
                    <i class="fas fa-pencil-alt" style="font-size: 11px;"></i>
                </button>
                <button type="button" class="btn btn-default btn-action" title="Hapus Pengguna" style="margin:.15rem .1rem  !important" onclick="hapusPengguna(${json.id})">
                    <i class="fas fa-times" style="font-size: 11px;"></i>
                </button>`;

    var html = `<tr>
                    <td><center>${json.kode}</center></td>
                    <td><center>${json.name}</center></td>
                    <td><center>${json.level}</center></td>
                    <td><center>${json.fakultas}</center></td>
                    <td><center>${json.pembaharuan}</center></td>
                    <td>`;
    html +=
        json.level != "superadmin"
            ? `<center>${btn}</center>`
            : `<center>Akun ini tidak dapat dihapus ataupun diedit</center>`;
    html += `</td>
                </tr>`;
    return html;
}

function editPengguna(id) {
    ajax_default(
        {
            url: "admin/" + kode + "/get_info_edit_pengguna",
            method: "post",
            data: { id: id },
        },
        function (e, xhr) {
            $.confirm({
                columnClass: "col-5",
                title: "Tambah Pengguna",
                type: "blue",
                theme: "material",
                content: formTambahPengguna(
                    JSON.stringify(e.data),
                    JSON.stringify(e.value)
                ),
                closeIcon: false,
                buttons: {
                    tutup: function () {
                        return true;
                    },
                    formSubmit: {
                        text: "Tambah Pengguna",
                        btnClass: "btn-blue",
                        action: function () {
                            ajax_default(
                                {
                                    url: "admin/" + kode + "/edit_pengguna",
                                    method: "post",
                                    form: true,
                                },

                                function (e, xhr) {
                                    smile_alert(e.msg);
                                    pengguna_start();
                                },
                                function (status, errMsg) {
                                    frown_alert(errMsg.msg);
                                }
                            );
                        },
                    },
                },
            });
        },
        function (status, errMsg) {
            frown_alert(errMsg.msg);
        }
    );
}

function addPengguna() {
    ajax_default(
        {
            url: "admin/" + kode + "/get_kode_pengguna",
            method: "get",
        },
        function (e, xhr) {
            $.confirm({
                columnClass: "col-5",
                title: "Tambah Pengguna",
                type: "blue",
                theme: "material",
                content: formTambahPengguna(JSON.stringify(e.data)),
                closeIcon: false,
                buttons: {
                    tutup: function () {
                        return true;
                    },
                    formSubmit: {
                        text: "Tambah Pengguna",
                        btnClass: "btn-blue",
                        action: function () {
                            ajax_default(
                                {
                                    url: "admin/" + kode + "/add_pengguna",
                                    method: "post",
                                    form: true,
                                },
                                function (e, xhr) {
                                    smile_alert(e.msg);
                                    pengguna_start();
                                },
                                function (status, errMsg) {
                                    frown_alert(errMsg.msg);
                                }
                            );
                        },
                    },
                },
            });
        },
        function (status, errMsg) {
            frown_alert(errMsg.msg);
        }
    );
}

function formTambahPengguna(JSONData, JSONValue) {
    var json = JSON.parse(JSONData);
    var kode;
    var id = "";
    var username = "";
    var level = "";
    var fakultas_id = "";
    if (JSONValue != undefined) {
        var value = JSON.parse(JSONValue);
        id = `<input type="hidden" name="id" value="${value.id}">`;
        kode = value.kode;
        username = value.name;
        level = value.level;
        username = value.name;
        if (level == "administrator_fakultas") {
            fakultas_id = value.fakultas_id;
        }
    } else {
        kode = json.kode;
    }
    var form = `<form id="form" class="formName" enctype="multipart/form-data" method="post">
                    <div class="row px-0 py-3 mx-0">
                        <div class="col-12">
                            <div class="form-group">
                                ${id}
                                <label>Kode Pengguna</label>
                                <input type="text" class="form-control form-control-sm" placeholder="Kode Pengguna" value="${kode}" disabled>
                                <input type="hidden" name="kode" value="${kode}">
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="form-group">
                                <label>Username</label>
                                <input type="text" class="form-control form-control-sm" name="username" placeholder="Nama Pengguna" value="${username}">
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="form-group">
                                <label>Level</label>
                                <select class="form-control form-control-sm rounded" name="level" id="level" onchange="getFakultas()">>
                                    <option value="0" >Pilih Level</option>
                                    <option value="administrator_biro" ${
                                        level == "administrator_biro"
                                            ? "selected"
                                            : ""
                                    } >Administrator Biro</option>
                                    <option value="administrator_fakultas" ${
                                        level == "administrator_fakultas"
                                            ? "selected"
                                            : ""
                                    }>Administrator Fakultas</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-12" id="fakultasArea">`;

    if (level == "administrator_fakultas" && id != "") {
        form += `<div class="form-group" >
                    <label>Fakultas</label>
                    <select class="form-control form-control-sm rounded" name="fakultas">
                        <option value="0" >Pilih Fakultas</option>`;
        for (x in json.fakultas) {
            form += `<option value="${json.fakultas[x].id}" ${
                json.fakultas[x].id == fakultas_id ? "selected" : ""
            }>${json.fakultas[x].name}</option>`;
        }
        form += `</select>
                </div>`;
    }
    form += `</div>
                        <div class="col-12">
                            <div class="form-group">
                                <label>Password</label>
                                <input type="password" class="form-control form-control-sm" name="password" placeholder="Password" >
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="form-group">
                                <label>Konf Password</label>
                                <input type="password" class="form-control form-control-sm" name="konf_password" placeholder="Konfirmasi Password" >
                            </div>
                        </div>
                    </div>
                </form>`;
    return form;
}

function getFakultas() {
    var level = $("#level").val();
    if (level == "administrator_fakultas") {
        ajax_default(
            {
                url: "admin/" + kode + "/get_list_fakultas",
                method: "get",
            },
            function (e, xhr) {
                var html = `<div class="form-group" >
                                <label>Fakultas</label>
                                <select class="form-control form-control-sm rounded" name="fakultas">
                                    <option value="0" >Pilih Fakultas</option>`;
                for (x in e.data) {
                    html += `<option value="${e.data[x].id}">${e.data[x].name}</option>`;
                }
                html += `</select>
                            </div>`;
                $("#fakultasArea").html(html);
            },
            function (status, errMsg) {
                $("#fakultasArea").html("");
            }
        );
    } else {
        $("#fakultasArea").html("");
    }
}

function hapusPengguna(id) {
    ajax_default(
        {
            url: "admin/" + kode + "/hapus_pengguna",
            method: "post",
            data: { id: id },
        },
        function (e, xhr) {
            smile_alert(e.msg);
            pengguna_start();
        },
        function (status, errMsg) {
            frown_alert(errMsg.msg);
        }
    );
}
