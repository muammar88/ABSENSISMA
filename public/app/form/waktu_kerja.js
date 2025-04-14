const { stringify } = require("querystring");

function waktu_kerja_index() {
    $("#content-area").html(`<div class="row">
                                <div class="col-lg-12 col-12">
                                    <div class="row">
                                        <div class="col-lg-12">
                                            <div class="card  ">
                                                <div class="card-header border-transparent" style="background-image: linear-gradient(141deg, #7d7d7d 0%, #415192fa 75%) !important;">
                                                    <h3 class="card-title mt-0" style="font-size: .975rem;color: white;"><b>WAKTU KERJA</b></h3>
                                                    <div class="card-tools">
                                                        <div class="input-group input-group-sm " style="width: 1000px;">
                                                           
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="card-body p-0">
                                                    <div class="table-responsive">
                                                        <table class="table m-0">
                                                            <thead>
                                                                <tr>
                                                                    <th style="width:25%"><center>HARI</center></th>
                                                                    <th style="width:15%"><center>MULAI ABSENSI MASUK</center></th>
                                                                    <th style="width:15%"><center>AKHIR ABSENSI MASUK</center></th>
                                                                    <th style="width:15%"><center>MULAI ABSENSI KELUAR</center></th>
                                                                    <th style="width:15%"><center>AKHIR ABSENSI KELUAR</center></th>
                                                                    <th style="width:15%"><center>AKSI</center></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody id="body_waktu_absensi">
                                                                <tr>
                                                                    <td colspan="6"><center>Waktu Absensi Tidak Ditemukan</center></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                                <div class="card-footer clearfix py-3" id="pagination_waktu_absensi">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`);
}

function waktu_kerja_start() {
    waktu_kerja(20);
}

function waktu_kerja(perpage) {
    get_data(perpage, {
        url: "admin/" + kode + "/daftar_waktu_kerja",
        pagination_id: "pagination_waktu_absensi",
        bodyTable_id: "body_waktu_absensi",
        fn: "ListWaktuKerja",
        warning_text:
            '<td colspan="6"><center>Waktu Absensi Tidak Ditemukan</center></td>',
    });
}

function ListWaktuKerja(JSONData) {
    var json = JSON.parse(JSONData);
    return `<tr>
                <td><center>${json.hari}</center></td>
                <td><center>${json.mulai_absensi_masuk}</center></td>
                <td><center>${json.akhir_absensi_masuk}</center></td>
                <td><center>${json.mulai_absensi_keluar}</center></td>
                <td><center>${json.akhir_absensi_keluar}</center></td>
                <td><center>
                    <button type="button" class="btn btn-default btn-action" title="Edit Waktu Kerja" style="margin:.15rem .1rem  !important" 
                        onclick="editWaktuKerja(${json.id})">
                        <i class="fas fa-pencil-alt" style="font-size: 11px;"></i>
                    </button>
                </center></td>
              
            </tr>`;
}

function editWaktuKerja(id) {
    // ajax_default(
    //     {
    //         url: "admin/" + kode + "/info_edit_waktu_kerja",
    //         method: "post",
    //         json: true,
    //         data: { id: id },
    //     },
    //     function (e, xhr) {
    //         if (xhr.status == 200) {
    //             // smile_alert(e.error_msg);
    //             // hari_libur_start();
    //         } else {
    //             frown_alert(e.error_msg);
    //         }
    //     }
    // );

    ajax_default(
        {
            url: "admin/" + kode + "/info_edit_waktu_kerja",
            method: "post",
            json: true,
            data: { id: id },
        },
        function (e, xhr) {
            const data = e.data;
            $.confirm({
                columnClass: "col-5",
                title: "Edit Waktu Kerja",
                type: "blue",
                theme: "material",
                content: formWaktuKerja(id, JSON.stringify(data)),
                closeIcon: false,
                buttons: {
                    tutup: function () {
                        return true;
                    },
                    formSubmit: {
                        text: "Edit Waktu Kerja",
                        btnClass: "btn-blue",
                        action: function () {
                            ajax_default(
                                {
                                    url:
                                        "admin/" + kode + "/update_waktu_kerja",
                                    method: "post",
                                    form: true,
                                },

                                function (e, xhr) {
                                    smile_alert(e.msg);
                                    waktu_kerja(20);
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
            frown_alert(errMsg);
        }
    );
}

function formWaktuKerja(id, JSONValue) {
    var id = "";
    var hari = "";
    var mulai_absensi_masuk = "";
    var akhir_absensi_masuk = "";
    var mulai_absensi_keluar = "";
    var akhir_absensi_keluar = "";

    if (JSONValue != undefined) {
        var value = JSON.parse(JSONValue);
        id = `<input type="hidden" name="id" value="${value.id}">`;
        hari = value.hari;
        mulai_absensi_masuk = value.mulai_absensi_masuk;
        akhir_absensi_masuk = value.akhir_absensi_masuk;
        mulai_absensi_keluar = value.mulai_absensi_keluar;
        akhir_absensi_keluar = value.akhir_absensi_keluar;
    }
    var form = `<form id="form" class="formName" enctype="multipart/form-data" method="post">
                    <div class="row px-0 py-3 mx-0">
                        ${id}
                        <div class="col-12">
                            <div class="form-group">
                                <label>Hari</label>
                                <input type="text" class="form-control form-control-sm" placeholder="Hari" value="${hari}" disabled>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="form-group">
                                <label>Mulai Absensi Masuk</label>
                                <input type="time" class="form-control form-control-sm" name="mulai_absensi_masuk" placeholder="Mulai Absensi Masuk" value="${mulai_absensi_masuk}">
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="form-group">
                                <label>Akhir Absensi Masuk</label>
                                <input type="time" class="form-control form-control-sm" name="akhir_absensi_masuk" placeholder="Akhir Absensi Masuk" value="${akhir_absensi_masuk}">
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="form-group">
                                <label>Mulai Absensi Keluar</label>
                                <input type="time" class="form-control form-control-sm" name="mulai_absensi_keluar" placeholder="Mulai Absensi Keluar" value="${mulai_absensi_keluar}">
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="form-group">
                                <label>Akhir Absensi Keluar</label>
                                <input type="time" class="form-control form-control-sm" name="akhir_absensi_keluar" placeholder="Akhir Absensi Keluar" value="${akhir_absensi_keluar}">
                            </div>
                        </div>
                    </div>
                </form>`;
    return form;
}
