window.onload = function () {
    //App.init 세팅에 들어감 데이터 테이블 이전(before)과 이후(after), 항상(allways)

    App.init();

    //테이블에 데이터 세팅
    $(row_data).each(function(index, el) {
        var tmp_tr = document.createElement("TR");
        tmp_tr.className = "gradeA odd";
        $(tmp_tr).attr("role", "row");

        var tmp_td = document.createElement("td");
        $(tmp_tr).append(tmp_td);

        // var col_info = el["REQUIRED_INFO"];
        var row_list = el["ROW_LIST"];
        $(row_list).each(function(index, el) {
            var tmp_td = document.createElement("td");
            $(tmp_td).attr("class", "editable");
            $(tmp_td).attr("name", el["COLUMN_NAME"]);
            $(tmp_td).attr("data-cglist_seq", el["CGLIST_SEQ"]);
            $(tmp_td).attr("data-COLUMN_SEQ", el["COLUMN_SEQ"]);
            $(tmp_td).attr("data-CHANGE_COLUMN_INFO", el["CHANGE_COLUMN_INFO"]);
            $(tmp_td).attr("data-COLUMN_INFO", el["COLUMN_INFO"]);
            $(tmp_td).attr("data-COLUMN_NAME", el["COLUMN_NAME"]);
            $(tmp_td).attr("data-DATA_INFO", el["DATA_INFO"]);
            $(tmp_td).html(el["DATA"]);
            $(tmp_tr).append(tmp_td);
        });
        $("#data-table").find("tbody").append(tmp_tr);
    });

    var handleDataTableFixedColumns = function() {
        "use strict";
        var table_height = ($(window).height()-380);
        if ($('#data-table').length !== 0) {
            $('#data-table').DataTable({
                paging:         true,
                "pagingType":   "simple_numbers",
                scrollY:        "60vh",
                scrollX:        true,
                scrollCollapse: true,
                "info":         false,
                // "bFilter": false,
                // "searching": false,
                fixedColumns:   {
                    leftColumns: fixed_index
                }
            });
        }
    };
    var TableManageFixedColumns = function () {
        "use strict";
        return {
            //main function
            init: function () {
                handleDataTableFixedColumns();
            }
        };
    }();

    TableManageFixedColumns.init();
    local_init.init();
    tableSyncModule.tableSetHeight(0);

    //사이드바 축소 및 푸터 숨김
    $("#page-container").addClass('page-sidebar-minified');
    $("#footer").hide();
    // $("#header").hide();
    // $(".page-header-fixed").css("padding", "0px");
}
var noDataInit =
{
    name : "noDataInit",

    getName: function ()
    {
        return this.name;
    },

    init: function ()
    {
        $(".nodata").on( {
            contextmenu: function (e)
            {
                e.stopPropagation();
                e.preventDefault();

                var $this = $(this);

                var items = [
                    ['행 추가하기', 'list-group-item', 'btn_nodata_add_row'],
                    ['엑셀 가져오기', 'list-group-item', 'btn_import_excel']
                ];

                var context_data = {
                    offset: e,
                    selected_cell: $this
                };

                contextMenuEvent.items = items;
                contextMenuEvent.showContextMenu(context_data);
            },
            click: function ()
            {
                $(".contextmenu").hide();
            }
        });
    }
};

//주말
var tableSyncModule = {
    name : "tableSyncModule",
    getName: function()
    {
        return this.name;
    },

    tableSetHeight: function (mode)
    {
        switch (mode) {
            case 0:
                var table_wrapper_height = "70vh";
                var table_height = "60vh";
                var table_inner_height = "59.1vh";
                var table_inner_row_height = "58.9vh";
                break;
            case 1:
                var table_wrapper_height = "80vh";
                var table_height = "70vh";
                var table_inner_height = "69.1vh";
                var table_inner_row_height = "68.9vh";
                break;
            default:
                var table_wrapper_height = "70vh";
                var table_height = "60vh";
                var table_inner_height = "59.1vh";
                var table_inner_row_height = "58.9vh";
                break;
        }

        //div row (-> table)
        $("#data-table_wrapper > .row:nth-child(2)").css("height", table_wrapper_height);
        // scroll body
        $(".dataTables_scrollBody").css("height", table_height);
        $(".dataTables_scrollBody").css("max-height", table_height);

        //scroll wrapper
        $(".DTFC_ScrollWrapper").css("height", table_wrapper_height);
        // scroll body inner
        $(".dataTables_scroll").css("height", table_wrapper_height);
        //table
        $("#data-table").css("height", table_height);

        $(".DTFC_Cloned").css("height", table_height);

        $(".DTFC_LeftBodyWrapper").css("height", table_inner_height);
        $(".DTFC_LeftBodyLiner").css("height", table_inner_row_height);

        return taskModule.exec_task_controll("setSyncTrHeight", $("#data-table").find(".editable"));
    }
}

/**
*
* @summary AJAX 전역 모듈 - ajaxModule.exec_ajax("url 마지막", "요청 데이터")
* @description ajax module call 규칙 => 첫번째 인자에 url 마지막 레벨을 전달하고 두번째 인자에 데이터를 전달한다.
* @typedef {string} function
* @typedef {object} data
* @return {bullean}
*
**/
var ajaxModule = {
    name: "ajaxModule",

    //GET 파라미터를 데이터로 획득
    getUrlParams : function(name) {
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        if (results == null){
            return null;
        }
        else{
            return results[1] || 0;
        }
    },
    result_data: {},

    data: {},

    getName: function ()
    {
        return this.name;
    },

    //셀 데이터 히스토리에 저장
    cell_history: function ()
    {
        var result_data = [];

        var data = this.data;
        var conv_data;
        $.ajax({
            type: "POST",
            dataType: "html",
            url: "/works/cglist/cell_history",
            data: this.data,
            cache: false,
            async : false,
            success: function(result){
                result_data["result_data"] = result;
                result_data["cglist_seq"] = data.cglist_seq;
                result_data["column_seq"] = data.column_seq;
            },
            error: function(e){
                console.log(e.message);
            }
        });
        return result_data;
    },

    //셀 데이터 저장
    cell_save_process: function ()
    {
        (confirm("히스토리에 저장하시겠습니까?") == true) ? this.data['history_yn'] = 'Y' : this.data['history_yn'] = 'N';
        $.ajax({
            type: "POST",
            dataType: "html",
            url: "/works/cglist/cell_save_process",
            data: this.data,
            success: function(result){
                console.log("정상적으로 수정 요청되었습니다.");
                console.log(this.data["prev_cell"]);

                // clone tr 크기 재조정(크기 동기화)
                taskModule.exec_task_controll("setSyncTrHeight", $("#data-table").find(".editable"));
            },
            error: function(e){
                console.log(e.message);
            }
        });
    },

    //회원 목록 조회
    member_list: function ()
    {
        var data_result = "";
        $.ajax({
           type:"POST",
           url: "/works/cglist/task_member_list",
           data: this.data,
           cache: false,
           async : false,
           success : function(data) {
               try {
                   data_result = jQuery.parseJSON( data );
               } catch (e) {
                   console.log('draw_re_data : exception issue.');
               }
           },
           error : function(xhr, status, error) {
               console.log(xhr);
           }
        });
        return data_result;
    },

    //회원 목록 갱신(업데이트)
    task_create_process: function ()
    {
        var data_result = "";
        $.ajax({
           type:"POST",
           url: "/works/cglist/task_create_process",
           data: this.data,
           cache: false,
           async : false,
           success : function(data) {
               try {
                   data_result = jQuery.parseJSON( data );
               } catch (e) {
                   console.log('draw_re_data : exception issue.');
               }
           },
           error : function(xhr, status, error) {
               console.log(xhr);
           }
        });
        return data_result;
    },

    //CGLIST 행 추가를 위한 CGLIST 번호 획득
    create_row_process: function ()
    {
        var data_result = "";
        $.ajax({
           type:"POST",
           url: "/works/cglist/create_row_process",
           data: this.data,
           cache: false,
           async : false,
           success : function(data) {
               try {
                   data_result = jQuery.parseJSON( data );
               } catch (e) {
                   console.log('draw_re_data : exception issue.');
               }
           },
           error : function(xhr, status, error) {
               console.log(xhr);
           }
        });
        return data_result;
    },
    //CGLIST 행 삭제 요청
    delete_row_process: function ()
    {
        $.ajax({
            type: "POST",
            dataType: "html",
            url: "/works/cglist/delete_row_process",
            data: this.data,
            success: function(result){
                console.log("정상적으로 행이 삭제되었습니다.");
            },
            error: function(e){
                console.log(e.message);
            }
        });
    },
    media_upload_process: function()
    {
        var data_result = "";
        $.ajax({
             url: '/works/cglist/media_upload_process',
             data: this.data,
             processData: false,
             contentType: false,
             dataType: "json",
             async: false,
             type: 'POST',
             success: function(data){
                  if( data.result ){
                       alert('이미지 파일이 변경되었습니다');
                       data_result = jQuery.parseJSON( data.files_dao );
                    //    data_result = data.files_dao;
                  }else{
                       alert('장애가 발생하였습니다');
                       // window.location.reload(true);
                  }
             },
             error: function(e){
                  alert('장애가 발생하였습니다');
                  // window.location.reload(true);
             }
        });
        return data_result;
    },
    excel_export: function ()
    {
        //엑셀 내보내기 폼이 이미 있다면 삭제.
        ($("body").find(".excel_export_form").length !== 0) ? $(".excel_export_form").remove() : false;

        var json_str = JSON.stringify(this.data);

        //폼 생성
        var $form = $(document.createElement('form'))
                    .css({display:'none'})
                    .attr("method","POST")
                    .attr("class","excel_export_form")
                    .attr("action","/works/cglist/excel_export?project_seq="+this.data["project_seq"]);

        var $input = $(document.createElement('input'))
                     .attr('name','json_cglist_seq_list')
                     .val(json_str);

        $form.append($input);

        $("body").append($form);

        return $form.submit();
    },

    cglist_activity_list: function ()
    {
        var data_result = "";
        $.ajax({
           type:"POST",
           url: "/works/cglist/cglist_activity_list",
           data: this.data,
           cache: false,
           async : false,
           success : function(data)
           {
               try
               {
                   data_result = jQuery.parseJSON( data );
               }
               catch (e)
               {
                   console.log('ERROR : AJAX - cglist_activity_list.');
               }
           },
           error : function(xhr, status, error) {
               console.log(xhr);
           }
        });
        return data_result;
    },
    cglist_activity_insert: function ()
    {
        var data_result = "";
        $.ajax({
           type:"POST",
           url: "/works/cglist/cglist_activity_insert",
           data: this.data,
           cache: false,
           async : false,
           success : function(data)
           {
               try
               {
                   data_result = jQuery.parseJSON( data );
               }
               catch (e)
               {
                   console.log('ERROR : AJAX - cglist_activity_list.');
               }
           },
           error : function(xhr, status, error) {
               console.log(xhr);
           }
        });
        return data_result;
    },
    exec_ajax: function (func, data = {})
    {
        data["project_seq"] = this.getUrlParams("project_seq")
        this.data = data;
        //해당 프라퍼티가 있는 지 확인 : hasOwnProperty && 해당 프라퍼티가 함수인지 확인 typeof this[func]
        if (this.hasOwnProperty(func) && typeof this[func] === "function") {
            //인수로 받은 함수명을 리턴 호출
            return this[func](data);
        } else {
            console.log('not defined : check of function defined');
        }
    }
};

/**
*
* @summary 히스토리 로컬 모듈 - ajaxModule.exec_history(실행할 함수, 엘리먼트)
* @description history module call 규칙 => 첫번째 인자에 실행할 함수명을 전달하고 두번째 인자에 해당 엘리먼트(셀)을 인수로 준다.
* @typedef {string} function
* @typedef {object} element
* @return {bullean}
*
**/
var historyModule =
{
    name: "historyModule",
    data: {},
    el: '',

    getName: function ()
    {
        return this.name;
    },

    //히스토리 레이어에 필요한 이벤트 세팅
    setHistoryEvent: function(params = {})
    {
        var el = params.selected_cell;
        var div = params.to_set_div;

        if (div.find('a').length > 0)
        {
            el_child = div.find('#btn_history');
        }
        else
        {
            el_child = $(el).find('button');
        }
        //history layer open and setting data
        if ($(".history_layer").css("display") == "none")
        {
            //히스토리 레이어 위치 조정
            var nav_bar_height = 54;
            var b_width = $(document).width();
            var b_height = $(document).height();

            var p_width = 900;
            var p_height = 760;

            var sc_top = $( "body" ).scrollTop();

            var pop_top = ((sc_top+(b_height/2)-(p_height/2))-nav_bar_height)+"px";
            var pop_left = ((b_width/2)-(p_width/2))+"px";

            $(".history_layer").css("width", p_width);
            $(".history_layer").css("height", p_height);
            $(".history_layer").css("top", 100);
            $(".history_layer").css("left", pop_left);
        }

        //히스토리 레이어의 헤드(타이틀)값 지정
        var tr = el.parents("tr");
        var title = $(tr).find('[data-title="SCENE"]').html();

        var send_data = {
            cglist_seq: $(el).data("cglist_seq"),
            column_seq: $(el).data("column_seq"),
            title: title
        };

        //히스토리 리스트 가져오기
        var data = ajaxModule.exec_ajax("cell_history", send_data);
        this.setHistoryData(data);
        return $(".contextmenu").hide();
    },

    setHistoryData : function (data = [])
    {
        if (data == null) return false;
        $("#add_history_area").html("");

        var conv_data = jQuery.parseJSON(data["result_data"]);

        if (conv_data.length === 0)
        {
            $(".history_layer").hide();
            alert("데이터가 없습니다.");
            return false;
        }
        var append;
        $(conv_data).each(function(index, el) {
            append = append + '<tr data-cglist_seq="'+data["cglist_seq"]+'" data-column_seq="'+data["column_seq"]+'" data-member_info=\''+el["MEMBER_INFO"]+'\'>';
            append = append + '<td><span class="history_title">'+el["CELL_DATA"]+'</span></td>';
            append = append + '<td><span class="history_member">'+el["MEMBER_NAME"]+'</span></td>';
            append = append + '<td><span class="history_time">'+el["CELL_SAVE_DATE"]+'</span></td>';
            // append = append + '<td>'+button+'</td></tr>';
            append = append + '<td><button class="btn btn-info" onclick="insertDataFromHistory(this)">적용하기</button></td></tr>';
        });

        //히스토리 타이틀에 추가적으로 들어가야 될 것 체크.
        $("#history_name").html(data.title);
        $("#add_history_area").html(append);
        $(".history_layer").fadeIn();

        // return this.setHistoryEvent();
},

    exec_history: function (func = '', el = '')
    {
        this.el = el;

        if (this.hasOwnProperty(func) && typeof this[func] === "function") {
            return this[func](el);
        } else {
            console.log('not defined : check of function defined');
        }
    }
};

/**
*
* @summary 히스토리 데이터 세팅 전역 함수
* @description 데이터를 가져와(ajax) 히스토리 레이어에 삽입 및 리스팅
* @typedef {object} element
* @return {void}
*
**/
var insertDataFromHistory = function (el)
{
    var result = confirm('해당 히스토리를 적용하시겠습니까?');
    if (!result) return false;

    var seq_data = $(el).parent().parent().data();
    var changed_text = $(el).parent().parent().find(".history_title").html();
    var find_id = '[data-column_seq="'+seq_data.column_seq+'"][data-cglist_seq="'+seq_data.cglist_seq+'"]';

    $(find_id).html(changed_text);

    var send_data = {
            cglist_seq: seq_data.cglist_seq,
            column_seq: seq_data.column_seq,
            cell_data: changed_text
    };

    ajaxModule.exec_ajax("cell_save_process", send_data);
    $(".history_layer").hide();
};

/**
* @summary 레이어 닫기 기능 전역 함수
* @return {void}
**/
var closeThisLayer = function (el)
{
    var class_name = "."+el;
    return $(class_name).hide();
};

/**
* @summary 디테일 뷰 레이어 제어 모듈
* @description 컨텍스트 상세보기를 클릭 시 발생하는 이벤트 및 div 설정 등 상세보기에 포괄적인 모듈
* @return {void}
**/
var detailView = {

    name: "detailView",

    set_data: [],

    tr_data_array: [],

    getName: function ()
    {
        return this.name;
    },

    setThisData: function ()
    {
        var this_layer = $("."+this.name);

        // set cglist_seq in div
        // $(this_layer).attr("data-cglist_seq", this.data.attr("data-column_seq"));

        //클론 테이블의 셀일 경우 오리지날 테이블의 tr 반환
        if (this.data.parents("table").hasClass('DTFC_Cloned'))
        {
            var cglist_seq = this.data.attr("data-cglist_seq");
            var column_seq = this.data.attr("data-column_seq");
            var this_parent_tr = $('.gradeA').find('.editable[data-cglist_seq="'+cglist_seq+'"]').first().parents("tr");
        }
        else
        {
            var this_parent_tr = this.data.parents("tr");
        }

        var equel_level_td = $(this_parent_tr).find("td");
        var tr_data_array = [];
        var set_data_obj = [];

        //first td(checkbox) remove
        equel_level_td.splice(0, 1);
        equel_level_td.each(function(index, el) {
            var $el = $(el);
            var de_column_info = jQuery.parseJSON($el.attr("data-column_info"));

            if (typeof de_column_info["DETAIL_POSITION"] == "undefined") return true;

            var td_name = $el.attr("data-name");
            var th_name = $("th[data-ori_name="+td_name+"]");

            var value = $el.html();//왼쪽 공백제거
            value = value.replace(/\s+/, "");//오른쪽 공백제거
            value = value.replace(/\s+$/g, "");//오른쪽 공백제거
            value = value.replace(/\n/g, "");//행바꿈제거
            value = value.replace(/\r/g, "");//엔터제거

            if (jQuery.inArray(0, de_column_info["DETAIL_POSITION"]))
            {
                set_data_obj.push({title: td_name, column_data: value, name: th_name.attr("data-name")});
            }
            else if (jQuery.inArray(1, de_column_info["DETAIL_POSITION"]))
            {
                switch (td_name) {
                    // case "CUT_IMG":
                    //     set_data_obj.push({title: td_name, column_data: value, name: th_name.attr("data-name")});
                    //     break;
                    // case "SCENE":
                    //     set_data_obj.push({title: td_name, column_data: value, name: th_name.attr("data-name")});
                    //     tr_data_array.push({title: td_name, column_data: value, name: th_name.attr("data-name")});
                    //     break;
                    // case "CUT":
                    //     set_data_obj.push({title: td_name, column_data: value, name: th_name.attr("data-name")});
                    //     tr_data_array.push({title: td_name, column_data: value, name: th_name.attr("data-name")});
                    //     break;
                    default:
                        tr_data_array.push({title: td_name, column_data: value, name: th_name.attr("data-name")});
                }
            }
            else if (jQuery.inArray(2, de_column_info["DETAIL_POSITION"]))
            {
                // tr_data_array.push({title: td_name, column_data: value, name: th_name.attr("data-name")});
            }
        });

        // this array init
        this.set_data = [];
        this.tr_data_array = [];

        //setting this of (Array) set_data
        this.set_data = set_data_obj;
        this.tr_data_array = tr_data_array;
    },

    setLayerData: function ()
    {
        var this_layer = $("."+this.name);
        var body_html = ""; //inner html in .body-contents

        //data init
        this.setThisData();

        set_data_obj = this.set_data;
        tr_data_array = this.tr_data_array;

        this_layer.find(".panel-heading").html(set_data_obj[0]["column_data"]+" / "+set_data_obj[1]["column_data"]);

        //make inner html
        body_html += "<div class='row'>";
        body_html += "  <div class='col-sm-4'>";
        body_html += set_data_obj[2]["column_data"]+"<br />";
        body_html += '      <div class="btn-group btn-group-justified">';
        body_html += '           <a href="#" class="btn btn-primary">Plate</a>';
        body_html += '           <a href="#" class="btn btn-info">Src</a>';
        body_html += '           <a href="#" class="btn btn-danger">Ref</a>';
        body_html += '      </div>';
        body_html += "  </div>";
        body_html += "  <div class='col-sm-8'>";
        body_html += "      <div class='detail_list'>";

        //make box contents
        $(tr_data_array).each(function(index, el) {
            var tem = $("[ori_name="+el["title"]+"]");
            (el["column_data"] == "") ? el["column_data"] = "-" : false;

            body_html += "<div class='detail_box'>";
            body_html += "  <div class='detail_box_title' data-title='"+el["title"]+"'>"+el["name"]+"</div>";
            body_html += "  <div class='detail_box_body'>"+el["column_data"]+"</div>";
            body_html += "</div>";
        });

        body_html += "      </div>";
        body_html += "  </div>";
        body_html += "</div>";

        var inner = $(body_html).html();

        this_layer.find(".body-contents").html(inner);

        return this.setTabData();
    },

    setTabActivity: function ()
    {
        var send_data = {"cglist_seq" : this.data.data("cglist_seq")};
        var tab_html = "";

        var activity_data = ajaxModule.exec_ajax("cglist_activity_list", send_data);

        if (activity_data.length != 0)
        {
            var this_member_seq = activity_data["THIS_MEMBER_SEQ"];
            delete activity_data["THIS_MEMBER_SEQ"];

            var index = 0;
            var length = Object.keys(activity_data).length;

            tab_html += '<div class="slimScrollDiv">';
            tab_html += '   <div class="chats">';

             //메세지 이력
            while (index < length) {
                var img_url = '';
                //img 관련 정보가 있는지 없는지
                if (typeof(activity_data[index]["PROFILE_IMG_INFO"] == "string") && activity_data[index]["PROFILE_IMG_INFO"] != "")
                {
                    var profile_img_info = jQuery.parseJSON( activity_data[index]["PROFILE_IMG_INFO"] );
                    var img_url = '/data/'+profile_img_info["FILE_PATH"] + profile_img_info["FILE_NAME"];
                }
                //현재 접속한 멤버와 msg를 작성한 멤버 비교 후 li 위치 지정
                var li_class_name = "";
                (activity_data[index]["MEMBER_SEQ"] == this_member_seq)
                ?
                    li_class_name = "right"
                :
                    li_class_name = "left";

                tab_html +=    '<li class="'+li_class_name+'">';
                tab_html +=        '<span class="date-time">'+activity_data[index]["ADD_DATE"]+'</span>';
                tab_html +=        '<a href="javascript:;" class="name">'+activity_data[index]["MEMBER_NAME"]+'</a>';
                tab_html +=        '<a href="javascript:;" class="image"><img alt="" src="'+img_url+'" onerror="this.src=\'/assets/img/profile_blank.png\';"></a>';
                tab_html +=        '<div class="message">'+activity_data[index]["CONTENTS"];
                tab_html +=        '</div>';
                tab_html +=    '</li>';
                index++;
            }

            tab_html += '          </div>';
            tab_html += '      </div>';

            //메세지 보내기
            tab_html += '<form name="send_message_form" data-id="message-form">';
            tab_html += '   <div class="input-group">';
            tab_html += '       <input type="text" class="form-control input-sm" name="message" placeholder="Enter your message here.">';
            tab_html += '       <span class="input-group-btn">';
            tab_html += '           <button id="send_msg_btn" class="btn btn-primary btn-sm" type="button">&nbsp;Send&nbsp;</button>';
            tab_html += '       </span>';
            tab_html += '   </div>';
            tab_html += '</form>';
        }
        else
        {
            // tab_html += '<div class="alert alert-danger" role="alert"> <strong>Oh snap!</strong> Change a few things up and try submitting again. </div>';
            tab_html += '<span class="label label-warning">시스템 메세지가 없습니다.</span>';
        }
        $("#activity > div > div.activity.col-sm-6").html(tab_html);
        return this.setTabEventListener();
    },

    setTabCutInfo: function ()
    {
        // this.set_data [ 0 => SCENE, 1 => CUT, 2 => CUT_IMG, 3 => DESCRIPTION, 4 => GUIDE_IMG, 5 => FEEDBACK]
        if (this.set_data[4]["column_data"] == "")
            this.set_data[4]["column_data"] = this.set_data[2]["column_data"];

        tab_html += '       </span>';
        var tab_html = "";
        tab_html += '<div class="cut_info">';
        tab_html += '<table class="table table-striped">';
        tab_html +=     '<tbody>';
        tab_html +=         '<tr>';
        tab_html +=             '<td>CUT</td>';
        tab_html +=             '<td>'+this.set_data[1]["column_data"]+'</td>';
        tab_html +=         '</tr>';
        tab_html +=         '<tr>';
        tab_html +=             '<td>Guide img</td>';
        tab_html +=             '<td>'+this.set_data[4]["column_data"]+'</td>';
        tab_html +=         '</tr>';
        tab_html +=         '<tr>';
        tab_html +=             '<td>Description</td>';
        tab_html +=             '<td>'+this.set_data[3]["column_data"]+'</td>';
        tab_html +=         '</tr>';
        tab_html +=         '<tr>';
        tab_html +=             '<td>Create by</td>';
        tab_html +=             '<td>옥소담</td>';
        tab_html +=         '</tr>';
        tab_html +=         '<tr>';
        tab_html +=             '<td>Update by</td>';
        tab_html +=             '<td>김지혜</td>';
        tab_html +=         '</tr>';
        tab_html +=         '<tr>';
        tab_html +=             '<td>Date Updated</td>';
        tab_html +=             '<td>2017/05/09 02:00 pm</td>';
        tab_html +=         '</tr>';
        tab_html +=     '</tbody>';
        tab_html += '</table>';
        tab_html += '</div>';

        $("#activity > div > div.cut_info.col-sm-6").html(tab_html);
        return this.setTabEventListener();
    },

    setTabTask: function ()
    {
        // $("#tab_task").html("setTabTask");
    },
    setTabFeedback: function ()
    {
        var tab_html = "";
        // working list
        tab_html += '<div class="row">';
        tab_html += '   <div class="col-sm-6">';
        tab_html += '       <ul class="nav nav-tabs nav-tabs-inverse nav-justified nav-justified-mobile" data-sortable-id="index-2" data-init="true">';
        tab_html += '           <li class="active" data-link="tab_mask"><a href="" data-toggle="tab" aria-expanded="false"><span class="hidden-xs">MASK&nbsp;</span></a></li>';
        tab_html += '           <li class="" data-link="tab_removal"><a href="" data-toggle="tab" aria-expanded="false"><span class="hidden-xs">REMOVAL&nbsp;</span></a></li>';
        tab_html += '           <li class="" data-link="tab_2d"><a href="" data-toggle="tab" aria-expanded="false"><span class="hidden-xs">2D&nbsp;</span></a></li>';
        tab_html += '           <li class="" data-link="tab_matte"><a href="" data-toggle="tab" aria-expanded="false"><span class="hidden-xs">MATTE&nbsp;</span></a></li>';
        tab_html += '           <li class="" data-link="tab_motion"><a href="" data-toggle="tab" aria-expanded="false"><span class="hidden-xs">MOTION&nbsp;</span></a></li>';
        tab_html += '           <li class="" data-link="tab_3d"><a href="" data-toggle="tab" aria-expanded="false"><span class="hidden-xs">3D&nbsp;</span></a></li>';
        tab_html += '           <li class="" data-link="tab_fx"><a href="" data-toggle="tab" aria-expanded="false"><span class="hidden-xs">FX&nbsp;</span></a></li>';
        tab_html += '       </ul>';

        tab_html += '   <div id="feedback">';
        //데이터가 없을때 처리 및 셀렉트 박스 변경 시 AJAX 이벤트 등
        //one contents
        tab_html += '<div class="media">';
		tab_html += '     <a class="media-left" href="javascript:;">';
		tab_html += '         <img src="http://cocoavision.iptime.org/color_admin_v2.0/admin/template_content_html/assets/img/gallery/gallery-2.jpg" alt="" class="media-object">';
		tab_html += '     </a>';
		tab_html += '   <div class="media-body">';
		tab_html += '      <h4 class="media-heading"><span id="feed_scene">EB_0010_01&nbsp;</span><span id="feed_name">홍길동&nbsp;</span><span id="feed_date">2017.05.09 ~ 2017.05.25&nbsp;</span></h4>';
        tab_html += '          <form class="form-inline">';
        tab_html += '             <label class="mr-sm-2" for="inlineFormCustomSelect">Mapping Match : </label>';
        tab_html += '               <select class="custom-select mb-2 mr-sm-2 mb-sm-0" id="inlineFormCustomSelect">';
        tab_html += '                  <option selected>Choose...</option>';
        tab_html += '                  <option value="1">Wip</option>';
        tab_html += '                  <option value="2">Rdy</option>';
        tab_html += '                  <option value="3">Fin</option>';
        tab_html += '                </select>';
        tab_html += '             <span class="label label-danger f-s-10">상</span>';
        tab_html += '          </form>';
        tab_html += '          <div class="progress" style="max-width: 250px;">';
        tab_html += '             <div class="progress-bar" style="width: 80%">80%</div>';
        tab_html += '          </div>';
		tab_html += '   </div>';
        tab_html += '</div>';
        //one contents end
        //one contents
        tab_html += '<div class="media">';
        tab_html += '     <a class="media-left" href="javascript:;">';
        tab_html += '         <img src="http://cocoavision.iptime.org/color_admin_v2.0/admin/template_content_html/assets/img/gallery/gallery-2.jpg" alt="" class="media-object">';
        tab_html += '     </a>';
        tab_html += '   <div class="media-body">';
        tab_html += '      <h4 class="media-heading"><span id="feed_scene">EB_0010_01&nbsp;</span><span id="feed_name">홍길동&nbsp;</span><span id="feed_date">2017.05.09 ~ 2017.05.25&nbsp;</span></h4>';
        tab_html += '          <form class="form-inline">';
        tab_html += '             <label class="mr-sm-2" for="inlineFormCustomSelect">Mapping Match : </label>';
        tab_html += '               <select class="custom-select mb-2 mr-sm-2 mb-sm-0" id="inlineFormCustomSelect">';
        tab_html += '                  <option selected>Choose...</option>';
        tab_html += '                  <option value="1">Wip</option>';
        tab_html += '                  <option value="2">Rdy</option>';
        tab_html += '                  <option value="3">Fin</option>';
        tab_html += '                </select>';
        tab_html += '             <span class="label label-danger f-s-10">상</span>';
        tab_html += '          </form>';
        tab_html += '          <div class="progress" style="max-width: 250px;">';
        tab_html += '             <div class="progress-bar" style="width: 80%">80%</div>';
        tab_html += '          </div>';
        tab_html += '   </div>';
        tab_html += '</div>';
        //one contents end

        tab_html += '   </div>'; //<div id="feedback">
        tab_html += '</div>';   //<div class="col-sm-6">


        // feedback area
        tab_html += '   <div class="col-sm-6">';

        tab_html += '<div class="slimScrollDiv">';
        tab_html += '   <ul class="chats">';
        //one contents start
        tab_html += '      <li class="left">';
        tab_html += '          <span class="date-time">2017.05.09 02:03 PM</span>';
        tab_html += '          <a href="javascript:;" class="name">홍길동</a>';
        tab_html += '          <a href="javascript:;" class="image"><img alt="" src="http://cocoavision.iptime.org/color_admin_v2.0/admin/template_content_html/assets/img/user-12.jpg"></a>';
        tab_html += '          <div class="message">';
        tab_html += '              업무 상태가 변경되었습니다.';
        tab_html += '          </div>';
        tab_html += '      </li>';
        //one contents end

        tab_html += '   </ul>';
        tab_html += '</div>'; //<div class="slimScrollDiv">

        //send_message_form
        tab_html += '<form name="send_message_form" data-id="message-form">';
        tab_html += '   <div class="input-group">';
        tab_html += '       <input type="text" class="form-control input-sm" name="message" placeholder="Enter your message here.">';
        tab_html += '       <span class="input-group-btn">';
        tab_html += '           <button id="send_msg_btn" class="btn btn-primary btn-sm" type="button">&nbsp;Send&nbsp;</button>';
        tab_html += '       </span>';
        tab_html += '   </div>';
        tab_html += '</form>';

        tab_html += '   </div>'; //<div id="col-sm-6">
        tab_html += '</div>';   //<div class="row">

        $("#tab_feedback").html(tab_html);
        return this.setTabEventListener();
    },

    setTabData: function ()
    {
        var this_layer = $("."+this.name);
        this_layer.find(".body-tabs").html("");

        //set tab menu bar
        var tab_html = "";
        tab_html += '<ul class="nav nav-tabs nav-tabs-inverse nav-justified nav-justified-mobile" data-sortable-id="index-2" data-init="true">';
        tab_html += '   <li class="tab_btn active" data-func="setTabActivity" data-link="activity"><a href="#activity" data-toggle="tab" aria-expanded="false"><i class="fa fa-picture-o m-r-5"></i><span class="hidden-xs">Activity&nbsp;</span></a></li>';
        // tab_html += '<li class=""><a href="#cut_info" data-toggle="tab" aria-expanded="false"><i class="fa fa-shopping-cart m-r-5"></i> <span class="hidden-xs">CUT INFO</span></a></li>';
        tab_html += '   <li class="tab_btn" data-func="setTabTask" data-link="tab_task"><a href="#tab_task" data-toggle="tab" aria-expanded="false"><i class="fa fa-shopping-cart m-r-5"></i><span class="hidden-xs">TASK&nbsp;</span></a></li>';
        tab_html += '   <li class="tab_btn" data-func="setTabFeedback" data-link="tab_feedback"><a href="#tab_feedback" data-toggle="tab" aria-expanded="false"><i class="fa fa-envelope m-r-5"></i><span class="hidden-xs">FeedBack&nbsp;</span></a></li>';
        tab_html += '</ul>';
        tab_html += '<div class="tab-content">';
        tab_html += '   <div class="tab-pane fade active in" id="activity">';
        tab_html += '      <div class="row">';
        tab_html += '             <div class="cut_info col-sm-6"></div>';
        tab_html += '             <div class="activity col-sm-6"></div>';
        tab_html += '      </div>';
        tab_html += '  </div>';
        tab_html += '  <div class="tab-pane fade in" id="tab_task">'
        tab_html += '      <div class="row">';
        tab_html += '           <span class="label label-warning">Loading..</span>';
        tab_html += '       </div>';
        tab_html += '  </div>';
        tab_html += '  <div class="tab-pane fade in" id="tab_feedback">'
        tab_html += '      <div class="row">';
        tab_html += '           <span class="label label-warning">Loading..</span>';
        tab_html += '       </div>';
        tab_html += '  </div>';
        tab_html += '</div>';

        //set tab contents
        this_layer.find(".body-tabs").html(tab_html);

        this.setTabCutInfo();
        this.setTabActivity();

        $(".contextmenu").hide();

        //set event
        return this.setTabEventListener();
    },
    setTabEventListener: function ()
    {
        $this = this;   //this init

        //탭 기능 재 정의 및 로더(waiting) 객체 생성 및 제어
        $(".tab_btn").off("click").on("click", function (event) {
            // event.stopPropagation();
            event.preventDefault();

            $_this = $(this);

            var this_ul = $_this.parents("ul");
            var target_id = $_this.attr("data-link");

            //class init
            this_ul.find("li").removeClass("active");
            $_this.addClass('active');

            $("#"+target_id).parents(".tab-content").find(".tab-pane").hide();
            $("#"+target_id).css("display", "flex");

            if ($_this.find(".glyphicon").length === 0)
            {
                //로더(로딩중 이미지) 생성
                var loader = document.createElement("SPAN");
                loader.className = "glyphicon glyphicon-refresh glyphicon-refresh-animate";

                //특정 DIV 뒤에 위치하도록 설정
                $_this.find(".hidden-xs").after(loader);

                var func = $_this.attr("data-func");
                if ($this.hasOwnProperty(func) && typeof $this[func] === "function") {
                    //로더 제거 및 함수 실행
                    setTimeout(function(){
                        $this[func]();
                        $(loader).remove();
                    }, 1000);
                } else {
                    alert("호출 에러입니다. 개발팀에 문의해주세요.")
                }
            }
        });
        $("#send_msg_btn").off("click").on("click", function () {
            var $_this = $(this);
            //send message and draw
            var input_msg = $(this).parents(".input-group").find("input").val();

            if (input_msg == '')
            {
                alert("메세지가 입력 되지 않았습니다.");
            }
            else
            {
                var tab_html = "";
                // 로더(로딩중 이미지) 생성
                var loader = document.createElement("SPAN");
                loader.className = "glyphicon glyphicon-refresh glyphicon-refresh-animate";
                $(this).append(loader);

                var send_data = {
                    cglist_seq: $this.data.data("cglist_seq"),
                    contents: input_msg
                };
                setTimeout(function(){
                    var result = ajaxModule.exec_ajax("cglist_activity_insert", send_data);

                    var img_url = '';
                    //img 관련 정보가 있는지 없는지
                    if (typeof(result["PROFILE_IMG_INFO"] == "string") && result["PROFILE_IMG_INFO"] != "")
                    {
                        var profile_img_info = jQuery.parseJSON( result["PROFILE_IMG_INFO"] );
                        var img_url = '/data/'+profile_img_info["FILE_PATH"] + profile_img_info["FILE_NAME"];
                    }
                    //현재 접속한 멤버와 msg를 작성한 멤버 비교 후 li 위치 지정
                    var li_class_name = "";
                    (result["MEMBER_SEQ"] == member_seq)
                    ?
                        li_class_name = "right"
                    :
                        li_class_name = "left";

                    tab_html +=    '<li class="'+li_class_name+'">';
                    tab_html +=        '<span class="date-time">'+result["ADD_DATE"]+'</span>';
                    tab_html +=        '<a href="javascript:;" class="name">'+result["MEMBER_NAME"]+'</a>';
                    tab_html +=        '<a href="javascript:;" class="image"><img alt="" src="'+img_url+'" onerror="this.src=\'/assets/img/profile_blank.png\';"></a>';
                    tab_html +=        '<div class="message">'+result["CONTENTS"];
                    tab_html +=        '</div>';
                    tab_html +=    '</li>';

                    loader.remove();

                    $_this.parents(".activity").find(".chats").append(tab_html);

                    var chats_height = $_this.parents(".activity").find(".chats").height();
                    $_this.parents(".activity").find(".slimScrollDiv").scrollTop(chats_height);
                }, 1000);
            }
        });
    },

    setLayerPosition: function ()
    {
        var this_class = $("."+this.name);
        if (this_class.css("display") != "block")
        {
            // var nav_bar_height = 54;
            //             // var b_width = $(document).width();
            //             // var b_height = $(document).height();
            //             //
            //             // var p_width = 600;
            //             // var p_height = 620;
            //             //
            //             // var sc_top = $( "body" ).scrollTop();
            //             //
            //             // var pop_top = ((sc_top+(b_height/2)-(p_height/2))-nav_bar_height)+"px";
            //             // var pop_left = ((b_width/2)-(p_width/2))+"px";
            //             //
            //             // this_class.css("width", p_width);
            //             // this_class.css("height", p_height);
            //             // this_class.css("top", 100);
            //             // this_class.css("left", pop_left);
            this_class.show();
        }
        return (this_class.css("display") == "block");
    },
    setLayerDiv: function ()
    {
        this.class = $("."+this.name);

        if (this.class.length === 0)
        {
            //div detail
            var detail_div = document.createElement('div');
            detail_div.className = this.name;

            //div pannel
            var pannel_div = document.createElement('div');
            pannel_div.className = "panel panel-inverse";
            pannel_div.setAttribute("data-sortable-id", 'ui-typography-11');
            // $(pannel_div).attr("data-sortable-id", "");

            //div pannel head
            var pannel_head_div = document.createElement('div');
            pannel_head_div.className = "panel-heading";

            var pannel_head_title = document.createElement('div');
            pannel_head_title.className = "panel-title";

            var pannel_head_btn = document.createElement('div');
            pannel_head_btn.className = "panel-heading-btn";

            var pannel_head_btn_anchor_1 = document.createElement('a');
            pannel_head_btn_anchor_1.className = "btn btn-xs btn-icon btn-circle btn-default";
            pannel_head_btn_anchor_1.setAttribute("data-click", 'panel-expand');
            pannel_head_btn_anchor_1.innerHTML = '<i class="fa fa-expand"></i>';

            var pannel_head_btn_anchor_2 = document.createElement('a');
            pannel_head_btn_anchor_2.className = "btn btn-xs btn-icon btn-circle btn-danger";
            pannel_head_btn_anchor_2.setAttribute("onclick", 'closeThisLayer("'+this.name+'");');
            pannel_head_btn_anchor_2.innerHTML = '<i class="fa fa-times"></i>';

            pannel_head_btn.appendChild(pannel_head_btn_anchor_1);
            pannel_head_btn.appendChild(pannel_head_btn_anchor_2);

            pannel_head_div.appendChild(pannel_head_title);
            pannel_head_div.appendChild(pannel_head_btn);

            //div pannel body
            var pannel_body_div = document.createElement('div');
            pannel_body_div.className = "panel-body";
            var pannel_body_contents = document.createElement('div');
            pannel_body_contents.className = "body-contents";
            var pannel_body_tabs = document.createElement('div');
            pannel_body_tabs.className = "body-tabs";

            pannel_body_div.appendChild(pannel_body_contents);
            pannel_body_div.appendChild(pannel_body_tabs);

            //div append
            $(pannel_div).append(pannel_head_div).append(pannel_body_div);
            $(detail_div).append(pannel_div);
            document.body.appendChild(detail_div);
        }
        return this.setLayerPosition();
    },

    execDetailModule: function (func, data = {})
    {
        this.data = data;
        if (this.hasOwnProperty(func) && typeof this[func] === "function") {
            return this[func](data);
        } else {
            console.log('not defined -'+this.name+' : check of function defined');
        }
    }
}

/**
* @summary 컨텍스트 메뉴 이벤트 제어 모듈(오른쪽 클릭 메뉴)
* @description 모듈내의 items 변수에 메뉴리스트를 선처리로 넣어주고, showContextMenu() 함수 호출 시 메뉴리스트와 버튼 이벤트를 정의
* @return {void}
**/
var contextMenuEvent = {

    items: null,

    setContentsMenu: function ()
    {
        var list_group = document.createElement('div');
        $(list_group).attr('class', 'list-group');

        $(this.items).each(function(index, el) {
            var item = document.createElement('a');
            $(item).html(el[0]);
            $(item).attr('class', el[1]);
            $(item).attr('id', el[2]);
            $(list_group).append(item);
        });

        $(".contextmenu").html(list_group);
    },

    showContextMenu: function(context_data)
    {
        if ($(".contextmenu").length == 0)
        {
            var contextMenu_layer = document.createElement("div");
            contextMenu_layer.className = "contextmenu";
            $("body").append(contextMenu_layer);
        }
        this.setContentsMenu(context_data.selected_cell);
        this.setButtonEvent(context_data.selected_cell);

        $(".contextmenu").css("left", context_data.offset.pageX);
        $(".contextmenu").css("top", context_data.offset.pageY);
        $(".contextmenu").show();
    },

    setButtonEvent: function (selected_cell = null)
    {
        //이벤트 타겟 엘리먼트가 td인지 확인 하는 조건문
        if (selected_cell.hasClass("editable"))
        {
            $("#btn_detail").off("click").on("click", function (e) {
                (detailView.execDetailModule("setLayerDiv")) ?
                    detailView.execDetailModule("setLayerData", selected_cell)
                    : false;
                $(".contextmenu").hide();
            });

            //contextmenu common event {
            $("#btn_history").off("click").on("click", function (e) {
                var params = {
                    selected_cell: selected_cell,
                    to_set_div: $("#btn_history").parent()
                };
                historyModule.exec_history("setHistoryEvent", params);
                $(".contextmenu").hide();
            });

            $("#btn_add_up_row").off("click").on("click", function (e) {
                var params = {
                    mathod: "prev",
                    selected_cell: selected_cell
                };
                tableControlModule.exec_table_controll("add_row", params);
                $(".contextmenu").hide();
            });

            $("#btn_add_down_row").off("click").on("click", function (e) {
                var params = {
                    mathod: "next",
                    selected_cell: selected_cell
                };
                tableControlModule.exec_table_controll("add_row", params);
                $(".contextmenu").hide();
            });

            $("#btn_remove_row").off("click").on("click", function (e) {
                var params = {
                    mathod: "remove",
                    selected_cell: selected_cell
                };
                tableControlModule.exec_table_controll("remove_row", params);
                $(".contextmenu").hide();
            });

            $("#btn_task_update").off("click").on("click", function (e) {
                taskModule.exec_task_controll("init", selected_cell);
                $(".contextmenu").hide();
            });
            //} contextmenu common event end

            $("#btn_file_upload").off("click").on("click", function (e) {
                //file input form 생성
                var file_input = "";
                file_input = file_input + '<input type="file" id="upload" name="upload"';
                file_input = file_input + 'file_input + style="visibility: hidden; width: 1px; height: 1px" multiple />';

                $(".upload_form_control").html(file_input);
                $('#upload').trigger('click');
                $('#upload').off('change').on('change', function() {
                    var imageObject = this.files[0];

                    if( confirm('해당 이미지 파일을 변경하시겠습니까?')){
                         var formData = new FormData();
                         formData.append('media_file', imageObject);
                         formData.append('cglist_seq', selected_cell.attr("data-cglist_seq"));
                         formData.append('column_seq', selected_cell.attr("data-column_seq"));
                         formData.append('project_seq', ajaxModule.getUrlParams("project_seq"));
                         formData.append('history_yn', "Y");

                         var result_data = ajaxModule.exec_ajax("media_upload_process", formData);
                         var file_info = jQuery.parseJSON( result_data.FILE_INFO );

                         //현재 셀의 내용을 대체할 문자열(html)에 ajax로 받아온 값을 대입 후 innerHtml 함수로 대체
                         var inner_html = "";
                         inner_html = inner_html + '<a class="show_media_contents" onclick="showMediaVeiw(this)">';
                         inner_html = inner_html + '<img src="/data/'+file_info["FILE_PATH"]+file_info["FILE_NAME"]+'" data-seq="'+file_info["SEQ"]+'" ';
                         inner_html = inner_html + 'data-file_name="'+file_info["FILE_NAME"]+'" data-file_path="/data/'+file_info["FILE_PATH"]+'"';
                         inner_html = inner_html + 'data-file_width="'+file_info["FILE_WIDTH"]+'" data-file_height="'+file_info["HEIGHT"]+'" data-member_seq="'+file_info["MEMBER_SEQ"]+'" ';
                         inner_html = inner_html + 'data-file_mimetype="'+file_info["FILE_MIMETYPE"]+'" data-upload_file_name="'+file_info["UPLOAD_FILE_NAME"]+'" ';
                         inner_html = inner_html + 'style="width:100px;"></a>';
                         selected_cell.html(inner_html);
                    }
                });
                $(".contextmenu").hide();
            });
        }
        //td 외의 이벤트 정의부
        else
        {
            //keep
            $("#btn_nodata_add_row").off("click").on("click", function (e) {
                var td_length = (Number($(".nodata").attr("data-col_length")) + 1);
                var send_data = {};
                var result = ajaxModule.exec_ajax("create_row_process", send_data);
                console.log(result);
                $(".contextmenu").hide();
            });

            $("#btn_import_excel").off("click").on("click", function (e) {
                // 인풋 파일 폼 생성
                var input_file = document.createElement("INPUT");

                input_file.setAttribute("type", "file");
                input_file.setAttribute("name", "input_excel_upload");

                //생성한 인풋 파일 폼에 이벤트 정의
                $(input_file).on('change', function(){
                     var project_seq = ajaxModule.getUrlParams("project_seq");
                     var excelObject = $(this)[0].files[0];

                     if( confirm('Excel File을 업로드 하시겠습니까?')){
                          var formData = new FormData();
                          formData.append('project_seq', project_seq);
                          formData.append('import_excel', excelObject);
                          $(input_file).val(''); // 업로드 폼 초기화

                          $.ajax({
                               url: '/works/cglist/excel_import',
                               data: formData,
                               processData: false,
                               contentType: false,
                               dataType: "json",
                               type: 'POST',
                               success: function(data){
                                    if( data.result ){
                                    	alert('엑셀 가져오기가 완료되었습니다\n화면을 갱신합니다');
                                    	window.reload();
                                    	
                                    	/*
                                         if( confirm('시트가 새로 등록되었습니다.\n새로운 시트를 적용하시겠습니까?') ){
                                              // data.next_sheet_seq
                                              sheetChange(project_seq, data.next_sheet_seq);
                                         }
                                         */
                                    }else{
                                         alert('엑셀 가져오기가 실패하였습니다.');
                                    }
                               },
                               error: function(e){
                                   alert('엑셀 가져오기가 실패하였습니다.');
                               }
                          });
                     }
                });
                //이벤트 인풋 폼 실행
                $(input_file).click();
                $(".contextmenu").hide();
            });
            //엑셀 내보내기
            $("#btn_export_excel").off("click").on("click", function (e) {
                var table_all_rows_arr = [];

                if (tableBatch.searchedCellList.length === 0)
                {
                    var table_all_rows = $('#data-table').DataTable().rows().nodes();
                    table_all_rows.each(function(index, el) {
                        table_all_rows_arr.push($(index).find("td").first().next().attr("data-cglist_seq"));
                    });
                }
                else
                {
                    table_all_rows_arr = tableBatch.searchedCellList;
                }
                ajaxModule.exec_ajax("excel_export", table_all_rows_arr);
                $(".contextmenu").hide();
            });
        }
        return local_init.init();
    }
};

var trColor =
{
    name: "trColor",
    getName: function ()
    {
        return this.name;
    },
    init: function ()
    {
        $(this).contextMenu

        //전체 td 백그라운드 컬러 초기화
        var tr = $(".gradeA");
        $(tr).each(function(index, el) {
            var trNum = $(el).closest('tr').prevAll().length;
            var background_color = (trNum % 2) ? 'rgb(255, 255, 255)' : 'rgb(240, 243, 245)';
           $(el).find("td").css("background-color", background_color);
        });
    }
}

/**
*
* @summary 테이블에서 셀 혹은 행을 제어하는 모듈 -
* @description tableControlModule.exec_table_controll(function, data)
* @typedef {string} function
* @typedef {object} data
* @return {void}
*
**/
var tableControlModule = {

    name: "tableControlModule",

    data: {},

    result_data: {},

    get_name: function ()
    {
        return this.name;
    },

    remove_row: function ()
    {
        var result = confirm('요청하신 행을 삭제하시겠습니까?');
        if (result)
        {
            var cglist_seq = this.data.selected_cell.attr("data-cglist_seq");
            var original_tr = $('.gradeA').find('.editable[data-cglist_seq="'+cglist_seq+'"]').first().parents("tr");
            var clone_tr = $('.DTFC_Cloned').find('.editable[data-cglist_seq="'+cglist_seq+'"]').first().parents("tr");

            var send_data = {
                cglist_seq: cglist_seq,
                type: this.data.mathod
            };
            ajaxModule.exec_ajax("delete_row_process", send_data);

            original_tr.remove();
            clone_tr.remove();
        }
        return local_init.init();
    },

    insertLabelStatus: function (status_int)
    {
        var css_class = "";

        switch (status_int) {
            case 1:
                css_class = "default";
                break;
            case 2:
                css_class = "primary";
                break;
            case 3:
                css_class = "warning";
                break;
            default:
                css_class = "default";
                break;
        }
        return css_class;
    },

    add_row: function ()
    {
        var cglist_seq = this.data.selected_cell.attr("data-cglist_seq");
        var original_tr = $('.gradeA').find('.editable[data-cglist_seq="'+cglist_seq+'"]').first().parents("tr");
        var clone_tr = $('.DTFC_Cloned').find('.editable[data-cglist_seq="'+cglist_seq+'"]').first().parents("tr");

        var send_data =
        {
            cglist_seq: cglist_seq,
            type: this.data.mathod
        };

        var result = ajaxModule.exec_ajax("create_row_process", send_data);

        //td default data
        var status_seq = result["cglist_info"]["STATUS_SEQ"];
        var status_name = result["cglist_info"]["STATUS_NAME"];

        //status add label
        var css_class = tableControlModule.insertLabelStatus(status_seq);
        var data_include_label = '<span class="label label-'+css_class+'">'+status_name+'</span>';

        //고정열이 있을 때
        if (clone_tr.length > 0)
        {
            var cloned_original_tr =  original_tr.clone();
            var cloned_clone_tr =  clone_tr.clone();

            //복제 행 초기화
            cloned_original_tr.find('td').each(function(index, el) {
                if ($(el).attr("class") !== "check_box editable sorting_1")
                {
                    if ($(el).attr("data-name") == "STATUS_SEQ")
                    {
                        $(el).attr("data-text", status_name);
                        $(el).attr("data-cglist_seq", result.cglist_seq);
                        $(el).html(data_include_label);
                    }
                    else
                    {
                        $(el).attr("data-text", "");
                        $(el).attr("data-cglist_seq", result.cglist_seq);
                        $(el).html("");
                    }
                }
            });

            cloned_clone_tr.find('td').each(function(index, el) {
                if ($(el).attr("class") !== "check_box editable sorting_1")
                {
                    if ($(el).attr("data-name") == "STATUS_SEQ")
                    {
                        $(el).attr("data-text", status_name);
                        $(el).attr("data-cglist_seq", result.cglist_seq);
                        $(el).html(data_include_label);
                    }
                    else
                    {
                        $(el).attr("data-text", "");
                        $(el).attr("data-cglist_seq", result.cglist_seq);
                        $(el).html("");
                    }
                }
            });
        }

        //고정열이 없을 때
        else
        {
            var cloned_original_tr =  original_tr.clone();

            cloned_original_tr.find('td').each(function(index, el) {
                if ($(el).attr("class") !== "check_box editable sorting_1")
                {
                    if ($(el).attr("data-name") == "STATUS_SEQ")
                    {
                        $(el).attr("data-text", status_name);
                        $(el).attr("data-cglist_seq", result.cglist_seq);
                        $(el).html(data_include_label);
                    }
                    else
                    {
                        $(el).attr("data-text", "");
                        $(el).attr("data-cglist_seq", result.cglist_seq);
                        $(el).html("");
                    }
                }
            });
        }
        switch (this.data.mathod)
        {
            case "prev":
                original_tr.before(cloned_original_tr);
                clone_tr.before(cloned_clone_tr);
                break;
            case "next":
                original_tr.after(cloned_original_tr);
                clone_tr.after(cloned_clone_tr);
                break;
        }
        return local_init.init();
    },

    exec_table_controll: function (func, data = {})
    {
        this.data = data;
        if (this.hasOwnProperty(func) && typeof this[func] === "function") {
            return this[func](data);
        } else {
            console.log('not defined : check of function defined');
        }
    }
};

var taskModule = {

    name: "taskModule",

    class: ".task_layer",

    checked_member_parent_list: [],

    result_seq_list: [],

    getName: function ()
    {
        return this.name;
    },
    closeLayer: function ()
    {
        return $(".task_layer").hide();
    },

    setUpdateMemberList: function ()
    {
        if (this.result_seq_list == null)
        {
            alert("회원 참여 리스트를 다시 확인해주세요.");
            return false;
        }
        var inner_html = "<ul>";
        $(this.result_seq_list.MEMBER_TASK_LIST).each(function(index, el) {
            inner_html = inner_html + "<li data-member_seq='"+el["MEMBER_SEQ"]+"'";
            inner_html = inner_html + " data-task_seq='"+el["TASK_SEQ"]+"'";
            inner_html = inner_html + " data-name='"+el["MEMBER_NAME"];
            inner_html = inner_html + "'>"+el["MEMBER_NAME"]+"</li>";
        });
        inner_html = inner_html + "</ul>";
        $(this.data).html(inner_html);

        this.closeLayer();
        return local_init.init();
    },

    setEventListener: function ()
    {
        var this_module = this;

        //check box toggle logic
        $(".mem_check").parents("tr").off("click").on("click", function (e) {
            e.stopImmediatePropagation();
            e.stopPropagation();

            //체크박스 상태 확인 후 checked or unchecked로 상태 변환
            $(this).find("input[type='checkbox']").prop('checked',function(){
                return !$(this).prop('checked');
            });
        });
        $(".mem_chk_box").off("click").on("click", function (e) {
            e.stopImmediatePropagation();
            e.stopPropagation();

            //체크박스 상태 확인 후 checked or unchecked로 상태 변환
            $(this).find("input[type='checkbox']").prop('checked',function(){
                return !$(this).prop('checked');
            });
        });

        //get column and cell info
        var column_info = jQuery.parseJSON(this.data.attr("data-column_info"));
        var task_type_seq = column_info["TASK_TYPE_SEQ"];

        $(".member_save").off("click").on("click", function () {
            var checked_member = [];

            var task_tr = $("#task_layer_tbody > tr");
            $(task_tr).each(function(index, el) {
                var tmp_member_data = {};
                var chk_box = $(el).find(".mem_chk_box").prop('checked');
                var task_seq = $(el).find(".mem_chk_box").attr("data-task_seq");
                var member_seq = $(el).find(".mem_chk_box").val();
                var member_name = $(el).find(".mem_chk_box").attr("data-name");

                //chk_box => 선택 여부 체크, task_seq => task_seq 유무 체크
                // 체크 되었거나 체크되었으면서 task_seq가 있을때
                if (chk_box === true || (chk_box === true && task_seq != "null"))
                {
                    /*
                     *** member_info_list
                     * - task_seq : task 고유번호
                     * - use_yn : 사용 여부
                     * - history_yn : 히스토리 여부
                     * - member_seq : 회원 번호
                     * - member_name : 회원 이름
                     * - task_type_seq : TASK 그룹 내 번호
                     */
                     tmp_member_data.member_name = member_name;
                     tmp_member_data.use_yn = "Y";
                     tmp_member_data.history_yn = "Y";
                     tmp_member_data.member_seq = member_seq;
                     tmp_member_data.task_type_seq = task_type_seq;
                     (task_seq != "null") ? tmp_member_data.task_seq = task_seq : false;
                }
                //task_seq만 있을때
                else if (task_seq != "null")
                {
                    tmp_member_data.member_name = member_name;
                    tmp_member_data.use_yn = "N";
                    tmp_member_data.history_yn = "Y";
                    tmp_member_data.member_seq = member_seq;
                    tmp_member_data.task_type_seq = task_type_seq;
                    tmp_member_data.task_seq = task_seq;

                }
                    //객체가 정의 되어있을때만 배열에 추가
                    (typeof(tmp_member_data) != "undefined") ? checked_member.push(tmp_member_data) : false;
                });
                send_data = {};
                send_data["cglist_seq"] = this_module.data.attr("data-cglist_seq");
                send_data["column_seq"] = this_module.data.attr("data-column_seq");
                send_data["member_info_list"] = checked_member;

                var result_seq_list = ajaxModule.exec_ajax("task_create_process", send_data);
                this_module.result_seq_list = result_seq_list;
                return this_module.setUpdateMemberList();
        });
    },

    init: function ()
    {

        if ($("#task_layer").length === 0)
        {

            var layer =
            '<div class="task_layer" id="task_layer">'
            +    '<div class="panel panel-inverse" data-sortable-id="ui-typography-11">'
            +        '<div class="panel-heading">'
            +            '<h4 class="panel-title" id="task_layer_title" >프로젝트 참여 회원 지정<span id="task_this_scene"></span></h4>'
            +        '</div>'
            +        '<div class="panel-body">'
            +            '<table class="table table-hover fixed_table">'
            +                '<thead>'
            +                    '<tr>'
            +                        '<th>선택</th>'
            +                        '<th>팀</th>'
            +                        '<th>회원 이름(직책)</th>'
            +                    '</tr>'
            +                '</thead>'
            +                '<tbody id="task_layer_tbody" ></tbody>'
            +            '</table>'
            +        '</div>'
            +        '<div class="panel-footer" style="height:60px;">'
            +            '<div class="btn-group pull-right">'
            +                '<button class="member_save btn btn-info" >저장</button>'
            +                '<button class="btn btn-danger" onclick="document.getElementById(\'task_layer\').style.display = \'none\';">닫기</button>'
            +            '</div>'
            +        '</div>'
            +    '</div>'
            +'</div>';
            $("body").append(layer);
        }

        data_result = jQuery.parseJSON( this.data.attr("data-column_info") );

        var send_data = {
            cglist_seq: this.data.attr("data-cglist_seq"),
            column_seq: this.data.attr("data-column_seq"),
            team_seq_list: data_result["TEAM_SEQ_LIST"]
        };
        //task member list draw
        var result = ajaxModule.exec_ajax("member_list", send_data);
        // var result = jQuery.parseJSON(de_result);

        //현재 선택된 task에 해당 씬 이름을 가져와 렌더링.
        var task_this_scene = this.data.parents("tr").find('td[data-name="SCENE"]').html();
        if (task_this_scene != "")
        {
            $("#task_this_scene").html("(SCENE : "+task_this_scene+")");
        }
        else
        {
            $("#task_this_scene").html("");
        }

        var inner_html = "";
        $(result).each(function(index, el)
        {
            inner_html = inner_html + "<tr>";
            inner_html = inner_html + "<td class='mem_check'><input class='mem_chk_box' type='checkbox'";
            inner_html = inner_html + " data-task_seq="+el["TASK_SEQ"]+" value='"+el["SEQ"]+"'";
            inner_html = inner_html + " data-name='"+el["NAME"]+"'></td>";
            inner_html = inner_html + "<td>"+el["TEAM_NAME"]+"</td>";
            inner_html = inner_html + "<td>"+el["NAME"]+"("+el["TITLE_NAME"]+")</td>";
            inner_html = inner_html + "</tr>";
        });
        $("#task_layer_tbody").html(inner_html);

        console.log($("#task_layer_tbody"));


        if ($(this.class).css("display") == "none")
        {
            var nav_bar_height = 54;
            var b_width = $(document).width();
            var b_height = $(document).height();

            var p_width = 400;
            var p_height = 620;

            var sc_top = $( "body" ).scrollTop();

            var pop_top = ((sc_top+(b_height/2)-(p_height/2))-nav_bar_height)+"px";
            var pop_left = ((b_width/2)-(p_width/2))+"px";

            $(this.class).css("width", p_width);
            $(this.class).css("height", p_height);
            $(this.class).css("top", 100);
            $(this.class).css("left", pop_left);
            $(this.class).show();
        }
        return this.setEventListener();
    },

    setSyncTrHeight: function ()
    {
        var table_tr_height = [];
        var left_table = $(".DTFC_Cloned").find("tr");
        var right_table = $(".dataTables_scroll").find("tr");

        if (this.data.parents(".DTFC_Cloned").length > 0) // true => left table
        {
            //클론 셀에서의 이벤트
            $(left_table).each(function(index, el) {
                table_tr_height.push($(el).height());
            });

            var push_index = 0;
            $(right_table).each(function(index, el) {
                $(el).height(table_tr_height[push_index]);
                push_index = push_index + 1;
            });
        }
        else
        {
            //일반 셀에서의 이벤트
            $(right_table).each(function(index, el) {
                table_tr_height.push($(el).height());
            });

            var push_index = 0;
            $(left_table).each(function(index, el) {
                $(el).height(table_tr_height[push_index]);
                push_index = push_index + 1;
            });
        }
    },

    exec_task_controll: function (func, data = {})
    {
        this.data = data;
        if (this.hasOwnProperty(func) && typeof this[func] === "function") {
            return this[func](data);
        } else {
            console.log('not defined : check of function defined');
        }
    }

};

//테이블 일괄처리 모듈 : 현재 변수로만 할당
var tableBatch = {
    name: "tableBatch",
    cell_list: [],
    searchedCellList: []
};

//cglist 로컬 즉시 실행 모듈(자동 초기화 => 언제든지 호출 가능)
var local_init = {

    name: "cglist",

    init: function() {
        this.setButtons2Table();
        this.setElementEvent();
    },

    setButtons2Table: function() {
        if ($("#data-table_wrapper > div:nth-child(1) > div:nth-child(1) > .btn-group").length === 1) return false;

        var project_seq = ajaxModule.exec_ajax("getUrlParams", "project_seq");

        //add buttons to data-table rows : 테이블에 엑셀 기능 버튼 추가
        var data_table_menu_area = $("#data-table_wrapper > div > .col-sm-6").first();

        var excel_btn_group = document.createElement("div");
        excel_btn_group.setAttribute("class", "btn-group");

        var excel_import_btn = document.createElement("SPAN");
        excel_import_btn.setAttribute("class", "btn btn-primary btn-sm fileinput-button");

        var excel_import_inner = '';
        excel_import_inner += '<span>Import Excel</span>';
        excel_import_inner += '<input class="btn btn-default btn-sm active fileinput-button" type="file" name="import_excel" id="import_excel" data-project_seq="'+project_seq+'" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />';
        excel_import_inner += '</span>';

        $(excel_import_btn).html(excel_import_inner);

        var excel_export_btn = document.createElement("a");

        // var excel_export_btn = '<a href="#" class="btn btn-primary btn-sm" data-project_seq="'+project_seq+'" name="export_excel" data-editable="Export">Export Excel</a>';
        excel_export_btn.setAttribute("class", "btn btn-info btn-sm");
        excel_export_btn.setAttribute("data-project_seq", project_seq);
        excel_export_btn.setAttribute("name", "export_excel");
        excel_export_btn.setAttribute("data-editable", "Export");
        excel_export_btn.innerHTML = "Export Excel";

        $(excel_btn_group).append(excel_import_btn);
        $(excel_btn_group).append(excel_export_btn);

        data_table_menu_area.append(excel_btn_group);
    },

    setElementEvent: function()
    {
        //엑셀 내보내기 기능 링크
        $("a[name=export_excel]").on("click", function () {
            var table_all_rows_arr = [];

            if (tableBatch.searchedCellList.length === 0)
            {
                var table_all_rows = $('#data-table').DataTable().rows().nodes();
                table_all_rows.each(function(index, el) {
                    table_all_rows_arr.push($(index).find("td").first().next().attr("data-cglist_seq"));
                });
            }
            else
            {
                table_all_rows_arr = tableBatch.searchedCellList;
            }
            ajaxModule.exec_ajax("excel_export", table_all_rows_arr);
            $(".contextmenu").hide();
        });

        //테이블 항목 보기 갯수 변경 시 로컬 이벤트 초기화
        $( "select[name*='data-table_length']" ).on("change", function () {
            local_init.setElementEvent();
        });

        //사이드바 펴기/접기 기능
        $(".sidebar-minify-btn").on("click", function (e)
        {
            var sidebar_container = $("#page-container");
            if (sidebar_container.hasClass('page-sidebar-minified'))
            {
                sidebar_container.removeClass('page-sidebar-minified')
            }
            else
            {
                sidebar_container.addClass('page-sidebar-minified')
            }
        });

        //확대/축소 버튼 오버라이딩
        $("#table-expand").on("click", function () {
            var wrapper = $(".DTFC_ScrollWrapper");
            //주말
            // 확대/축소 버튼 구별 로직 => 토글 구별자 : 클래스 'expended'
            // 비율로도 가능 *1.1 / *0.9
            if (wrapper.hasClass('expended'))
            {
                wrapper.removeClass('expended');
                tableSyncModule.tableSetHeight(0);
            }
            else
            {
                wrapper.addClass('expended');
                tableSyncModule.tableSetHeight(1);
            }
        });
        //엔터시 테이블 검색 기능
        $("#data-table_filter").find('input[type="search"]').keyup(function(e) {
            if (e.keyCode == 13) //enter key
            {
                event.preventDefault();

                //검색어에 매칭되는 데이터로 대체
                var table = $('#data-table').DataTable();
                table.search( $(this).val() ).draw();

                //검색된 행 데이터를 배치모듈 배열에 추가
                tableBatch.searchedCellList = [];
                table.rows( { filter : 'applied'} ).nodes().each(function(index, el) {
                    tableBatch.searchedCellList.push(
                        $(index).find("td").first().next().attr("data-cglist_seq")
                    );
                });
            }
        });

        /*
         * 엑셀 IMPORT / EXPORT
         */
         $(document).on('change','input[name=import_excel]',function(){
              var project_seq = $(this).data('project_seq');
              var excelObject = $('input[name=import_excel]')[0].files[0];
              if( confirm('Excel File을 업로드 하시겠습니까?')){
                   var formData = new FormData();
                   formData.append('project_seq', project_seq);
                   formData.append('import_excel', excelObject);
                   $('input[name=import_excel]').val(''); // 업로드 폼 초기화
                   $.ajax({
                        url: '/works/cglist/excel_import',
                        data: formData,
                        processData: false,
                        contentType: false,
                        dataType: "json",
                        type: 'POST',
                        success: function(data){
                             console.log( data );
                             if( data.result ){
                                  if( confirm('시트가 새로 등록되었습니다.\n새로운 시트를 적용하시겠습니까?') ){
                                       // data.next_sheet_seq
                                       sheetChange(project_seq, data.next_sheet_seq);
                                  }
                             }else{
                                  // alert('장애가 발생하였습니다\n화면을 갱신합니다\n');
                             }
                        },
                        error: function(e){
                             // alert('장애가 발생하였습니다\n화면을 갱신합니다\n');
                             // window.location.reload(true);
                        }
                   });
              }
         });
        //body 오른쪽 클릭 이벤트 제어
        $( ".sidebar, .content" ).on('contextmenu', function(e)
        {
            e.stopPropagation();
            e.preventDefault();
            if (!$(e.target).hasClass('editable'))
            {
                $(".contextmenu").hide();

                //전체 td 백그라운드 컬러 초기화
                var tr = $(".gradeA");
                $(tr).each(function(index, el) {
                    var trNum = $(el).closest('tr').prevAll().length;
                    var background_color = (trNum % 2) ? 'rgb(255, 255, 255)' : 'rgb(240, 243, 245)';
                   $(el).find("td").css("background-color", background_color);
                });
            }
        });

        $("div.panel-heading").off("contextmenu").on({
            click: function (e)
            {
                $(".contextmenu").hide();
            },
            contextmenu: function (e)
            {
                e.stopPropagation();
                e.preventDefault();

                var $this = $(this);

                var items = [
                    ['엑셀 가져오기', 'list-group-item', 'btn_import_excel'],
                    ['엑셀 내보내기', 'list-group-item', 'btn_export_excel']
                ];

                var context_data = {
                    offset: e,
                    selected_cell: $this
                };

                contextMenuEvent.items = items;
                contextMenuEvent.showContextMenu(context_data);
            }
        });

        $(".column").off("contextmenu").on({
            mousedown: function (e)
            {
                if (e.which === 1)
                {
                    e.stopPropagation();
                    e.preventDefault();
                    $(".contextmenu").hide();
                }

            },
            contextmenu: function (e)
            {
                if (e.currentTarget.cellIndex > 0)
                {
                    e.stopPropagation();
                    e.preventDefault();

                    var col_num = e.currentTarget.cellIndex + 1;
                    var $this = $(this);

                    var items = [
                        ['열 고정', 'list-group-item', 'btn_column_fixed'],
                        ['열 숨김', 'list-group-item', 'btn_column_hide']
                    ];

                    var context_data = {
                        offset: e,
                        selected_cell: $this
                    };

                    contextMenuEvent.items = items;
                    // contextMenuEvent.showContextMenu(context_data);
                }
            }
        });

        $(".editable").off("contextmenu").off("mousedown").on({
            mousedown: function (e)
            {
                var $this = $(this);
                var _selected_colum_name = $(this).data("name");

                //더블 클릭시 이벤트
               if ($this.hasClass('clicked') && e.which === 1)
               {
                   $this.removeClass('clicked');
                   //start dblclick event
                   $( ".history_btn" ).remove();

                   // 인풋 박스가 없을 때
                   if ($(".update_text").length === 0)
                   {
                       if (
                           _selected_colum_name == "CUT_IMG" ||
                           _selected_colum_name == "GUIDE_IMG" ||
                           _selected_colum_name == "TASK_2D" ||
                           _selected_colum_name == "TASK_MASK" ||
                           _selected_colum_name == "TASK_REMOVAL" ||
                           _selected_colum_name == "STATUS_SEQ" ||
                           _selected_colum_name == "CHK_BOX"
                       )
                       {
                           return false;
                       }

                       $(this).css("padding", "0px").css("margin", "0px");
                       var this_el_data = $(this).data();
                       // var odinary_text = $(this).html();
                       var odinary_text = $(this).html().replace(/\s+/, "");//왼쪽 공백제거
                       odinary_text = odinary_text.replace(/\s+$/g, "");//오른쪽 공백제거
                       odinary_text = odinary_text.replace(/\n/g, "");//행바꿈제거
                       odinary_text = odinary_text.replace(/\r/g, "");//엔터제거
                       odinary_text = odinary_text.replace(/\"\"/g,''); //무의미 문자 제거

                       var text_area_box = document.createElement('textarea');
                       text_area_box.className = "update_text";
                       text_area_box.id = "update_text";

                       text_area_box.innerHTML = odinary_text;

                       $this.html(text_area_box);
                       setTimeout(function() {
                           $('#update_text').focus();
                       }, 10);
                   }
                   // 인풋 박스가 있을 때
                   else
                   {
                       //현재 셀내에 인풋 박스가 있을 시 실행 안함
                       if ($(this).find('textarea').length === 1)
                           return false;

                       //인풋 박스가 있으면서 다른 셀에서 이벤트를 실행했을 경우 => 이전 셀 저장 작업 후 이벤트 실행
                       var result = confirm('변경된 내용을 저장하시겠습니까?');
                       var prev_selected_cell = $( ".update_text" ).parents("TD");
                       var prev_selected_cell_text = $( ".update_text" ).val();

                       //컨펌박스 TRUE
                       if (result)
                       {
                           // 이전 셀의 작업 내용을 저장
                           prev_selected_cell.css("padding", "10px").css("margin", "0px");
                           (prev_selected_cell_text == '\"\"') ? changed_text = "" : changed_text = prev_selected_cell_text;

                           var send_data = {
                                   cglist_seq: $this.data("cglist_seq"),
                                   column_seq: $this.data("column_seq"),
                                   cell_data: changed_text,
                                   prev_cell: prev_selected_cell
                           };
                           ajaxModule.exec_ajax("cell_save_process", send_data);

                           $(prev_selected_cell).attr("data-text", changed_text);
                           $(prev_selected_cell).html(changed_text);

                           var _selected_colum_name = $this.attr("data-name");

                           if (
                               _selected_colum_name == "CUT_IMG" ||
                               _selected_colum_name == "GUIDE_IMG" ||
                               _selected_colum_name == "TASK_2D" ||
                               _selected_colum_name == "TASK_MASK" ||
                               _selected_colum_name == "TASK_REMOVAL" ||
                               _selected_colum_name == "STATUS_SEQ" ||
                               _selected_colum_name == "CHK_BOX"
                           )
                           {
                               return false;
                           }

                           // 새로 선택한 셀에 대한 인풋 박스 활성화
                           $this.css("padding", "0px").css("margin", "0px");
                           var odinary_text = $this.html().replace(/\s+/, "");//왼쪽 공백제거
                           odinary_text = odinary_text.replace(/\s+$/g, "");//오른쪽 공백제거
                           odinary_text = odinary_text.replace(/\n/g, "");//행바꿈제거
                           odinary_text = odinary_text.replace(/\r/g, "");//엔터제거
                           odinary_text = odinary_text.replace(/\"\"/g,''); //무의미 문자 제거

                           var text_area_box = document.createElement('textarea');
                           text_area_box.className = "update_text";
                           text_area_box.id = "update_text";

                           text_area_box.innerHTML = odinary_text;

                           $this.html(text_area_box);
                       }
                       //컨펌박스 FALSE
                       else
                       {
                           $this = $( ".update_text" ).parent();
                           $this.css("padding", "12px").css("margin", "0px");
                           var recovery_text = $this.attr("data-text");
                           $this.html(recovery_text);
                       }
                   }
                   return true;
                   //end dblclick event
                }
                //한번 클릭시 이벤트
                else
                {
                     $this.addClass('clicked');
                     setTimeout(function()
                     {
                         if ($this.hasClass('clicked'))
                         {
                             $this.removeClass('clicked');
                             var this_color = $this.css("background-color");
                             var en_column_info = $this.attr("data-column_info");
                             var de_column_info = $.parseJSON(en_column_info);

                             //click event start
                             if ($(".contextmenu").css("display") !== 'none')
                                 $(".contextmenu").hide();

                             //현재 td의 column type 따라 왼쪽 원클릭 이벤트 지정
                             if (e.which === 1)
                             {
                                 //전체 td 백그라운드 컬러 초기화
                                 var tr = $(".gradeA");
                                 $(tr).each(function(index, el) {
                                     var trNum = $(el).closest('tr').prevAll().length;
                                     var background_color = (trNum % 2) ? 'rgb(255, 255, 255)' : 'rgb(240, 243, 245)';
                                    //  var index = $this.attr("data-cglist_seq")+'-'+$this.attr("data-column_seq");
                                    $(el).find("td").css("background-color", background_color);
                                 });

                                 //체크박스 토글
                                 var event_target = $(e.target);
                                 switch (de_column_info["TYPE"]) {
                                     case 'check':
                                             //선택된 이벤트 타겟이 인풋 박스가 아닐떄(셀 클릭 경우)
                                             if (event_target[0].tagName != "INPUT")
                                             {
                                                  if ($(event_target).find("input[type='checkbox']").length == 0)
                                                  {
                                                      var checked = $(event_target).prop('checked');
                                                      (checked) ? target.checked = false : target.checked = true;
                                                      break;
                                                  }
                                                  else
                                                  {
                                                      var checked = $(event_target).find("input[type='checkbox']").prop('checked');
                                                      (checked) ? target.childNodes[0].checked = false : target.childNodes[0].checked = true;
                                                      break;
                                                  }
                                             }
                                             break;
                                     default:
                                            //선택된 td 백그라운드 컬러 변경
                                            var trNum = $this.closest('tr').prevAll().length;
                                            var background_color = (trNum % 2) ? 'rgb(255, 255, 255)' : 'rgb(240, 243, 245)';
                                            //  var index = $this.attr("data-cglist_seq")+'-'+$this.attr("data-column_seq")

                                            //선택된 td 백그라운드가 지정된 색일 경우 & 인풋박스가 없을때만 실행
                                            if (this_color !== 'rgb(255, 255, 204)' && $(".update_text").length !== 1)
                                            {
                                                $this.css("background-color", "rgb(255, 255, 204)")
                                               //  tableBatch.cell_list = jQuery.grep(tableBatch.cell_list, function(value) { return value != index; });
                                               break;
                                            }
                                            //선택된 td 백그라운드가 기본 색일 경우 & 인풋박스가 없을때만 실행
                                            else if (this_color === 'rgb(255, 255, 204)' && $(".update_text").length !== 1)
                                            {
                                                $this.css("background-color", background_color);
                                               //  tableBatch.cell_list.push(index);
                                               break;
                                            }
                                 }
                             }
                             //오른쪽 클릭시 컨텍스트 메뉴 박스 보이기
                             else if(e.which === 3)
                             {
                                 e.stopPropagation();
                                 e.preventDefault();

                                 var context_data = {
                                     offset: e,
                                     selected_cell: $this
                                 };
                                 var column_type = jQuery.parseJSON($this.attr("data-column_info"));

                                // 메뉴 안 구성 아이템 지정
                                switch (column_type["TYPE"]) {
                                    case "media":
                                        var items = [
                                            ['자세히 보기', 'list-group-item', 'btn_detail'],
                                            ['파일 변경', 'list-group-item', 'btn_file_upload'],
                                            ['위에 행 추가', 'list-group-item', 'btn_add_up_row'],
                                            ['아래에 행 추가', 'list-group-item', 'btn_add_down_row'],
                                            ['행 삭제', 'list-group-item', 'btn_remove_row']
                                        ];
                                    break;
                                    case "member":
                                        var items = [
                                            ['자세히 보기', 'list-group-item', 'btn_detail'],
                                            ['멤버 번경', 'list-group-item', 'btn_task_update'],
                                            ['위에 행 추가', 'list-group-item', 'btn_add_up_row'],
                                            ['아래에 행 추가', 'list-group-item', 'btn_add_down_row'],
                                            ['행 삭제', 'list-group-item', 'btn_remove_row']
                                        ];
                                    break;
                                    case "check":
                                        var items = [
                                            ['자세히 보기', 'list-group-item', 'btn_detail'],
                                            ['위에 행 추가', 'list-group-item', 'btn_add_up_row'],
                                            ['아래에 행 추가', 'list-group-item', 'btn_add_down_row'],
                                            ['행 삭제', 'list-group-item', 'btn_remove_row']
                                        ];
                                    break;
                                    default:
                                        var items = [
                                            ['자세히 보기', 'list-group-item', 'btn_detail'],
                                            ['히스토리', 'list-group-item', 'btn_history'],
                                            ['위에 행 추가', 'list-group-item', 'btn_add_up_row'],
                                            ['아래에 행 추가', 'list-group-item', 'btn_add_down_row'],
                                            ['행 삭제', 'list-group-item', 'btn_remove_row']
                                        ];
                                    break;
                                }

                                 //컨텍스트 메뉴바 리스트 지정
                                 contextMenuEvent.items = items;
                                 // 컨텍스트 메뉴 로드
                                 contextMenuEvent.showContextMenu(context_data);
                             }
                             //click event end
                         }
                     }
                     , 300);
                }
            },
            dblclick: function(e) {
                return false;
                e.preventDefault(); //don't do anything
            }
        });

        $(window).off('keydown').on('keydown', function(event) {
            if (event.ctrlKey || event.metaKey) {
                switch (String.fromCharCode(event.which).toLowerCase()) {
                case 's':
                    event.preventDefault();
                    $this = $( ".update_text" ).parent();

                    $this.css("padding", "12px").css("margin", "0px");

                    var changed_text = $( ".update_text" ).val();

                    var send_data = {
                            cglist_seq: $this.data("cglist_seq"),
                            column_seq: $this.data("column_seq"),
                            cell_data: changed_text,
                    };

                    ajaxModule.exec_ajax("cell_save_process", send_data);
                    // cell_save_process(send_data);
                    $this.attr("data-text", changed_text);
                    //selected_cell => 클론 된 셀도 포함됨.
                    var selected_cell = $( '.editable[data-cglist_seq="'+$this.data("cglist_seq")+'"][data-column_seq="'+$this.data("column_seq")+'"]' );
                    selected_cell.html(changed_text);
                    break;

                /*case 'z': //rollback
                    event.preventDefault();
                    $this = $( ".update_text" ).parent();
                    $this.css("padding", "12px").css("margin", "0px");
                    var recovery_text = $this.attr("data-text");
                    $this.html(recovery_text);
                    break;*/
                }
            }

            if (event.keyCode === 112)
            {
                event.preventDefault();
                if ($(".keymap_layer").css("display") == "none")
                {
                    var nav_bar_height = 154;
                    var b_width = $(document).width();
                    var b_height = $(document).height();

                    var p_width = 600;
                    var p_height = 400;

                    var sc_top = $( "body" ).scrollTop();

                    var pop_top = ((sc_top+(b_height/2)-(p_height/2))-nav_bar_height)+"px";
                    var pop_left = ((b_width/2)-(p_width/2))+"px";

                    $(".keymap_layer").css("width", p_width);
                    $(".keymap_layer").css("height", p_height);
                    $(".keymap_layer").css("top", 200);
                    $(".keymap_layer").css("left", pop_left);
                    $(".keymap_layer").show();
                }
            }

        });
        $(window).off('keyup').on('keyup', function(event) {
            if (event.keyCode == 27) {              //keydown 'esc'
                event.preventDefault();
                $this = $( ".update_text" ).parent();
                $this.css("padding", "12px").css("margin", "0px");
                var recovery_text = $this.attr("data-text");

                var selected_cell = $( '.editable[data-cglist_seq="'+$this.data("cglist_seq")+'"][data-column_seq="'+$this.data("column_seq")+'"]' );
                selected_cell.html(recovery_text);

                taskModule.exec_task_controll("setSyncTrHeight", $this);

                ($(".contextmenu").css("display") == "block") ? $(".contextmenu").hide() : true;
                ($(".history_layer").css("display") == "block") ? $(".history_layer").hide() : true;
                ($(".task_layer").css("display") == "block") ? $(".task_layer").hide() : true;
                ($(".detailView").css("display") == "block") ? $(".detailView").hide() : true;

            }
            if (event.keyCode === 112)
            {                           //keydown 'F1'
                event.preventDefault();
                $(".keymap_layer").hide();
            }
        });
    }
};

$(document).ready(function() {

     var pop_visible_status = true;

     /*
      * 팝업 닫기(삭제)
      * 팝업안이나 팝업띄우는 a위에 마우스가 있을 경우에는 동작하지 않는다
      */
     $(document).on('click',document,function(e){
          if( pop_visible_status ){
               if( $('#data-table').find('div[name=popover]').length > 0 ){
                    pop_delete( $('#data-table').find('div[name=popover]') );
               }
          }
     });
     $('#data-table').on('mouseover','div[name=popover]',function(){
          pop_visible_status = false;
     });
     $('#data-table').on('mouseout','div[name=popover]',function(){
          pop_visible_status = true;
     });
     $('#data-table').on('mouseover','td.editable > a[name=data]',function(){
          pop_visible_status = false;
     });
     $('#data-table').on('mouseout','td.editable > a[name=data]',function(){
          pop_visible_status = true;
     });

     // 닫기 버튼
     $(document).on('click','button.editable-cancel',function(){
          var obj = $(this).parents('div[name=popover]').first();
          pop_delete( obj );
     });

     // 팝업 폼 띄우기 - anchor base
     $('#data-table').on('click','td.editable > a[name=data]',function(){
          if( $('#data-table').find('div[name=popover]').length > 0 ){
               pop_delete( $('#data-table').find('div[name=popover]') );
          }

          var aObj = this;
          var tdObj = $(aObj).parents('td.editable').first();

          var cglist_seq = $(aObj).parents('tr').first().data('seq');


          // 팝업 생성
          var title = $(tdObj).data('title');
          var editType = $(tdObj).data('edittype');
          var data = $(aObj).html();

          var pop_html = popupEditForm(editType,title, data);
          /*
           * 팝업 랜더링
           * type : input, textarea
           */
          $(tdObj).append( pop_html );

          var popObj = $(tdObj).find('div[name=popover]');

          if( editType == 'textarea' ){
               // TextArea -> wysisyg Editor change;
               $('#wysihtml5_comment').wysihtml5({
                    "font-styles": false, //Font styling, e.g. h1, h2, etc. Default true
                    "emphasis": false, //Italics, bold, etc. Default true
                    "lists": false, //(Un)ordered lists, e.g. Bullets, Numbers. Default true
                    "html": true, //Button which allows you to edit the generated HTML. Default false
                    "link": false, //Button to insert a link. Default true
                    "image": false, //Button to insert an image. Default true,
                    "color": true //Button to change color of font
               });
          }

          var popWidth = $(popObj).width() + parseInt( $(popObj).css('padding-left').replace('px','') ) + parseInt( $(popObj).css('padding-right').replace('px','') );
          var popHeight = $(popObj).height();

          /*
           * 팝업 위치 조정
           */
          var revision_left;
          var revision_top;

          var tdOffset = $(tdObj).offset();

          var expend_check = $('div#content-panel').hasClass('panel-expand');

          var top_tmp1 = $('div#header').height();
          var top_tmp2 = parseInt( $('div#content').css('padding-top').replace('px','') );
          var top_tmp3 = $('div#content').find('div.panel-heading').first().height();
          var top_tmp4 = parseInt( $('div#content').find('div.panel-heading').first().css('padding-top').replace('px','') );
          var top_tmp5 = parseInt( $('div#content').find('div.panel-heading').first().css('padding-bottom').replace('px','') );
          var top_tmp6 = parseInt( $('div#content').find('div.panel-body').first().css('padding-top').replace('px','') );
          var top_tmp7 = $('div#content').find('div.panel-body').first().find('p').first().height() + parseInt( $('div#content').find('div.panel-body').first().find('p').first().css('padding-bottom').replace('px','') );

          var left_tmp1 = parseInt( $('div#content').css('margin-left').replace('px','') );
          var left_tmp2 = parseInt( $('div#page-container').find('div#content').first().css('padding-left').replace('px','') );
          var left_tmp3 = parseInt( $('div#page-container').find('div#content').first().find('div#panel-body').css('padding-left').replace('px','') );

          var td_width = $(tdObj).width() + (parseInt( $(tdObj).css('padding-left').replace('px','') ) * 2);

          // 데이터 테이블 전체화면 체크
          if( expend_check ){
               revision_left = left_tmp3;
               revision_top = top_tmp3 + top_tmp4 + top_tmp5 + top_tmp6 + top_tmp7;
          }else{
               revision_left = left_tmp1 + left_tmp2 + left_tmp3;
               revision_top = top_tmp1 + top_tmp2 + top_tmp3 + top_tmp4 + top_tmp5 + top_tmp6 + top_tmp7;
          }

          var request_left = 0;
          var request_top = 0;

          if( editType == 'input' ){
               // border 값등 width, height에 계산되지 않은 보정값추가
               popWidth += 4;
               popHeight += 4;

               request_left = tdOffset.left - revision_left + $('#data-wrapper').scrollLeft() - (popWidth/2) + (td_width/2);
               request_top = tdOffset.top - revision_top - popHeight - 5;
          }else if( editType == 'textarea' ){
               // 기본
               request_left = tdOffset.left - revision_left + $('#data-wrapper').scrollLeft() - popWidth + 10;
               request_top = tdOffset.top - revision_top - 10;
          }else{
               request_left = tdOffset.left - revision_left + $('#data-wrapper').scrollLeft();
               request_top = tdOffset.top - revision_top - popHeight;
          }

          /*
          console.log( 'TD - x : ' + tdOffset.left + ", y:" + tdOffset.top );
          console.log( '보정값 : ' + revision_left + " / " + revision_top );
          console.log( '요청값 : ' + request_left + " / " + request_top );

          console.log( 'Scroll - x:' + $('#data-wrapper').scrollLeft() + ', y:' + $(window).scrollTop() );
          console.log( 'Scroll Top :' + $(document).scrollTop() + ' / ' + $(window).scrollTop() );
          */

          $(popObj).css('top',request_top);
          $(popObj).css('left',request_left);

          // 팝업 보이기
          $(tdObj).find('div[name=popover]').slideToggle(150);
     });

     /*
      * 자료 저장
      */
     $(document).on('click','button.editable-submit',function(){
          popFormInputDataSave();
     });

     // 팝업 Input Enter
     $(document).on('keyup','div[name=popover]',function(e){
          if( e.keyCode == 13 ){
               // 값 저장
               // popFormInputDataSave(this);
          }else if( e.keyCode == 27 ){
               // 팝업 닫기
               pop_delete(this);
          }
     });

     // Popup Form Input Data 저장
     var popFormInputDataSave = function(){
          var popObj = $('div[name=popover]');
          var editType = $(popObj).data('edittype');
          var data;
          if( editType == 'input' ){
               data = $(popObj).find('div.editable-input > input').val();
          }else if( editType == 'textarea' ){
               data = $(popObj).find('#wysihtml5_comment').val();
          }

          var cglist_seq = $(popObj).parents('tr').first().data('seq');
          var data_name = $(popObj).parents('td.editable').first().data('name');

          var paramObj = new Object();
          paramObj.cglist_seq = cglist_seq;
          paramObj.modify_name = data_name;
          paramObj.modify_data = data;

          var aDataObj = $(popObj).parents('td.editable').first().find('a[name=data]');

          $.ajax({
               url: "/works/cglist/cell_modify_process",
               method: "POST",
               data: paramObj,
               dataType: "json",
               success: function(e){
                    if( e.result ){
                         $(aDataObj).html(data);
                         pop_delete(popObj);
                    }else{
                         // 실패 시
                    }
               }
          });
     }


});//          EO        $(document).ready(function());

/*
 * 프로젝트 > 시트 번호 변경
 */
function sheetChange(project_seq,sheet_seq){
     var paramObj = new Object();
     paramObj.project_seq = project_seq;
     paramObj.sheet_seq = sheet_seq;

     $.ajax({
          url: "/works/cglist/sheet_change",
          method: "POST",
          data: paramObj,
          dataType: "json",
          success: function(e){
               if( e.result ){
                    alert('CG List 시트가 변경되었습니다\n화면을 갱신합니다');
                    window.location.reload(true);
               }else{
                    alert('요청이 올바로 처리되지 않았습니다.\n다시 시도해주세요');
               }
          }
     });

}//       EOF       var sheetChange = function(project_seq,sheet_seq)

/*
 * 팝업 삭제
 */
function pop_delete(Obj){
     $(Obj).fadeOut(100,function(){
          $(this).remove();
     });
}

/*
 * Popup Edit Forms
 */
function popupEditForm(type, titie, data){
     var pop_html = '';

     if( type == "input" ){
          pop_html += '<div class="popover fade top in editable-container editable-popup disabled" name="popover" role="tooltip" style="min-width:300px;top: 0px; left: 0px; display: none;" data-edittype="'+type+'" >';
          pop_html +=    '<div class="arrow" style="left: 50%;"></div>';
          pop_html +=    '<h3 class="popover-title">'+titie+'</h3><div class="popover-content">';
          pop_html +=    '<div>';
          pop_html +=         '<div class="editableform-loading" style="display: none;"></div>';
          // pop_html +=         '<form class="form-inline editableform" style="">';
          pop_html +=              '<div class="control-group form-group">';
          pop_html +=                   '<div>';
          pop_html +=                        '<div class="editable-input" style="position: relative;">';
          pop_html +=                             '<input type="text" name="data" class="form-control input-sm" style="padding-right: 24px;" value="'+data+'">';
          pop_html +=                        '</div>';
          pop_html +=                        '<div class="editable-buttons">';
          pop_html +=                             '<button type="button" class="btn btn-primary btn-sm editable-submit"><i class="glyphicon glyphicon-ok"></i></button>';
          pop_html +=                             '<button type="button" class="btn btn-default btn-sm editable-cancel"><i class="glyphicon glyphicon-remove"></i></button>';
          pop_html +=                        '</div>';
          pop_html +=                   '</div>';
          pop_html +=                   '<div class="editable-error-block help-block" style="display: none;"></div>';
          pop_html +=              '</div>';
          // pop_html +=         '</form>';
          pop_html +=         '</div>';
          pop_html +=    '</div>';
          pop_html += '</div>';
     }else if( type == "textarea" ){
          pop_html += '<div class="popover editable-container editable-popup fade left in" role="tooltip" name="popover" style="width:450px;top: 0px; left: 0px; display: none;" data-edittype="'+type+'" >';
          pop_html +=    '<div class="arrow" style="top: 30%;"></div>';
          pop_html +=         '<h3 class="popover-title">'+titie+'</h3>';
          pop_html +=         '<div class="popover-content">';
          pop_html +=              '<div>';
          pop_html +=                   '<div class="editableform-loading" style="display: none;"></div>';
          // pop_html +=                   '<form class="form-inline editableform" style="">';
          pop_html +=                        '<div class="control-group form-group">';
          pop_html +=                             '<div>';
          pop_html +=                                  '<div class="editable-input" style="position: relative;">';
          pop_html +=                                       '<textarea class="textarea form-control" id="wysihtml5_comment" rows="5" placeholder="Enter text ..." style="min-width:300px;">'+data+'</textarea>';
          pop_html +=                                  '</div>';
          pop_html +=                             '<div class="editable-buttons">';
          pop_html +=                                  '<button type="submit" class="btn btn-primary btn-sm editable-submit"><i class="glyphicon glyphicon-ok"></i></button>';
          pop_html +=                                  '<button type="button" class="btn btn-default btn-sm editable-cancel"><i class="glyphicon glyphicon-remove"></i></button>';
          pop_html +=                             '</div>';
          pop_html +=                        '</div>';
          pop_html +=                        '<div class="editable-error-block help-block" style="display: none;"></div>';
          pop_html +=                   '</div>';
          // pop_html +=                   '</form>';
          pop_html +=              '</div>';
          pop_html +=         '</div>';
          pop_html += '</div>';
     }
     return pop_html;
}
