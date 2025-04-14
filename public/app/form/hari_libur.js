function hari_libur_index() {
    $("#content-area").html(`<div class="row">
                                <div class="col-lg-12 col-12">
                                    <div class="row">
                                        <div class="col-lg-12">
                                            <div class="card  ">
                                                <div class="card-header border-transparent" style="background-image: linear-gradient(141deg, #7d7d7d 0%, #415192fa 75%) !important;">
                                                    <h3 class="card-title mt-0" style="font-size: .975rem;color: white;"><b>DAFTAR HARI LIBUR</b></h3>
                                                    <div class="card-tools">
                                                        <div class="input-group input-group-sm " style="width: 500px;">
                                                            <button type="button" class="btn btn-primary  btn-sm  mx-2" onClick="addHoliday()">
                                                                <i class="fas fa-calendar-plus"></i> Tambah Hari Libur
                                                            </button>
                                                            <input type="date" id="search" class="form-control float-right" style="width: 200px;" placeholder="Search by TANGGAL">
                                                            <div class="input-group-append" >
                                                                <button type="button" class="btn btn-default" onClick="hari_libur_start()">
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
                                                                    <th style="width:25%"><center>KETERANGAN</center></th>
                                                                    <th style="width:25%"><center>TANGGAL</center></th>
                                                                    <th style="width:25%"><center>BERULANG</center></th>
                                                                    <th style="width:25%"><center>AKSI</center></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody id="body_hari_libur">
                                                                <tr>
                                                                    <td colspan="6"><center>Daftar Hari Libur Tidak Ditemukan</center></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                                <div class="card-footer clearfix py-3" id="pagination_hari_libur">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`);
}

function hari_libur_start() {
    hari_libur(20);
}

function hari_libur(perpage) {
    get_data(perpage, {
        url: "admin/" + kode + "/daftar_hari_libur",
        pagination_id: "pagination_hari_libur",
        bodyTable_id: "body_hari_libur",
        fn: "ListHariLibur",
        warning_text:
            '<td colspan="6"><center>Daftar Hari Libur Tidak Ditemukan</center></td>',
        param: {
            search: $("#search").val(),
        },
    });
}

function ListHariLibur(JSONData) {
    var json = JSON.parse(JSONData);
    return `<tr>
                <td>${json.ket}</td>
                <td><center>${json.dateHoliday}</center></td>
                <td><center>${
                    json.repeat == "annually" ? "Tahunan" : "Satu Kali"
                }</center></td>
                <td>
                    <center>
                        <button type="button" class="btn btn-default btn-action" title="Edit Hari Libur" style="margin:.15rem .1rem  !important" 
                            onclick="editHoliday(${json.id})">
                            <i class="fas fa-pencil-alt" style="font-size: 11px;"></i>
                        </button>
                        <button type="button" class="btn btn-default btn-action" title="Hapus Hari Libur" style="margin:.15rem .1rem  !important" 
                            onclick="hapusHoliday(${json.id})">
                            <i class="fas fa-times" style="font-size: 11px;"></i>
                        </button>
                    </center>
                </td>
            </tr>`;
}

function addHoliday() {
    $.confirm({
        columnClass: "col-5",
        title: "Tambah Hari Libur",
        type: "blue",
        theme: "material",
        content: formTambahEditHariLibur(),
        closeIcon: false,
        buttons: {
            tutup: function () {
                return true;
            },
            formSubmit: {
                text: "Tambah Hari Libur",
                btnClass: "btn-blue",
                action: function () {
                    ajax_default(
                        {
                            url: "admin/" + kode + "/add_holiday",
                            method: "post",
                            form: true,
                        },
                        function (e, xhr) {
                            if (xhr.status == 200) {
                                smile_alert(e.error_msg);
                                hari_libur_start();
                            } else {
                                frown_alert(e.error_msg);
                            }
                        }
                    );
                },
            },
        },
    });
}

// edit holiday
function editHoliday(id) {
    ajax_default(
        {
            url: "admin/" + kode + "/get_info_edit_holiday",
            method: "post",
            json: true,
            data: { id: id },
        },
        function (e, xhr) {
            $.confirm({
                columnClass: "col-5",
                title: "Edit Hari Libur",
                type: "blue",
                theme: "material",
                content: formTambahEditHariLibur(JSON.stringify(e.data)),
                closeIcon: false,
                buttons: {
                    tutup: function () {
                        return true;
                    },
                    formSubmit: {
                        text: "Perbaharui Hari Libur",
                        btnClass: "btn-blue",
                        action: function () {
                            ajax_default(
                                {
                                    url: "admin/" + kode + "/update_holiday",
                                    method: "post",
                                    form: true,
                                },
                                function (e, xhr) {
                                    if (xhr.status == 200) {
                                        smile_alert(e.error_msg);
                                        hari_libur_start();
                                    } else {
                                        frown_alert(e.error_msg);
                                    }
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

function hapusHoliday(id) {
    ajax_default(
        {
            url: "admin/" + kode + "/deleteHoliday",
            method: "post",
            json: true,
            data: { id: id },
        },
        function (e, xhr) {
            smile_alert(e.msg);
            hari_libur_start();
        },
        function (status, errMsg) {
            frown_alert(errMsg);
        }
    );
}

function formTambahEditHariLibur(JSONValue) {
    var id = "";
    var ket = "";
    var tanggal = "";
    var repeat = "";

    if (JSONValue != undefined) {
        var value = JSON.parse(JSONValue);
        id = `<input type="hidden" name="id" value="${value.id}">`;
        ket = value.ket;
        tanggal = value.dateHoliday;
        repeat = value.repeat;
    }
    var form = `<form id="form" class="formName" enctype="multipart/form-data" method="post">
                    <div class="row px-0 py-3 mx-0">
                        <div class="col-12">
                            <div class="form-group">
                                ${id}
                                <label>Keterangan</label>
                                <textarea class="form-control form-control-sm" name="keterangan" placeholder="Keterangan" rows="7" style="resize: none;">${ket}</textarea>
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
                                <label>Berulang</label>
                                <select class="form-control form-control-sm rounded" name="repeat">
                                    <option value="annually" ${
                                        repeat == "annually" ? "selected" : ""
                                    } >Tahunan</option>
                                    <option value="onetime" ${
                                        repeat == "onetime" ? "selected" : ""
                                    }>Satu Kali</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </form>`;
    return form;
}
