function beranda_index() {
    $("#content-area").html(`<div class="row">
                                <div class="col-lg-9 col-12">
                                    <div class="row">
                                        <div class="col-lg-12">
                                            <div class="card  ">
                                                <div class="card-header border-transparent" style="background-image: linear-gradient(141deg, #7d7d7d 0%, #415192fa 75%) !important;">
                                                    <h3 class="card-title mt-0" style="font-size: .975rem;color: white;"><b>RIWAYAT ABSENSI GURU DAN TENDIK HARI INI</b></h3>
                                                    <div class="card-tools">
                                                       
                                                      <div class="input-group input-group-sm" style="width: 300px;">
                                                        <input type="text" id="search" class="form-control float-right" placeholder="Search by NAMA / NIP GURU & TENDIK">
                                                        <div class="input-group-append">
                                                          <button type="button" class="btn btn-default" onClick="riwayat_absensi_hari_ini(10)">
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
                                                                    <th style="width:40%"><center>NAMA / NIP GURU & TENDIK</center></th>
                                                                    <th style="width:15%"><center>MASUK</center></th>
                                                                    <th style="width:15%"><center>KELUAR</center></th>
                                                                    <th style="width:15%"><center>TANGGAL</center></th>
                                                                    <th style="width:15%"><center>WAKTU KERJA</center></th>

                                                                </tr>
                                                            </thead>
                                                            <tbody id="body_daftar_riwayat_absensi">
                                                                <tr>
                                                                    <td colspan="5"><center>Daftar Riwayat Absensi Tidak Ditemukan</center></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                                <div class="card-footer clearfix py-3" id="pagination_daftar_riwayat_absensi">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-lg-3 col-12">
                                    ${card_info_box({
                                        bg_class: "bg-warning",
                                        icon: "fas fa-chalkboard-teacher",
                                        title: "Total Guru & Tendik",
                                        id: "total_guru_tendik",
                                        onClick:
                                            ' onClick="detailSemuaGuruTendik()" ',
                                    })}
                                    ${card_info_box({
                                        bg_class: "bg-danger",
                                        icon: "fas fa-suitcase",
                                        title: "Total Izin",
                                        id: "total_izin",
                                        onClick:
                                            ' onClick="detailSemuaIzin()" ',
                                    })}
                                </div>
                            </div>`);
}

function beranda_start() {
    ajax_default(
        {
            url: "admin/" + kode + "/dashboard_superadmin/",
            method: "post",
        },
        function (e) {
            $("#profil_name").html("<b>" + e.data.name + "</b>");
            $("#total_guru_tendik").html(e.data.total_member + " Orang");
            $("#total_izin").html(e.data.total_izin + " Orang");
        }
    );
    riwayat_absensi_hari_ini(10);
}

function riwayat_absensi_hari_ini(perpage) {
    get_data(perpage, {
        url: "admin/" + kode + "/riwayat_absensi_hari_ini",
        pagination_id: "pagination_daftar_riwayat_absensi",
        bodyTable_id: "body_daftar_riwayat_absensi",
        fn: "ListRiwayatAbsensiHariIni",
        warning_text:
            '<td colspan="5"><center>Daftar Riwayat Absensi Tidak Ditemukan</center></td>',
        param: { search: $("#search").val() },
    });
}

function ListRiwayatAbsensiHariIni(JSONData) {
    var json = JSON.parse(JSONData);
    var html = `<tr>
                    <td>${json.fullname} <br> ${json.nip}</td>            
                    <td><center>${
                        json.masuk == null ? "-" : json.masuk
                    }</center></td>            
                    <td><center>${
                        json.keluar == null ? "-" : json.keluar
                    }</center></td>            
                    <td><center>${json.tanggal}</center></td>    
                    <td><center>${json.total_kerja}</center></td>            
                </tr>`;

    return html;
}

function card_beranda(param) {
    return `<div class="col-lg-3 col-6">
            <div class="small-box ${param.bg_class}">
                <div class="inner">
                    <h4><b id="${param.id}">0</b> </h4>
                    <p style="font-size: 14px;">${param.title}</p>
                </div>
                <div class="icon">
                    <i class="${param.icon}"></i>
                </div>
                <a href="#" class="small-box-footer">More info <i class="fas fa-arrow-circle-right"></i></a>
            </div>
          </div>`;
}

function card_info_box(param) {
    var form = `<div class="info-box mb-3 ${param.bg_class}">
                    <span class="info-box-icon"><i class="${param.icon}"></i></span>
                    <div class="info-box-content">
                        <span class="info-box-text">${param.title}</span>
                        <span class="info-box-number" id="${param.id}">0</span>
                    </div>`;
    if (param.other_button != undefined && param.other_button == true) {
        form += `<span class="info-box-icon" ${param.onClick_other_button}><i class="fas ${param.icon_other_button}"></i></span>`;
    }
    form += `<span class="info-box-icon" ${param.onClick}><i class="fas fa-arrow-circle-right"></i></span>
                </div>`;
    return form;
}
