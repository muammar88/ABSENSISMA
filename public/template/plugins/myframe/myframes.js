/*
    This Application Create and Develop by Muammar in malemdiwa team
    Developed at 2020
*/

let smile_alert = (text) => {
    $.alert({
        icon: "bi bi-emoji-smile",
        title: "Peringatan",
        content: text,
        type: "green",
    });
};

let frown_alert = (text) => {
    $.alert({
        icon: "bi bi-emoji-frown",
        title: "Peringatan",
        content: text,
        type: "red",
    });
};

let menu = (path, sub_path) => {
    // remove class
    $(".nav-link").removeClass("active");
    $(".dropdown-item").removeClass("active");
    // add class
    $("#" + path).addClass("active");
    if (sub_path != undefined) {
        $("#" + sub_path).addClass("active");
        var content = window[sub_path + "_view"]();
        $("#content-page").html(content);
        $(".breadcrumb")
            .html(` <li class="breadcrumb-item p-2" style="text-transform: capitalize;color: #6c757d;background-color: white;">
                        ${path.replace("_", " ")}
                    </li>
                    <li class="breadcrumb-item active-breadcum p-2" aria-current="page">
                        <a class="a" onClick="menu(${path},${sub_path})">${sub_path.replace(
            "_",
            " "
        )}
                        </a>
                    </li>`);
        window[sub_path + "_index"]();
    } else {
        var content = window[path + "_view"]();
        $("#content-page").html(content);
        window[path + "_index"]();
        $(".breadcrumb")
            .html(` <li class="breadcrumb-item active-breadcum p-2" >
                        <a class="a" onClick="menu(${path})">${path}</a>
                    </li>`);
    }
    $("#loader").hide();
};

// ajax submit
function ajax_submit(is, callback, type, loader) {
    if (loader == undefined || loader == true) {
        loader = true;
    } else {
        loader = false;
    }
    if (type == undefined) {
        type = "post";
    }
    var token = localStorage.getItem("Bearer");
    var action = $(is).attr("action");
    var formData = new FormData($(is)[0]);
    $.ajax({
        url: action + "?_token=" + $("input[name=_token]").val(),
        type: type,
        data: formData,
        headers: {
            Authorization: "Bearer " + token,
        },
        mimeType: "multipart/form-data",
        contentType: false,
        cache: false,
        processData: false,
        dataType: "json",
        beforeSend: function () {
            if (loader == true) {
                $("#loader").show();
            }
        },
        success: function (e, textStatus, xhr) {
            if (xhr.status == 200) {
                callback(e);
            } else {
                frown_alert(textStatus);
            }
        },
        error: function (request, status, error) {
            var req = JSON.parse(request.responseText);
            frown_alert(req.message);
        },
        complete: function () {
            if (loader == true) {
                $("#loader").hide();
            }
        },
    });
}

// ajax x
function ajax_x(urls, type, callback, param, loader) {
    if (loader == undefined || loader == true) {
        loader = true;
    } else {
        loader = false;
    }
    var data = {};
    data["_token"] = $("input[name=_token]").val();
    for (x in param[0]) {
        data[x] = param[0][x];
    }
    var token = localStorage.getItem("Bearer");
    $.ajax({
        url: urls,
        type: type,
        data: data,
        headers: {
            Authorization: "Bearer " + token,
        },
        dataType: "json",
        beforeSend: function () {
            if (loader == true) {
                $("#loader").show();
            }
        },
        success: function (e, textStatus, xhr) {
            if (xhr.status == 200) {
                callback(e);
            } else {
                frown_alert(textStatus);
            }
        },
        error: function (request, status, error) {
            var req = JSON.parse(request.responseText);
            frown_alert(req.message);
        },
        complete: function () {
            if (loader == true) {
                $("#loader").hide();
            }
        },
    });
}

function currency(b, e) {
    var e = window.event || e;
    var keyUnicode = e.charCode || e.keyCode;
    if (e !== undefined) {
        switch (keyUnicode) {
            case 16:
                break;
            case 27:
                this.value = "";
                break;
            case 35:
                break;
            case 36:
                break;
            case 37:
                break;
            case 38:
                break;
            case 39:
                break;
            case 40:
                break;
            case 78:
                break;
            case 110:
                break;
            case 190:
                break;
            default:
                $(b).formatCurrency({
                    colorize: true,
                    negativeFormat: "-%s%n",
                    roundToDecimalPlace: -1,
                    eventOnDecimalsEntered: true,
                });
        }
    }
}

function numberFormat(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

function hide_currency(price) {
    if (price.includes(".")) {
        price = price.replace(/\./g, "");
    }
    return Number(price.replace(/[^0-9\.-]+/g, ""));
}

function get_data(perpage, JSONData) {
    // create first param
    var paramFirts = {};
    paramFirts["perpage"] = perpage;
    for (x in JSONData["param"]) {
        paramFirts[x] = JSONData["param"][x];
    }
    ajax_x(
        JSONData["url"],
        "get",
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
                            if (e["data"].length > 0) {
                                for (x in e["data"]) {
                                    console.log("Data Pertama");
                                    html += window[JSONData["fn"]](
                                        JSON.stringify(e["data"][x])
                                    );
                                }
                            } else {
                                html += `<tr>${JSONData["warning_text"]}</tr>`;
                            }

                            $("#totalEntri").html(`Total : ${e.total} Entries`);
                        } else {
                            html += `<tr>${JSONData["warning_text"]}</tr>`;
                        }
                        $("#" + JSONData["bodyTable_id"]).html(html);
                    } else {
                        ajax_x(
                            JSONData["url"],
                            "get",
                            function (e) {
                                if (e["data"] != undefined) {
                                    if (e["data"].length > 0) {
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
                                $("#totalEntri").html(
                                    `Total : ${e.total} Entries`
                                );
                            },
                            [paramSecond]
                        );
                    }
                },
            });
        },
        [paramFirts]
    );
}

function FormAddUpdate(param) {
    var column = param.column != undefined ? param.column : "col-5";
    var data = param.feedBack != undefined ? param.feedBack.data : "";
    var content =
        param.state == "add"
            ? window["formDialog" + param.fn]("add" + param.fn, data)
            : window["formDialog" + param.fn](
                  "update" + param.fn,
                  param.feedBack.data,
                  param.feedBack.value
              );
    $.confirm({
        title: param.label,
        theme: "material",
        columnClass: column,
        content: content,
        closeIcon: false,
        buttons: {
            cancel: function () {
                return true;
            },
            formSubmit: {
                text: "Simpan",
                btnClass: "btn-blue small_btn",
                action: function () {
                    if (param.validation_state == true) {
                        // validation process
                        var valid = window["Validation" + param.fn]();
                        // filter
                        if (valid.error === false) {
                            ajax_submit(
                                "#form_utama",
                                function (e) {
                                    window[param.defaulfn]();
                                    smile_alert(e.message);
                                },
                                "post",
                                false
                            );
                        } else {
                            frown_alert(valid.message);
                            return false;
                        }
                    } else {
                        ajax_submit(
                            "#form_utama",
                            function (e) {
                                window[param.defaulfn]();
                                smile_alert(e.message);
                            },
                            "post",
                            false
                        );
                    }
                },
            },
        },
    });
}

var cursorFocus = function (elem) {
    var x = window.scrollX,
        y = window.scrollY;
    elem.focus();
    window.scrollTo(x, y);
};

function ValidateEmail(inputText) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(inputText)) {
        return true;
    }
    return false;
}

function myCalendar(JSONdata, fn) {
    var json = JSON.parse(JSONdata);
    var items = [];
    if (json != undefined) {
        realJson = json;
        for (var x in realJson) {
            items.push({
                title: realJson[x].title,
                start: new Date(
                    realJson[x].y,
                    realJson[x].m - 1,
                    realJson[x].d,
                    20
                ),
                color: realJson[x].color,
                allDay: false,
            });
        }
    }
    $("#external-events .fc-event").each(function () {
        var eventObject = {
            title: $.trim($(this).text()),
        };
        $(this).data("eventObject", eventObject);
        $(this).draggable({
            zIndex: 999,
            revert: true,
            revertDuration: 0,
        });
    });
    $("#calendar").fullCalendar({
        header: {
            left: "prev,next, today",
            center: "title",
            right: "month,basicWeek",
        },
        dayName: [
            "Minggu",
            "Senin",
            "Selasa",
            "Rabu",
            "Kamis",
            "Jum'at",
            "Sabtu",
        ],
        dayNamesShort: [
            "Minggu",
            "Senin",
            "Selasa",
            "Rabu",
            "Kamis",
            "Jum'at",
            "Sabtu",
        ],
        timezone: false,
        editable: false,
        eventLimit: true,
        events: items,
        eventClick: function (e) {
            if (fn != undefined) {
                window[fn](JSONdata);
            }
        },
    });
}
