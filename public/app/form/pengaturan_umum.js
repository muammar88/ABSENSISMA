function pengaturan_umum_index() {
    var day = {
        senin: "Senin",
        selasa: "Selasa",
        rabu: "Rabu",
        kamis: "Kamis",
        jumat: "Jumat",
        sabtu: "Sabtu",
        minggu: "Minggu",
    };
    var formHtml = "";
    for (x in day) {
        formHtml += `<div class="form-check">
                        <input class="form-check-input input_pengaturan" type="checkbox" id="check${x}" name="check${day[x]}" value="${x}" disabled>
                        <label class="form-check-label" for="check${x}">
                            ${day[x]}
                        </label>
                    </div>`;
    }
    $("#content-area").html(`<div class="row">
                                <div class="col-lg-12 col-12">
                                    <div class="row">
                                        <div class="col-lg-12">
                                            <div class="card  ">
                                                <div class="card-header border-transparent" style="background-image: linear-gradient(141deg, #7d7d7d 0%, #415192fa 75%) !important;">
                                                    <h3 class="card-title mt-0" style="font-size: .975rem;color: white;"><b>PENGATURAN UMUM</b></h3>
                                                    <div class="card-tools">
                                                        <div class="input-group input-group-sm float-right btnpengaturan">
                                                            <button type="button" class="btn btn-default btn-sm mx-2" onClick="editPengaturan()" >
                                                                <i class="fas fa-pencil-alt"></i> Edit Pengaturan
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="card-body p-0">
                                                    <form id="form" class="formName" enctype="multipart/form-data" method="post">
                                                        <div class="table-responsive">
                                                            <table class="table m-0">
                                                                <tbody >
                                                                    <tr>
                                                                        <td style="width:20%;"><label class="my-2">NAMA APLIKASI</label></td>
                                                                        <td > 
                                                                            <div class="row">   
                                                                                <div class="col-lg-6">
                                                                                    <div class="form-group mb-0">
                                                                                        <input type="text" class="form-control form-control-sm input_pengaturan" id="nama_aplikasi" name="nama_aplikasi" placeholder="Nama Aplikasi" disabled>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td ><label class="my-2">NAMA SEKOLAH</label></td>
                                                                        <td > 
                                                                            <div class="row">   
                                                                                <div class="col-lg-6">
                                                                                    <div class="form-group mb-0">
                                                                                        <input type="text" class="form-control form-control-sm input_pengaturan" id="nama_sekolah" name="nama_sekolah" placeholder="Nama Sekolah" disabled>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td ><label class="my-2">NAMA LENGKAP KEPALA SEKOLAH</label></td>
                                                                        <td > 
                                                                            <div class="row">   
                                                                                <div class="col-lg-4">
                                                                                    <div class="form-group mb-0">
                                                                                        <input type="text" class="form-control form-control-sm input_pengaturan" id="nama_kepala_sekolah" name="nama_kepala_sekolah" placeholder="Nama Lengkap Kepala Sekolah" disabled>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td ><label class="my-2">NIP KEPALA SEKOLAH</label></td>
                                                                        <td > 
                                                                            <div class="row">   
                                                                                <div class="col-lg-3">
                                                                                    <div class="form-group mb-0">
                                                                                        <input type="text" class="form-control form-control-sm input_pengaturan" id="nip_kepala_sekolah" name="nip_kepala_sekolah" placeholder="NIP Kepala Sekolah" disabled>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td ><label class="my-2">MULAI ABSENSI MASUK</label></td>
                                                                        <td > 
                                                                            <div class="row">   
                                                                                <div class="col-lg-2">
                                                                                    <div class="form-group mb-0">
                                                                                        <input type="time" class="form-control form-control-sm input_pengaturan" id="mulai_absensi_masuk" name="mulai_absensi_masuk" placeholder="Mulai Absensi Masuk" disabled>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td ><label class="my-2">AKHIR ABSENSI MASUK</label></td>
                                                                        <td > 
                                                                            <div class="row">   
                                                                                <div class="col-lg-2">
                                                                                    <div class="form-group mb-0">
                                                                                        <input type="time" class="form-control form-control-sm input_pengaturan" id="akhir_absensi_masuk" name="akhir_absensi_masuk" placeholder="Akhir Absensi Masuk" disabled>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td ><label class="my-2">MULAI ABSENSI KELUAR</label></td>
                                                                        <td > 
                                                                            <div class="row">   
                                                                                <div class="col-lg-2">
                                                                                    <div class="form-group mb-0">
                                                                                        <input type="time" class="form-control form-control-sm input_pengaturan" id="mulai_absensi_keluar" name="mulai_absensi_keluar" placeholder="Mulai Absensi Keluar" disabled>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td ><label class="my-2">AKHIR ABSENSI KELUAR</label></td>
                                                                        <td > 
                                                                            <div class="row">   
                                                                                <div class="col-lg-2">
                                                                                    <div class="form-group mb-0">
                                                                                        <input type="time" class="form-control form-control-sm input_pengaturan" id="akhir_absensi_keluar" name="akhir_absensi_keluar" placeholder="Akhir Absensi Keluar" disabled>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td ><label class="my-2">LETITUDE PUSAT ABSENSI</label></td>
                                                                        <td > 
                                                                            <div class="row">   
                                                                                <div class="col-lg-4">
                                                                                    <div class="form-group mb-0">
                                                                                        <input type="text" class="form-control form-control-sm input_pengaturan" id="letitude" name="letitude" placeholder="Letitude Pusat Absensi" disabled>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td ><label class="my-2">LONGITUDE PUSAT ABSENSI</label></td>
                                                                        <td > 
                                                                            <div class="row">   
                                                                                <div class="col-lg-4">
                                                                                    <div class="form-group mb-0">
                                                                                        <input type="number" min="5" max="25" step="5" class="form-control form-control-sm input_pengaturan" id="longitude" name="longitude" placeholder="Longitude Pusat Absensi" disabled>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td ><label class="my-2">JARAK ABSENSI</label></td>
                                                                        <td > 
                                                                            <div class="row">   
                                                                                <div class="col-lg-4">
                                                                                    <div class="form-group mb-0">
                                                                                        <input type="number" min="5" max="25" class="form-control form-control-sm input_pengaturan" id="jarak" name="jarak" placeholder="Jarak Dari Pusat Absensi" disabled>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td ><label class="my-2">HARI LIBUR MINGGUAN</label></td>
                                                                        <td > 
                                                                            <div class="row">   
                                                                                <div class="col-lg-2">
                                                                                    ${formHtml}
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </form>
                                                </div>
                                                <div class="card-footer border-transparent clearfix py-2 px-2 rounded-bottom text-right" style="background-image: linear-gradient(141deg, #7d7d7d 0%, #415192fa 75%) !important;">
                                                    <div class="card-tools float-right">
                                                        <div class="input-group input-group-sm float-right btnpengaturan">
                                                            <button type="button" class="btn btn-default btn-sm mx-2 " onClick="editPengaturan()" >
                                                                <i class="fas fa-pencil-alt"></i> Edit Pengaturan
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`);
}

function pengaturan_umum_start() {
    ajax_default(
        {
            url: "admin/" + kode + "/get_info_pengaturan_umum",
            method: "post",
            json: true,
        },
        function (e) {
            $("#nama_aplikasi").val(e.data.nama_aplikasi);
            $("#nama_sekolah").val(e.data.nama_sekolah);
            $("#nama_kepala_sekolah").val(e.data.nama_kepala_sekolah);
            $("#nip_kepala_sekolah").val(e.data.nip_kepala_sekolah);
            $("#mulai_absensi_masuk").val(e.data.mulai_absensi_masuk);
            $("#akhir_absensi_masuk").val(e.data.akhir_absensi_masuk);
            $("#mulai_absensi_keluar").val(e.data.mulai_absensi_keluar);
            $("#akhir_absensi_keluar").val(e.data.akhir_absensi_keluar);
            var hari_libur_mingguan = JSON.parse(e.data.hari_libur_mingguan);
            for (x in hari_libur_mingguan) {
                $("#check" + hari_libur_mingguan[x]).prop("checked", true);
            }
            $("#letitude").val(e.data.letitude);
            $("#longitude").val(e.data.longitude);
            $("#jarak").val(e.data.jarak);
        },
        function (status, errMsg) {
            frown_alert(errMsg);
        }
    );
}

function editPengaturan() {
    $(".input_pengaturan").prop("disabled", false);
    $(".btnpengaturan").html(
        `<button type="button" class="btn btn-default btn-sm mx-0 btnpengaturan" onClick="batalPengaturan()" >
            <i class="fas fa-times"></i> Batal Perubahan
        </button>
        <button type="button" class="btn btn-primary btn-sm mx-2 btnpengaturan" onClick="simpanPerubahanPengaturan()" >
            <i class="fas fa-save"></i> Simpan Perubahan
        </button>`
    );
}

function simpanPerubahanPengaturan() {
    ajax_default(
        {
            url: "admin/" + kode + "/simpanPerubahanPengaturan",
            method: "post",
            form: true,
        },
        function (e) {
            smile_alert(e.msg);
            $(".input_pengaturan").prop("disabled", true);
            $(".btnpengaturan").html(
                `<button type="button" class="btn btn-default btn-sm mx-2 btnpengaturan" onClick="editPengaturan()" >
                    <i class="fas fa-pencil-alt"></i> Edit Pengaturan
                </button>`
            );
            pengaturan_umum_start();
        },
        function (status, errMsg) {
            frown_alert(errMsg.msg);
        }
    );
}

function batalPengaturan() {
    $(".input_pengaturan").prop("disabled", true);
    $(".btnpengaturan").html(
        `<button type="button" class="btn btn-default btn-sm mx-2 btnpengaturan" onClick="editPengaturan()" >
                <i class="fas fa-pencil-alt"></i> Edit Pengaturan
            </button>`
    );
    pengaturan_umum_start();
}
