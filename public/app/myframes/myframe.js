/*
    This Application Create and Develop by Muammar Kadafi in malemdiwa team
    Developed at 2022
*/

let base_url = window.location.origin;

let objectLength = (object) => {
    return Object.keys(object).length;
};

let smile_alert = (text) => {
    $.alert({
        icon: "far fa-smile",
        title: "Sukses",
        content: text,
        type: "blue",
    });
};

let frown_alert = (text) => {
    $.alert({
        icon: "far fa-frown",
        title: "Gagal",
        content: text,
        type: "red",
    });
};

function numberFormat(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

function parsingText(text, long) {
    var splitText = text.split(" ");
    var newText = "";
    for (x = 0; x <= long; x++) {
        if (splitText[x] != undefined) {
            newText = newText + " " + splitText[x];
        }
    }
    return newText + "...";
}

function ajax_file(param, callback, err_callback) {
    let url = param.url == undefined ? "" : param.url;
    let method = param.method == undefined ? "" : param.method;
    let loader = param.loader == undefined ? false : true;
    let headers = {};
    var ret;
    if (localStorage.hasOwnProperty("Bearer")) {
        headers["Authorization"] = "Bearer " + localStorage.getItem("Bearer");
    }
    let data = {};
    if (param.form != undefined && param.form == true) {
        data = new FormData(document.getElementById("form"));
        if (param.ckeditor == true) {
            data.append(
                param.ckeditor_name,
                CKEDITOR.instances[param.ckeditor_name].getData()
            );
        }
    } else {
        if (param.data != undefined) {
            for (x in param.data) data[x] = param.data[x];
        }
    }

    $.ajax({
        url: base_url + "/" + url,
        type: method,
        data: data,
        dataType: "json",
        mimeType: "multipart/form-data",
        headers: headers,
        contentType: false,
        cache: false,
        processData: false,
        async: param.return != undefined && param.return == true ? false : true,
        beforeSend: function () {
            if (loader == true) $("#loader").show();
        },
        success: function (e, textStatus, xhr) {
            console.log("masuk success");
            if (loader == true) $("#loader").hide();
            if (e.accessToken != undefined)
                localStorage.setItem("Bearer", e.accessToken);
            if (param.return != undefined && param.return == true) {
                ret = callback(e, xhr);
            } else {
                callback(e, xhr);
            }
        },
        error: function (xhr, status, error) {
            if (loader == true) $("#loader").hide();
            var errMsg = eval("(" + xhr.responseText + ")");
            err_callback(xhr.status, errMsg);
        },
        complete: function () {
            if (loader == true) $("#loader").show();
        },
    });

    if (param.return != undefined && param.return == true) return ret;
}

function ajax_default(param, callback, err_callback) {
    let url = param.url == undefined ? "" : param.url;
    let method = param.method == undefined ? "" : param.method;
    let loader = param.loader == undefined ? false : true;
    let headers = {};
    var ret;
    if (localStorage.hasOwnProperty("Bearer")) {
        headers["Authorization"] = "Bearer " + localStorage.getItem("Bearer");
    }
    let data = {};
    if (param.form != undefined && param.form == true) {
        var formData;
        if (param.form_id != undefined) {
            formData = new FormData(document.getElementById(param.form_id));
        } else {
            formData = new FormData(document.getElementById("form"));
        }
        for (const [key, value] of formData) {
            data[key] = value;
        }
        if (param.ckeditor == true) {
            data[param.ckeditor_name] =
                CKEDITOR.instances[param.ckeditor_name].getData();
        }
    } else {
        if (param.data != undefined) {
            for (x in param.data) data[x] = param.data[x];
        }
    }
    processData = true;
    if (param.processData != undefined) {
        processData = false;
    }
    // console.log("method");
    // console.log(method);
    // console.log("method");
    $.ajax({
        url: base_url + "/" + url,
        type: method,
        data: data,
        dataType: "json",
        mimeType: "multipart/form-data",
        headers: headers,
        cache: false,
        processData: processData,
        async: param.return != undefined && param.return == true ? false : true,
        beforeSend: function () {
            if (loader == true) $("#loader").show();
        },
        success: function (e, textStatus, xhr) {
            console.log("masuk success");
            if (loader == true) $("#loader").hide();
            if (e.accessToken != undefined)
                localStorage.setItem("Bearer", e.accessToken);
            if (param.return != undefined && param.return == true) {
                ret = callback(e, xhr);
            } else {
                callback(e, xhr);
            }
        },
        error: function (xhr, status, error) {
            if (loader == true) $("#loader").hide();
            var errMsg = eval("(" + xhr.responseText + ")");
            err_callback(xhr.status, errMsg);
        },
        complete: function () {
            if (loader == true) $("#loader").hide();
        },
    });

    if (param.return != undefined && param.return == true) return ret;
}

function get_data(perpage, JSONData) {
    // create first param
    var paramFirts = {};
    paramFirts["perpage"] = perpage;
    for (x in JSONData["param"]) {
        paramFirts[x] = JSONData["param"][x];
    }
    ajax_default(
        {
            url: JSONData["url"],
            method: "post",
            data: paramFirts,
        },
        function (e) {
            var paginationNumber = e["total"];
            var data = new Array();
            for (var i = 1; i <= paginationNumber; i++) {
                data.push(i);
            }
            var container = $("#" + JSONData["pagination_id"]);
            container.pagination({
                dataSource: data,
                pageSize: perpage,
                showPrevious: true,
                showNext: true,
                callback: function (data, pagination) {
                    // create first param
                    var paramSecond = {};
                    paramSecond["pageNumber"] = pagination["pageNumber"];
                    paramSecond["perpage"] = perpage;
                    for (y in JSONData["param"]) {
                        paramSecond[y] = JSONData["param"][y];
                    }
                    var html = "";
                    if (pagination["pageNumber"] == 1) {
                        if (e["data"] != undefined) {
                            if (Object.keys(e.data).length > 0) {
                                for (x in e["data"]) {
                                    html += window[JSONData["fn"]](
                                        JSON.stringify(e["data"][x])
                                    );
                                }
                            } else {
                                html += `<tr>${JSONData["warning_text"]}</tr>`;
                            }
                        } else {
                            html += `<tr>${JSONData["warning_text"]}</tr>`;
                        }
                        $("#" + JSONData["bodyTable_id"]).html(html);
                        $(".paginationjs").append(
                            `<div class='d-inline-block float-right' style='line-height: 1.6;'>Total : ${e.total} Entries</div>`
                        );
                    } else {
                        ajax_default(
                            {
                                url: JSONData["url"],
                                method: "post",
                                data: paramSecond,
                            },
                            function (e) {
                                if (e["data"] != undefined) {
                                    if (Object.keys(e.data).length > 0) {
                                        for (x in e["data"]) {
                                            html += window[JSONData["fn"]](
                                                JSON.stringify(e["data"][x])
                                            );
                                        }
                                    } else {
                                        html += `<tr>${JSONData["warning_text"]}</tr>`;
                                    }
                                } else {
                                    html += `<tr>${JSONData["warning_text"]}</tr>`;
                                }
                                $("#" + JSONData["bodyTable_id"]).html(html);
                                $(".paginationjs").append(
                                    `<div class='d-inline-block float-right' style='line-height: 1.6;'>Total : ${e.total} Entries</div>`
                                );
                            }
                        );
                    }
                },
            });
        }
    );
}

let breadcrumb = (param) => {
    return `<div class="content-header">
                <div class="container-fluid">
                    <div class="row mb-2">
                        <div class="col-sm-6 pt-1">
                            <h4 class="m-0" style="color:  rgba(0,0,0,.5);font-size: 17px;" ><i class="${
                                param.icon
                            }"></i> ${capitalizeFirstLetter(
        param.menu.replace("_", " ")
    )}</h4>
                        </div>
                        <div class="col-sm-6">
                            <ol class="breadcrumb float-sm-right">
                                <li class="breadcrumb-item"><a href="#">${capitalizeFirstLetter(
                                    param.menu.replace("_", " ")
                                )}</a></li>
                                ${
                                    param.submenu != undefined
                                        ? `<li class="breadcrumb-item active">${capitalizeFirstLetter(
                                              param.submenu.replace("_", " ")
                                          )}</li>`
                                        : ""
                                }
                            </ol>
                        </div>
                    </div>
                </div>
            </div>`;
};

let menu = (icon, menu, submenu) => {
    param = {};
    param["icon"] = icon;
    param["menu"] = menu;
    if (submenu != undefined) {
        param["submenu"] = submenu;
    }
    // disabled active
    $(".nav-link").removeClass("active");
    // param
    $(".content-header").replaceWith(breadcrumb(param));
    // add class active
    if (menu != undefined) $("." + menu).addClass("active");
    if (submenu != undefined) $("." + submenu).addClass("active");
    // checking function funct is exist
    let FnCk = (fn) => {
        if (eval("typeof " + fn) === "function") {
            return true;
        } else {
            return false;
        }
    };

    if (param.submenu != undefined) {
        $("#content-area").html(
            FnCk(param.submenu + "_index")
                ? window[param.submenu + "_index"]()
                : "<center>" +
                      capitalizeFirstLetter(param.submenu.replace("_", " ")) +
                      "</center>"
        );
        if (FnCk(param.submenu + "_start")) window[param.submenu + "_start"]();
    } else {
        $("#content-area").html(
            FnCk(param.menu + "_index")
                ? window[param.menu + "_index"]()
                : "<center>" +
                      capitalizeFirstLetter(param.menu.replace("_", " ")) +
                      "</center>"
        );
        if (FnCk(param.menu + "_start")) window[param.menu + "_start"]();
    }
};

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
