//http://localhost:4567/works/cglist/jsheet?project_seq=25
;
(function($, window, document, undefined) {
    "use strict";
    /** * --------------------------------------------------------------------
     * @param undefined * 글로벌 전역 변수인 undefined 사용합니다.
     * 단, ES3 에서는 다른 누군가에 의해서 전역 변수인 undefined 를
     * 변경할 수 있기 때문에 실제 undefined 인지 확신할 수 없습니다.
     * ES5 에서 undefined 는 더이상 값을 변경할 수 없습니다.
     * 같은 구조 샘플 : https://github.com/takemaru-hirai/japan-map/blob/master/jquery.japan-map.js
     * ----

     /** * -------------------------------------------------------------------
      * @param window, document * window, document 는 전역 스코프가 아니라 지역스코프에서 사용하도록 설정
      * 이는 프로세스를 조금 더 빠르게 해결하고 능률적으로 minified 할 수 있다.
      * (특히, 해당 플러그인이 자주 참조될 경우에)
      * ----------------------------------------------------------------------
      */

    // defaults 는 한번만 생성합니다.
    var pluginName = 'jsheet',
        defaults = {
            version           : "1.10", // plugin version
            dataMethod        : "ajax", // How to import data
            dataType          : "json", // Content-Type
            parseURL          : "/dev/data.json", // How to import data
            autoCommit        : true, // Post-Work DOM Rendering Use or not
            headerGroup       : true, // table top header Use or not
            fixedHeader       : true, // table fixed header Use or not
            fixedColumn       : true, // table fixed column Use or not
            fixedCount        : 2, // table fixed column count
            controllerBar     : true, // Cell control bar Use or not
            controllerBarItem :
            [ // glyphicon
                {
                    icon  : "floppy-disk",
                    title : "전체 저장"
                },
                {
                    icon  : "pencil",
                    title : "수정"
                },
                {
                    icon  : "align-left",
                    title : "왼쪽 정렬"
                },
                {
                    icon  : "align-center",
                    title : "가운데 정렬"
                },
                {
                    icon  : "align-right",
                    title : "오른쪽 정렬"
                },
                {
                    icon  : "tasks",
                    title : "자세히 보기"
                },
                {
                    icon  : "plus-sign",
                    title : "아래에 행 추가"
                },
                {
                    icon  : "question-sign",
                    title : "도움말"
                },
            ],
            filter : true, // table Filter Use or not
            data   : null,
            history: [],
        };

    // plugin constructor
    function Plugin(element, options) {
        /** * ----------------------------------------------------------------
         * 제이쿼리는 두개 또는 그 이상의 객체들을 첫번째 객체에
         * 저장하여 병합,확장할 수 있는 $.extend 유틸리티를 소유하고 있습니다.
         * 일반적으로 첫번째 객체에 {}, 빈 객체를 설정하여 * 플러그인 인스턴스에 대한 default option(기본옵션)을
         * 변경시키지 않도록 하기 위함입니다.
         * ---------------------------------------------------------------- */
        this.element = element;
        this.options = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        this._select = JSON.parse('[{"SEQ":"1","NAME":"Ready"},{"SEQ":"2","NAME":"Wip"},{"SEQ":"3","NAME":"Rescan"},{"SEQ":"4","NAME":"Change"},{"SEQ":"5","NAME":"Out"},{"SEQ":"6","NAME":"Sim"},{"SEQ":"7","NAME":"2D Fin"},{"SEQ":"8","NAME":"Retake"},{"SEQ":"9","NAME":"S3D Retake"},{"SEQ":"10","NAME":"Fin"},{"SEQ":"11","NAME":"S3D Fin"},{"SEQ":"12","NAME":"Omit"},{"SEQ":"13","NAME":"No CG"},{"SEQ":"14","NAME":"Hold"},{"SEQ":"15","NAME":"Add"}]');

        this.init();
    }

    Plugin.prototype.init = function() {
        /** * ----------------------------------------------------------------
         * 이곳에 초기화 로직을 작성합니다.
         * 여러분은 이미 인스턴스를 통해 DOM 요소, options 을 사용할 수 있습니다.
         * (예. this.element, this.options)
         * ------------------------------------------------------------------ */
        this.loadData();

        $('item[data-menu="cglist"]').addClass('active');
    };

    Plugin.prototype.setCellEvent = function()
    {
        var self = this;

        // column type : selector
        $( ".cell-selector" ).change(function() {
            //셀렉트 박스 값 변경 시 컨트롤바에 수정됨 표시
            self.textUpdated(true);

            $(this).closest('td').focus();
        });

        // IE11 CSS 조정
        if ('Netscape' == navigator.appName  &&
            -1         != navigator.userAgent.search('Trident'))
        {
            $(".jsheet-table-body").css("right", 0).css("bottom", 0);
            $(".jsheet-table-body-fixed").css("min-height", "80.5vh").css("max-height", "80.5vh");
        }
        else
        {
            $(".jsheet-table-body").css("position", "absolute");
        }
    };


    Plugin.prototype.loadData = function() {
        // make loader options
        var loader_options = { //global
            target:        this.element,
            type:          "outer",
            spin_second:   "0.5s",
            loader_margin: "-150px 0px 0px 0px"
        };
        if (this.options.dataMethod) {
            // call ajax
            this.func(this.options.dataMethod, {
                url           : this.options.parseURL,
                func          : "deaultLender2Element",
                data          : this.options.data,
                loader_options: loader_options,
            });
        }
        else
        {
            this.func("deaultLender2Element", this.options.data);
        }

        return this.setCellEvent();
    };

    // 기본 테이블 생성
    Plugin.prototype.deaultLender2Element = function(data) {
        // set data to module
        this.options.data = data;

        if (this.options.controllerBar) {
            var controllerBar = this.createControllerBar();
            this.element.appendChild(controllerBar);
        }

        var contents = document.createElement("DIV");
        contents.className = "jsheet-table";

        var header = this.createHeader();
        var body   = this.createBody();

        contents.appendChild(header);
        contents.appendChild(body);

        this.element.appendChild(contents);

        this.func("setSyncScroll");

        this.func("setStaticEventListener");

        window.mediaView.init();

        // this module onload
        window.loader.remove();
        return ;
    };

    /** * ----------------------------------------------------------------------
     * Create Table Header Element / 테이블 헤더 생성
     * 입력받은 데이터를 바탕으로 테이블의 헤더를 생성
     * -----------------------------------------------------------------------*/
    Plugin.prototype.createHeader = function() {
        var table_warp_div = document.createElement("DIV");
        var table          = document.createElement("TABLE");
        var thead          = document.createElement("THEAD");
        var col_data       = this.options.data.col_data;

        table_warp_div.className = "jsheet-table-header-warp";
        table.className = "jsheet-table-header";

        table_warp_div.appendChild(table);

        // 그룹 헤더가 존재 할 경우.
        if (this.options.headerGroup) {
            var group_col_th   = document.createElement("TR"),
                col_th         = document.createElement("TR"),
                tmp_group_name = "",
                col_span       = 1;

            // 헤더 데이터 반복문
            for (var idx in col_data) {
                var info     = JSON.parse(col_data[idx]["CHANGE_COLUMN_INFO"]);
                var th_group = document.createElement("TH");
                var th_col   = document.createElement("TH");

                th_col.innerHTML          = col_data[idx]["COMMENT"];
                th_col.dataset.column_seq = col_data[idx]["COLUMN_SEQ"];
                th_col.style.minWidth     = info["WIDTH"] + "px";

                if (info["TYPE"] == "media" && info["WIDTH"] < 165)
                    th_col.style.minWidth = "165px";

                // 그룹인지 아닌지 해당 조건으로 체크
                if (col_data[idx]["GROUP_NO"] == 0)
                { // 그룹이 아닐 경우
                    if (tmp_group_name != "")
                    { // 이전 th가 그룹이었을 경우 이전 그룹의 th를 생성 후 append
                        var _th_group       = document.createElement("TH");
                        _th_group.colSpan   = col_span;
                        _th_group.innerHTML = tmp_group_name;
                        tmp_group_name      = "";
                        group_col_th.appendChild(_th_group);
                    }

                    // 현재 그룹이 아닌 th append
                    th_group.colSpan   = 1;
                    th_group.innerHTML = col_data[idx]["GROUP_NAME"];
                    group_col_th.appendChild(th_group);
                }
                else
                { // 그룹일 경우
                    if (tmp_group_name == "") {
                        // 그룹 네임이 없을 경우 첫 그룹으로 간주
                        col_span       = 1;
                        tmp_group_name = col_data[idx]["GROUP_NAME"];

                    } else if (idx == (col_data.length - 1)) {
                        // 가장 마지막 열 일 경우
                        th_group.colSpan   = (col_span + 1);
                        th_group.innerHTML = tmp_group_name;
                        group_col_th.appendChild(th_group);

                    } else if (tmp_group_name != col_data[idx]["GROUP_NAME"]) {
                        // 그룹명이 달라질 경우 새로운 그룹으로 매핑
                        th_group.colSpan   = col_span;
                        th_group.innerHTML = tmp_group_name;

                        group_col_th.appendChild(th_group);

                        col_span           = 1;
                        tmp_group_name     = col_data[idx]["GROUP_NAME"];
                    } else {
                        // 이전 그룹과 같은 그룹일 경우
                        col_span += 1;
                    }
                }
                // 고정 열의 수의 따라 클래스 부여
                if (this.options.fixedHeader && idx < this.options.fixedCount) {
                    th_group.className = "col-fixed";
                    th_col.className   = "col-fixed";
                    col_th.appendChild(th_col);
                }
                col_th.appendChild(th_col);
            }
            thead.appendChild(group_col_th);
            thead.appendChild(col_th);

            table.appendChild(thead);
        }
        // 그룹 헤더가 없을 경우 else
        table_warp_div.appendChild(table);

        // 고정 헤더(fixed header) 일때
        if (this.options.fixedHeader)
        {
            var c_table  = document.createElement("TABLE"),
                thead    = document.createElement("THEAD"),
                tr_group = document.createElement("TR"),
                tr_col   = document.createElement("TR"),
                fixed_th = $(table).find("th.col-fixed").clone(),
                for_idx  = (fixed_th.length/2);

            c_table.className = "jsheet-table-header-fixed";

            for (var i = 0; i < for_idx; i++) {
                tr_group.appendChild(fixed_th[i]);
                tr_col.appendChild(fixed_th[i+for_idx]);
            }

            thead.appendChild(tr_group);
            thead.appendChild(tr_col);
            c_table.appendChild(thead);
            table_warp_div.appendChild(c_table);
        }

        return table_warp_div;
    };

    /** * ----------------------------------------------------------------------
     * Create Table Body Element / 테이블 바디 생성
     * 입력받은 데이터를 바탕으로 테이블의 헤더를 생성
     * -----------------------------------------------------------------------*/
    Plugin.prototype.createBody  = function() {
        var self                 = this,
            table_warp_div       = document.createElement("DIV"),
            table_warp_body_div  = document.createElement("DIV"),
            table                = document.createElement("TABLE"),
            tbody                = document.createElement("TBODY"),
            r                    = this.options.data.row_data;

        table_warp_div.className = "jsheet-table-body-warp";
        table.className          = "jsheet-table-body";

        // custom - select
        if (this._select)
        {
            var select       = document.createElement("SELECT");
            select.className = "form-control cell-selector";

            for (var o_idx in this._select) {
                var o       = document.createElement("OPTION");
                o.value     = this._select[o_idx]["SEQ"];
                o.innerHTML = this._select[o_idx]["NAME"];

                select.appendChild(o);
            }
        }

        // 행 생성 반복문
        for (var i in r) {
            var tr   = document.createElement("TR");
            var c_d  = r[i]["ROW_LIST"];
            // 열 생성 반복문
            for (var c_i in c_d)
            {
                var td                = document.createElement("TD");
                var info              = JSON.parse(c_d[c_i]["CHANGE_COLUMN_INFO"])

                td.dataset.cglist_seq = c_d[c_i]["CGLIST_SEQ"];
                td.dataset.column_seq = c_d[c_i]["COLUMN_SEQ"];
                td.dataset.type       = info["TYPE"];
                td.dataset.info       = c_d[c_i]["COLUMN_INFO"];
                td.style.minWidth     = info["WIDTH"]+"px";
                td.style.maxWidth     = info["WIDTH"]+"px";
                td.innerHTML          = "";

                // cell draw custom according to type / 타입에 따라 셀 수정 명령 커스터마이징 로직
                switch (info["TYPE"]) {
                    case "member" :
                        try {
                            var m_l = JSON.parse(c_d[c_i]["DATA_INFO"]); //member list
                            var ul = document.createElement("UL");
                            ul.className = "cell-ul";

                            $(m_l).each(function(index, el) {
                                var li                 = document.createElement("LI");
                                li.dataset.task_seq    = el["TASK_SEQ"];
                                li.dataset.member_seq  = el["MEMBER_SEQ"];
                                li.dataset.member_name = el["MEMBER_NAME"];
                                li.innerHTML           = el["MEMBER_NAME"];
                                ul.appendChild(li);
                            });

                            td.appendChild(ul);
                        } catch (e) { }
                        break;
                    case "link" :
                        try
                        {
                            var d             = JSON.parse(c_d[c_i]["DATA"]);
                            var tmp_cell_data = JSON.stringify({"REQ_TYPE" : "FILE_OPEN", "FILE_PATH": d["CELL_DATA"]});
                            var file_path     = d["CELL_DATA"];

                            file_path         = file_path.replace(/\//gi, "\\");
                            d["FILE_PATH"]    = file_path;
                            tmp_cell_data     = encodeURI(tmp_cell_data);

                            if (d["CELL_DATA"] != "")
                            {
                                td.innerHTML      = "&nbsp;&nbsp;<a href =\'"+"cocoa:\/\/"+tmp_cell_data+"' data-info ='"+d["FILE_PATH"]+"\'>LINK</a>";
                            }
                        }
                        catch (e) { }
                        break;
                    case "textarea":
                        try {
                            var inner    = "",
                                t_data   = JSON.parse(c_d[c_i]["DATA_INFO"]),
                                contents = self.getContentsElem(t_data),
                                p        = document.createElement("P");

                            if (contents) {
                                contents.className += " cell-media ";
                                td.appendChild(contents);
                            }
                            p.innerHTML = t_data["CELL_DATA"];
                            td.appendChild(p);
                        } catch (e) { }
                        break;
                    case "select":
                        var s = $(select).clone();
                        s.find("option[value="+c_d[c_i]["DATA_INFO"]+"]").attr("selected", true);
                        $(td).html(s);
                        break;
                    case "media":
                        if (c_d[c_i]["DATA"] != "")
                        {
                            td.style.textAlign = "center";
                            td.innerHTML       = '<img class="cell-media show_media_contents" src="'+static_path+c_d[c_i]["DATA"]+'"'
                                               + ' onerror ="this.src=\'/assets/img/no_image_150x100.gif\';"'
                                               + 'data-data_info=\''+c_d[c_i]["DATA_INFO"]+'\' data-type="cglist">'+'</img>';
                        }
                        if (info["WIDTH"] < 165) {
                            td.style.minWidth = "165px";
                            td.style.maxWidth = "165px";
                        }
                        break;
                    default:
                        td.innerHTML = c_d[c_i]["DATA"];
                }

                if (c_i < parseInt(this.options.fixedCount)) $(td).addClass('fixed-cell');
                if (info["TYPE"] != "text") $(td).addClass('disable');

                tr.appendChild(td);
            }
            tbody.appendChild(tr);
            table.appendChild(tbody);
        }

        // options의 고정열(fixedColumn) 옵션이 TRUE일 경우 fixed column 부여 및 생성
         if (this.options.fixedColumn)
        {
            var c_table  = document.createElement("TABLE"),
                tbody    = document.createElement("TBODY"),
                tr_col   = document.createElement("TR"),
                o_table  = $(table).find("td.fixed-cell"),
                fixed_th = o_table.clone(),
                for_idx  = (fixed_th.length);

            c_table.className = "jsheet-table-body-fixed";

            for (var i = 0; i < for_idx; i++) {
                tr_col.appendChild(fixed_th[i]);
                if (((i+1) % parseInt(this.options.fixedCount)) === 0 )
                {
                    tbody.appendChild(tr_col);
                    tr_col = document.createElement("TR")
                }
            }
            c_table.appendChild(tbody);
            table_warp_div.appendChild(c_table);
        }
        table_warp_div.appendChild(table);

        return table_warp_div;
    };
    /** * ----------------------------------------------------------------------
     * Create ControllerBar Element / 제어창 생성
     * -----------------------------------------------------------------------*/
    Plugin.prototype.createControllerBar = function() {
        var self               = this;
        var controll_bar       = document.createElement("DIV");
        controll_bar.className = "controll-bar";

        var list               = document.createElement("UL");
        list.className         = "controll-bar-list";

        for (var item_index in this.options.controllerBarItem) {

            var item         = this.options.controllerBarItem[item_index];

            var li           = document.createElement("LI");
            var span         = document.createElement("SPAN");

            li.className     = "controll-bar-list-item";
            li.id            = "c-"+item.icon;
            li.dataset.title = item.title;

            span.className   = "glyphicon glyphicon-" + item.icon;

            li.appendChild(span);
            list.appendChild(li);
        }
        controll_bar.appendChild(list);

        return controll_bar;
    };

    /** * ----------------------------------------------------------------------
     * initial event binding / 초기 테이블 생성 후 이벤트 리스너
     * -----------------------------------------------------------------------*/
    Plugin.prototype.setStaticEventListener = function() {
        var self            = this,
            _target         = $(this.element),
            arr_header_cell = $(this.element).find("TH"),
            arr_body_cell   = $(this.element).find("TD");

        // Header & Body Sequencing
        self.cellSequencing(this.element);

        // Cell Event Bind
        self.clearEvent(arr_body_cell, "click");
        $(arr_body_cell).on({
            click       : function ()
            {
                self.setSelectCell(this.id);
            },
            contextmenu : function (evt)
            {
                evt.preventDefault();
                self.contextMenuEvent(evt, this.id);
            },
            dblclick    : function ()
            {
                self.edit(this.id);
            }
        });

        self.setLayoutElem();

        //ControllerBar Buttons Event / 컨트롤바 버튼 이벤트 지정
        if (this.options.controllerBar)
        {
            $("#c-floppy-disk").on("click", function () {
                self.allSave();
            });

            $("#c-pencil").on("click", function () {
                if ($(".selected").length > 0)
                {
                    self.edit($(".selected").attr("id"));
                }
            });

            $("#c-align-left").on("click", function () {
                if ($(".selected").length > 0)
                {
                    $(".selected").css("text-align", "left");
                }
            });

            $("#c-align-center").on("click", function () {
                if ($(".selected").length > 0)
                {
                    $(".selected").css("text-align", "center");
                }
            });

            $("#c-align-right").on("click", function () {
                if ($(".selected").length > 0)
                {
                    $(".selected").css("text-align", "right");
                }
            });

            $("#c-tasks").on("click", function () {
                if ($(".selected").length > 0)
                {
                    self.detailView($(".selected"), "open");
                }
            });

            $("#c-plus-sign").on("click", function () {
                if ($(".selected").length > 0) {
                    self.rowController($(".selected"), 1);
                }
                else {
                    self.rowController($("TD:last"), 1);
                }
            });

            $("#c-question-sign").on({
                mousedown: function () {
                    var div = document.createElement("DIV");
                    div.className = "div-helper-key";

                    var inner_html =
                     '<div class="helper-key">'
                    +'  <table class="table helper-key-table">'
                    +'      <thead>'
                    +'          <tr>'
                    +'              <th>기능</th>'
                    +'              <th>단축키</th>'
                    +'          </tr>'
                    +'      </thead>'
                    +'      <tbody>'
                    +'          <tr>'
                    +'              <td>창 닫기</td>'
                    +'              <td>ESC</td>'
                    +'          </tr>'
                    +'          <tr>'
                    +'              <td>자세히 보기</td>'
                    +'              <td>F1</td>'
                    +'          </tr>'
                    +'          <tr>'
                    +'              <td>행 수정</td>'
                    +'              <td>F2</td>'
                    +'          </tr>'
                    +'          <tr>'
                    +'              <td>전체 저장</td>'
                    +'              <td>Ctrl + S</td>'
                    +'          </tr>'
                    +'      </tbody>'
                    +'  </table>'
                    +'</div>';
                    div.innerHTML = inner_html;
                    $("body").append(div);
                },
                mouseup: function () {
                    $(".div-helper-key").remove();
                }
            })
        }

        // Key Binding Event (window) / 키 이벤트
        self.setKeyEvent();

        $(window).on("click", function () {
            self.closeContextMenu();
        });

        // Tooltip Event / 툴팁 이벤트
        $(".controll-bar-list-item")
            .mouseenter( function (event) {
                if ($(".b_tooltip").length > 0)
                {
                    $(".b_tooltip").remove();
                }

                var title = $(this).data("title");

                if ( typeof(title) != "undefined" )
                {
                    if ($(".b_tooltip").length == 0)
                    {
                        var tooltip = document.createElement( "DIV" );
                        tooltip.className = "b_tooltip";
                        $("body").append(tooltip);
                    }
                    var target = $(event.target).offset();
                    var target_height = $(event.target).outerHeight();

                    setTimeout(function()
                    {
                        if ($(".b_tooltip").css("display") == "block") $(".b_tooltip").hide();
                        $(".b_tooltip")
                            .css("left", (target.left))
                            .css("top", (target.top+target_height))
                            .html(title)
                            .fadeIn();
                    }, 10);
                }
            })
            .mouseleave( function (event) {
                if ($(".b_tooltip").length > 0)
                {
                    $(".b_tooltip").remove();
                }
            });
    };

    /** * ----------------------------------------------------------------------
    * Configure page part UI and grant event in layout / 레이아웃 메뉴 페이지 부분 구성 및 이벤트 지정
    * -----------------------------------------------------------------------*/
    Plugin.prototype.setLayoutElem = function(element, evt) {
        var self        = this;
        var col_length  = filter_colHeaders.length;
        var layout_html = "";

        layout_html += '<item class="nav-top line"></item>';
        layout_html += '<item class="nav-top title" id="project_title"><p>'+project_dao["PROJECT_NAME"]+'</p></item>';
        layout_html += '<item class="nav-top right">';
        layout_html += '    <button class="btn btn-sm btn-success" id="excel_import" type="button" name="button"><span class="glyphicon glyphicon-upload" aria-hidden="true"></span>&nbsp;Import</button>&nbsp;';
        layout_html += '    <button class="btn btn-sm btn-info" id="excel_export" type="button" name="button"><span class="glyphicon glyphicon-download" aria-hidden="true"></span>&nbsp;Export</button>';
        layout_html += '    <form class="form-inline" onsubmit="return false;">';
        layout_html += '        <div class="form-group">';
        layout_html += '            <select class="form-control input-sm" name="nav_select" id="nav_select">';
        layout_html += '                <option value="">컬럼 선택</option>';
        layout_html += '                <option value="99">TASK</option>';

        for (var i = 0; i < col_length; i++) {
            layout_html += '<option value="'+colHeader[i]["COLUMN_SEQ"]+'">'+colHeader[i]["COLUMN_NAME"]+'</option>';
        }

        layout_html += '            </select>';
        layout_html += '            <div class="input-group">';
        layout_html += '                <input class="form-control input-sm" id="nav_search" type="text" name="nav_search" placeholder="search..">';
        layout_html += '                <span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span>';
        layout_html += '            </div>';
        layout_html += '        </div>';
        layout_html += '    </form>';
        layout_html += '</item>';

        $("body > nav > div.nav-top-body > list").append(layout_html);

        return (function ()
        {
            // set layout event
            window.LayoutModule.init();

            //set layout layer
            window.createLayerForTable.create({type: "selector", id: "status_selector"});

            $("#excel_import").off("click").on("click", function () {
                self.excelImport();
            });

            $("#excel_export").off("click").on("click", function () {
                self.excelExport();
            });

            //set search for jsheet
            $("item").find("form").submit(function( event ) {
                event.preventDefault();

                var filter_data =
                {
                    filter_column: $(this).find("#nav_select").val(),
                    filter_value: $(this).find("#nav_search").val()
                };

                self.func("filter", filter_data);
            });

            $("span.input-group-addon").off("click").on("click", function () {
                var filter_data =
                {
                    filter_column: $(this).parents("form").find("#nav_select").val(),
                    filter_value: $(this).parents("form").find("#nav_search").val()
                };
                self.func("filter", filter_data);
            });
        })();
    };

    /** * ----------------------------------------------------------------------
    * Excel Import / 엑셀 가져오기
    * -----------------------------------------------------------------------*/
    Plugin.prototype.excelImport = function() {
        var self = this;

        if ($("container").find("input#excel_import").length == 0)
        {
            var file_input = document.createElement("input");
            $(file_input)
                .prop(     "name",  "excel_import")
                .prop(       "id",  "excel_import")
                .attr(     "type",  "file")
                .css(   "display",  "none");

            $(file_input).change(function () {
                var project_seq  = self.getUrlParams("project_seq");
                // var project_seq = $(this).jexcel('getUrlParams', "project_seq");
                var excelObject = $(this)[0].files[0];

                if( confirm('Excel File을 업로드 하시겠습니까?')){
                     var formData = new FormData();

                     formData.append('project_seq', project_seq);
                     formData.append('import_excel', excelObject);

                     $( this ).val(''); // 업로드 폼 초기화

                     $.ajax({
                          url        : '/works/cglist/excel_import',
                          data       : formData,
                          processData: false,
                          contentType: false,
                          dataType   : "json",
                          type       : 'POST',
                          success: function(data){
                               if( data.result )
                               {
                                    alert('엑셀 가져오기가 완료되었습니다\n화면을 갱신합니다');
                                    window.location.reload(true);
                                    /*
                                    if( confirm('시트가 새로 등록되었습니다.\n새로운 시트를 적용하시겠습니까?') )
                                    {
                                        var paramObj = new Object();
                                        paramObj.project_seq = project_seq;
                                        paramObj.sheet_seq = data.next_sheet_seq;

                                        $.ajax({
                                             url: "/works/cglist/sheet_change",
                                             method: "POST",
                                             data: paramObj,
                                             dataType: "json",
                                             success: function(e){
                                                  if( e.result ) {
                                                       alert('CG List 시트가 변경되었습니다\n화면을 갱신합니다');
                                                       window.location.reload(true);
                                                  } else {
                                                       alert('요청이 올바로 처리되지 않았습니다.\n다시 시도해주세요');
                                                  }
                                             }
                                        });
                                    }
                                    */
                               }
                          },
                          error: function(e){
                              alert('장애가 발생하였습니다\n개발팀에 문의해주세요.\n');
                          }
                     });
                }
            });
            $("container").append(file_input);
        }
        $("container").find("#excel_import").click();
    };

    /** * ----------------------------------------------------------------------
    * Excel Export / 엑셀 내보내기
    * -----------------------------------------------------------------------*/
    Plugin.prototype.excelExport = function() {
        var project_seq       = this.getUrlParams("project_seq");
        var export_cglist_arr = [];

        $(".jsheet-table-body > tbody > tr").each(function(index, el) {
            if ($(el).css("display") != "none")
            {
                export_cglist_arr.push($(el).find( "td" ).last().data("cglist_seq"));
            }
        });

        var form = document.createElement( "form" );
        form.setAttribute('method', "post");
        form.setAttribute('action', "/works/cglist/excel_export?project_seq="+project_seq);

        var value = document.createElement("input"); //input element, Submit button
        value.setAttribute('type', "text");
        value.name = "json_cglist_seq_list";
        value.setAttribute('value', JSON.stringify(export_cglist_arr));

        form.appendChild(value);
        document.body.appendChild(form);

        form.submit();
    };

    /** * ----------------------------------------------------------------------
    * Cell Filter / 셀 필터링(검색)
    * -----------------------------------------------------------------------*/
    Plugin.prototype.filter = function(filter_data) {
        var tr_index = [];
        if (filter_data["filter_column"] == "" || filter_data["filter_value"] == "")
        // 빈값일 때는 테이블 노 필터링
        {
            $(".jsheet-table-body").find("TR").removeClass("hide").show();
            $(".jsheet-table-body-fixed").find("TR").removeClass("hide").show();
        }
        else
        // 값이 있을 때는 테이블 필터링
        {
            // matching
            var reg_string = new RegExp(filter_data["filter_value"], "g");

            if (filter_data["filter_column"] == 99)
            {
                var col_matched_td_arr = $(
                    "td[data-column_seq='46'],"+
                    "td[data-column_seq='47'],"+
                    "td[data-column_seq='48'],"+
                    "td[data-column_seq='49'],"+
                    "td[data-column_seq='50'],"+
                    "td[data-column_seq='51'],"+
                    "td[data-column_seq='52']"
                ).not(".fixed-cell");
            }
            else
            {
                var col_matched_td_arr = $("td[data-column_seq='"+filter_data["filter_column"]+"']").not(".fixed-cell");
            }

            col_matched_td_arr.each(function(index, el) {
                if ($(el).text().match(reg_string))
                // 일치되는 행의 인덱스 가져오기
                {
                    tr_index.push($(el).parents("tr").index());
                }
                else
                // 일치되지 않는 행에 "hide" 클래스 추가
                {
                    $(el).parents("tr").addClass('hide');
                }
            });

            tr_index = jQuery.unique( tr_index );

            if (tr_index.length > 0)
            {
                // 전체 행 숨김
                var o_tr = $(".jsheet-table-body").find("TR").hide();
                var c_tr = $(".jsheet-table-body-fixed").find("TR").hide();

                // 데이터와 일치되는 행 보여주기
                for (var i = 0; i < tr_index.length; i++) {
                    var o_s_t = o_tr.get(tr_index[i]);
                    $(o_s_t).removeClass("hide").show();

                    var c_s_t = c_tr.get(tr_index[i]);
                    $(c_s_t).removeClass("hide").show();
                }
            }
            else
            {
                alert("일치하는 검색어가 없습니다.");
                $(".jsheet-table-body").find("TR").show();
                $(".jsheet-table-body-fixed").find("TR").show();
            }
        }
    };

    /** * ----------------------------------------------------------------------
     * remove event of element / 엘리먼트에 부여된 이벤트 제거
     * @param {object} element
     * @param {event} evt
     *
     * @return {function} Return event off
     * -----------------------------------------------------------------------*/
    Plugin.prototype.clearEvent = function(element, evt) {
        return $(element).off(evt);
    };

    /** * ----------------------------------------------------------------------
     * Table indexing / 테이블 인덱스 부여
     * @param {object} element
     * -----------------------------------------------------------------------*/
    Plugin.prototype.cellSequencing = function(element) {
        var fixed_td         = $(".jsheet-table-body-fixed").find("TD"),
            origin_td        = $(".jsheet-table-body").find("TD").not(".fixed-cell"),
            col_length       = ($(".jsheet-table-body").find("TR:first > TD").length - this.options.fixedCount),
            fixed_row_count  = 0,
            fixed_col_count  = 0,
            origin_row_count = 0,
            origin_col_count = this.options.fixedCount;

        // set length to this plugin golbal variable
        this.options.col_length = col_length;
        this.options.row_length = $(".jsheet-table-body").find("TR").length;

        for (var i = 0; i < fixed_td.length; i++)
        {
            var disable = $(fixed_td[i]).hasClass('disable');
            $(fixed_td[i]).removeClass();
            $(fixed_td[i]).addClass('r'+fixed_row_count);
            $(fixed_td[i]).addClass('c'+fixed_col_count);
            $(fixed_td[i]).prop("id", "r"+fixed_row_count+"_c"+fixed_col_count);

            fixed_col_count++;
            if ((i % parseInt(this.options.fixedCount)) == (parseInt(this.options.fixedCount) - 1))
            {
                fixed_col_count = 0;
                fixed_row_count++;
            }
            if (disable)
            {
                $(fixed_td[i]).addClass('disable');
            }
        }

        for (var i = 0; i < origin_td.length; i++)
        {
            $(origin_td[i]).addClass('r'+origin_row_count);
            $(origin_td[i]).addClass('c'+origin_col_count);
            $(origin_td[i]).prop("id", "r"+origin_row_count+"_c"+origin_col_count);

            origin_col_count++;
            if ((i%col_length) == (col_length-1))
            {
                origin_col_count = this.options.fixedCount;
                origin_row_count++;
            }
        }
    };

    /** * ----------------------------------------------------------------------
    * key event bind to table / 테이블에 키 이벤트 부여
    * -----------------------------------------------------------------------*/
    Plugin.prototype.setKeyEvent = function() {
        var self = this;

        $(window).keydown(function (key) {
            if ($(".selected").length > 0)
            {
                switch (key.keyCode)
                {
                    case 37:    // arrow left / 방향키 : 왼쪽
                        if ($(".jsheet-text").length == 0)
                        {
                            key.preventDefault();

                            var _id = $(".selected").attr("id").split("_");
                            var col_idx = _id[1].replace("c", "");
                            if (col_idx != 0)
                            {
                                self.setSelectCell(_id[0]+"_c"+(parseInt(col_idx)-1));
                            }
                        }
                        break;
                    case 39:    // arrow right / 방향키 : 오른쪽
                        if ($(".jsheet-text").length == 0)
                        {
                            key.preventDefault();

                            var _id = $(".selected").attr("id").split("_");
                            var col_idx = parseInt(_id[1].replace("c", ""));

                            if (col_idx < ((self.options.col_length+self.options.fixedCount)-1))
                            {
                                self.setSelectCell(_id[0]+"_c"+(col_idx+1));
                            }
                        }
                        break;
                    case 38:    // arrow top / 방향키 : 위
                            if ($(".jsheet-text").length == 0)
                            {
                                key.preventDefault();
                                var next_cell = $(".selected")
                                    .closest("TR")
                                    .prevAll()
                                    .not(".hide")
                                    .first()
                                    .find("TD")
                                    .get($(".selected").index());
                                if (next_cell)
                                {
                                    self.setSelectCell(next_cell.id);
                                }
                            }
                            break;
                        case 40:    // arrow bottom / 방향키 : 아래
                            if ($(".jsheet-text").length == 0)
                            {
                                key.preventDefault();
                                var next_cell = $(".selected")
                                    .closest("TR")
                                    .nextAll()
                                    .not(".hide")
                                    .first()
                                    .find("TD")
                                    .get($(".selected").index());

                                if (next_cell)
                                {
                                    self.setSelectCell(next_cell.id);
                                }
                            }
                            break;
                        case 112:    // F1
                            if ($(".selected").length > 0)
                            {
                                window.onhelp = function () { return false; };
                                key.preventDefault();
                                self.detailView($(".selected"), "open");
                            }
                            break;
                        case 113:    // F2
                            if ($(".jsheet-text").length > 0) return false;

                            key.preventDefault();
                            self.edit($(".selected").attr("id"));
                            break;
                        case 13:    // ctrl + enter
                            if (key.ctrlKey)
                            {
                                if ($(".jsheet-text").length > 0)
                                {
                                    key.preventDefault();
                                    self.save($(".selected").attr("id"));
                                }
                            }
                            break;
                        case 83:    // ctrl + s
                            if (key.ctrlKey)
                            {
                                key.preventDefault();
                                self.allSave();
                            }
                            break;
                        case 90:    // ctrl + z
                            if (key.ctrlKey)
                            {
                                key.preventDefault();
                                self.undo();
                            }
                            break;
                        case 27:    // ESC
                            self.closeCI();
                            break;
                        case 46:    // DELETE
                                if ($(".jsheet-text").length == 0)
                                {
                                    self.empty($(".selected").attr("id"));
                                }
                            break;
                }
            }
        });
    };

    /** * ----------------------------------------------------------------------
     * Enter history in history
     * @param {array} data
     * @return {function} array.push
     * -----------------------------------------------------------------------*/
    Plugin.prototype.historyPush = function(data) {
        return this.options.history.push(data);
    };

    /** * ----------------------------------------------------------------------
     * Output history to jsheet selected cell
     * @return {function} cell data rollback / 셀 데이터 복원
     * -----------------------------------------------------------------------*/
    Plugin.prototype.historyPop = function() {
        if (this.options.history.length > 0)
        {
            try {
                var rollback = this.options.history.pop();
                $("#"+rollback.cell).html(JSON.parse(rollback.data).replace(/\n/g, "<br>"));
                // $("#"+rollback.cell).html(JSON.parse(rollback.data));
            } catch (e) { }
        }
    };

    /** * ----------------------------------------------------------------------
     * Cancel cell operation / 셀 작업 취소
     * @return {void} void
     * -----------------------------------------------------------------------*/
    Plugin.prototype.cancel = function() {
        try {
            var ori_val =  JSON.parse($(".jsheet-text").attr("data-ori-text"));

            $(".edition")
               .html(ori_val.replace(/\n/g, "<br>"))
               .removeClass('edition');
            return ;
        } catch (e) { }
    };

    Plugin.prototype.undo = function() {
        //history pop
        this.func("historyPop");
    };

    /** * ----------------------------------------------------------------------
     * Synchronize the size of the top row of the current cell / 현재 셀 기준, 행 크기 동기화
     * @return {void} void
     * -----------------------------------------------------------------------*/
    Plugin.prototype.trVerticalSizeSync = function(cell) {
        if (cell)
        {
            var height = cell.outerHeight(),

                origin = $(".jsheet-table-body > tbody > tr")
                .get(cell.closest("TR").index()),

                clone = $(".jsheet-table-body-fixed > tbody > tr")
                .get(cell.closest("TR").index());

            $(origin).height(height);
            $(clone).height(height);
        }
        return ;
    };

    /** * ----------------------------------------------------------------------
     * Empty cell / 셀 비우기
     * -----------------------------------------------------------------------*/
    Plugin.prototype.empty = function(cell_id) {
        if (!cell_id) return false;

        var s_cell = $("TD#"+cell_id);

        if (!s_cell.hasClass('disable'))
        {
            // var undo_data = JSON.stringify(s_cell.html().replace(/\n/g, "<br>"));
            var undo_data = JSON.stringify(s_cell.html());
            s_cell.html("");
        }

        //history push
        if (undo_data)
        {
            this.func("historyPush", {
                cell : cell_id,
                data : undo_data,
            });
        };

        // 저장 시 현재 셀의 Tr height를 타 테이블에 적용
        return this.func("trVerticalSizeSync", s_cell);
    };

    /** * ----------------------------------------------------------------------
     * Save cell(TEXTAREA => CELL) / 텍스트의 내용을 셀에 저장
     * -----------------------------------------------------------------------*/
    Plugin.prototype.save = function(cell_id, text_val) {
        if ($(".edition").length == 0) return false;

        var s_cell = $("TD#"+cell_id);

        // 텍스트 박스의 내용을 셀로 이동
        if (!s_cell.hasClass('disable'))
        {
            text_val      = $(".jsheet-text").val().replace(/\n/g, "<br>");
            var undo_data = $(".jsheet-text").attr("data-ori-text").replace(/\n/g, "<br>");

            $(s_cell).html(text_val).removeClass('edition');
        }

        //history push / 히스토리 추가
        if (undo_data)
        {
            this.func("historyPush", {
                cell : cell_id,
                data : undo_data,
            });
        };

        //텍스트 변경 시 컨트롤바에 수정됨 표시
        this.textUpdated(true);

        // 저장 시 현재 셀의 Tr height를 타 테이블에 적용
        return this.func("trVerticalSizeSync", s_cell);
    };

    /** * ----------------------------------------------------------------------
    * make layer foundation(Wrap & Dim) / 팝업 기본 골격 구성
    * @return {boolean} Return layer append result
    * -----------------------------------------------------------------------*/
    Plugin.prototype.isSetLayer2Body = function(inner_html, s_cell) {
        if (typeof(s_cell) == "undefined") { s_cell = null; }

        // init layer
        $(".jsheet-dimmed").remove();

        var dim         = document.createElement("DIV"),
            layer       = document.createElement("DIV");

        // create layer - dim
        dim.className   = "jsheet-dimmed";
        dim.onclick     = function() {
            $(this).remove();
        };

        // create basic layer
        layer.className = "jsheet-layer";
        layer.onclick   = function(event) { event.stopPropagation(); };

        try { // bind data to layer
            layer.dataset.info       = JSON.stringify(s_cell.data("info"));
            layer.dataset.cglist_seq = s_cell.data("cglist_seq");
            layer.dataset.column_seq = s_cell.data("column_seq");
        } catch (e) {
            layer.dataset.info       = "";
            layer.dataset.cglist_seq = "";
            layer.dataset.column_seq = "";
        }

        if (s_cell.hasOwnProperty("cglist_seq"))
        {
            layer.dataset.cglist_seq = s_cell.cglist_seq;
        }

        $(layer).html(inner_html);
        $(dim).html(layer);

        $("body").append(dim);

        return ($(".jsheet-dimmed").length == 1);
     }

    Plugin.prototype.detailMsgEditor = function(info) {
        var self = this;

        var html =
         '<div class="panel panel-default">'
        +'  <div class="panel-heading">File &amp; Text Editor</div>'
        +'  <div class="panel-body">'
        +'      <form>'
        +'          <div class="form-group">'
        +'              <img id="layer-editor-img" src="/assets/img/no_image_150x100.gif" style="width: 150px; height: 100px;">'
        +'          </div>'
        +'          <div class="form-group">'
        +'              <input class="layer-editor-file" type="file" name="image_upload_input" id="layer-editor-file">'
        +'          </div>'
        +'          <div class="form-group">'
        +'              <textarea class="form-control vresize" rows="5" name="comment" id="layer-editor-text"></textarea>'
        +'          </div>'
        +'          <div class="form-group">'
        +'              <a class="btn btn-danger pull-left" id="layer-editor-cancel">취소</a>'
        +'              <a class="btn btn-info pull-right" id="layer-editor-submit">입력</a>'
        +'          </div>'
        +'      </form>'
        +'</div></div>';
        if (this.isSetLayer2Body(html, info))
        {
            $("#layer-editor-file").on('change', function () {
                if (typeof (FileReader) != "undefined")
                {
                    // var image_holder = $("#editor_img");
                    var reader = new FileReader();
                    reader.onload = function (e)
                    {
                        $("#layer-editor-img").attr("src", e.target.result);
                    }
                    reader.readAsDataURL($(this)[0].files[0]);
                }
                else
                {
                    alert("해당 브라우저는 현재 기능을 지원하지 않습니다.");
                }
            });

            $("#layer-editor-cancel").on("click", function () {
                self.closeLayer();
            });

            $("#layer-editor-submit").on("click", function () {
                var imageObject = $("#layer-editor-file").get(0).files[0];
                var contents    = $("#layer-editor-text").val();

                if (typeof(imageObject) == "undefined" && contents == "")
                {
                    alert("값이 입력되지 않았습니다. 확인해주세요.");
                    return false;
                }
                 else
                {
                    var form_data = new FormData();
                    form_data.append('contents', contents);

                    if (typeof(imageObject) != "undefined")
                    {
                        form_data.append('media_file', imageObject);
                    }

                    self.closeLayer();
                    self.sendMessage(info.tab, form_data);
                }
            });
        }
    }

    Plugin.prototype.editFileText = function(s_cell) {
        var self = this;

        var html =
         '<div class="panel panel-default">'
        +'  <div class="panel-heading">File &amp; Text Editor</div>'
        +'  <div class="panel-body">'
        +'      <form>'
        +'          <div class="form-group">'
        +'              <img id="layer-editor-img" src="/assets/img/no_image_150x100.gif" style="width: 150px; height: 100px;">'
        +'          </div>'
        +'          <div class="form-group">'
        +'              <input class="layer-editor-file" type="file" name="image_upload_input" id="layer-editor-file">'
        +'          </div>'
        +'          <div class="form-group">'
        +'              <textarea class="form-control vresize" rows="5" name="comment" id="layer-editor-text"></textarea>'
        +'              <label class="checkbox-inline"><input type="checkbox" name="img_rm_chkbox" id="layer-editor-img-rm" value="">기존 이미지 삭제</label>'
        +'          </div>'
        +'          <div class="form-group">'
        +'              <a class="btn btn-danger pull-left" id="layer-editor-cancel">취소</a>'
        +'              <a class="btn btn-info pull-right" id="layer-editor-submit">입력</a>'
        +'          </div>'
        +'      </form>'
        +'</div></div>';

        if (this.isSetLayer2Body(html, s_cell))
        {
            return (function ()
            { // Defining Events with Immediately Pattern / 이벤트 즉시실행 패턴으로 정의
                // layer init
                if (typeof(s_cell.find("p").html()) != "undefined")
                {
                    var text = s_cell.find("p").html().replace(/\<br\>/g, "\n") .replace(/\<br \/\>/g, "\n");
                    $("#layer-editor-text").val(text);
                }
                if (s_cell.find("img").length > 0)
                {
                    var src = s_cell.find("img").attr("src");
                    $("#layer-editor-img").attr("src", src);
                }

                $("#layer-editor-file").on('change', function () {
                    if (typeof (FileReader) != "undefined")
                    {
                        var image_holder = $("#layer-editor-img");
                        var reader = new FileReader();
                        reader.onload = function (e)
                        {
                            image_holder.attr("src", e.target.result);
                        }
                        reader.readAsDataURL($(this)[0].files[0]);
                    }
                    else
                    {
                        alert("해당 브라우저는 현재 기능을 지원하지 않습니다.");
                    }
                });

                $("#layer-editor-cancel").on("click", function () {
                    self.closeLayer();
                });

                $("#layer-editor-submit").on("click", function () {
                    var _data  = $( ".jsheet-layer" ).data();
                    var _form  = $( ".jsheet-layer" ).find( "form" );

                    if (_form.find("textarea").val() == "" && _form.find("input").val() == "")
                    {
                        // 빈값 밸리데이션
                        // alert("이미지 또는 내용이 입력되지 않았습니다."); return ;
                    }
                    if (confirm("해당 내용을 저장하시겠습니까?") == false) { return ; }

                    var form_data = new FormData();
                    var img_object = _form.find( "input" ).get(0).files[0];

                    if (typeof(img_object) != "undefined" )
                    {
                        form_data.append('media_file', img_object);
                    }

                    form_data.append('project_seq', self.getUrlParams("project_seq"));
                    form_data.append('cglist_seq',  _data["cglist_seq"]);
                    form_data.append('column_seq',  _data["column_seq"]);
                    form_data.append('cell_data',   _form.find("textarea").val().replace(/\n/g, "<br />"));

                    //이미지 삭제 체크 버튼 활성화 되어있을 때 && 이미지가 업로드 안되었을 때만
                    if (_form.find("#layer-editor-img-rm").prop("checked") &&
                        (typeof(img_object) == "undefined" || img_object == null) )
                    {
                        form_data.append('file_delete_yn', "Y");
                        var s_cell = $('TD[data-cglist_seq="'
                                          + $(".jsheet-layer").data("cglist_seq")
                                      +'"][data-column_seq="'
                                          + $(".jsheet-layer").data("column_seq")+'"]');
                        if (s_cell)
                        {
                            console.log(s_cell.find("img"));
                            s_cell.find("img").remove();
                        }
                    }

                    var loader_options = {
                        target        : ".panel-heading",
                        type          : "inner",
                        spin_second   : "0.5s",
                        width         : "10px",
                        height        : "10px",
                        loader_margin : "0px 10px 0px 0px"
                    };

                    return self.func("ajax", {
                        url            : "/works/cglist/cell_save_process",
                        func           : "cellDataCI",
                        data           : form_data,
                        loader_options : loader_options,
                        target         : {cglist_seq : _data["cglist_seq"], column_seq: _data["column_seq"]},
                        type_code      : 0,
                    });
                });
            })();
        }
        return ;
     }

     /** * ----------------------------------------------------------------------
      * Control AJAX result data and bind data to selected cell
      * AJAX 결과 데이터를 제어하고 선택된 셀에 데이터 바인드
      * @param {array} result
      * @return {function} Return trVerticalSizeSync()
      * -----------------------------------------------------------------------*/
    Plugin.prototype.cellDataCI = function(result) {
        if (result["result"] == false) return false;

        var self   = this;
        var s_cell = $('TD[data-cglist_seq="'
                          + result["info"]["target"]["cglist_seq"]
                      +'"][data-column_seq="'
                          + result["info"]["target"]["column_seq"]+'"]');

        // selected cell check / 선택된 셀이 있는지 체크
        if (s_cell.length == 0) return false;

        // textarea edit event
        if (result["info"]["type_code"] == 0)
        {
            var p       = document.createElement("P");
            p.innerHTML = result["cell_data"]["CELL_DATA"];
            var c       = self.getContentsElem(result["cell_data"]);

            if (c) c.className = "cell-media show_media_contents";

            s_cell.html("").append(c).append(p);
        }
        // image edit event
        else if (result["info"]["type_code"] == 1)
        {
            var data = { IMG_INFO: JSON.parse(result["files_dao"]) };
            var c    = self.getContentsElem(data);
            if (c)
            {
                c.className = "cell-media show_media_contents";
                s_cell.html(c);
            }
        }
        // link edit event
        else if (result["info"]["type_code"] == 2)
        {
            var t_d       = "", // temp data
                p         = {   // temp path
                    REQ_TYPE  : "FILE_OPEN",
                    FILE_PATH : result["cell_data"]["CELL_DATA"].replace(/\//gi, "\\"),
                },
                a          = document.createElement("A");

            t_d            = JSON.stringify(p)
            t_d            = encodeURI(t_d);

            a.href         = "cocoa:\/\/"+t_d;
            a.innerHTML    = "LINK";
            a.dataset.info = result["cell_data"]["CELL_DATA"];

            s_cell.html("");
            if (result["cell_data"]["CELL_DATA"] != "")
            {
                s_cell.append("&nbsp;&nbsp;").append(a);
            }
        }
        // task member event
        else if (result["info"]["type_code"] == 3)
        {
            var ul = document.createElement("UL");
            ul.className = "cell-ul";
            $(result["MEMBER_TASK_LIST"]).each(function(index, el) {
                var li                 = document.createElement("LI");
                li.dataset.task_seq    = el["TASK_SEQ"];
                li.dataset.member_seq  = el["MEMBER_SEQ"];
                li.dataset.member_name = el["MEMBER_NAME"];
                li.innerHTML           = el["MEMBER_NAME"];
                ul.appendChild(li);
            });
            s_cell.html(ul);
        }
        self.closeLayer();

        if ( 'Netscape' == navigator.appName  &&
             -1         != navigator.userAgent.search('Trident') )
        {
            window.mediaView.init();
        }

        // 저장 시 현재 셀의 Tr height를 타 테이블에 적용
        return this.func("trVerticalSizeSync", s_cell);
    }

    /** * ----------------------------------------------------------------------
     * create img element for mediaview
     * 미디어 뷰어에 맞는 이미지 엘리먼트를 생성 후 반환
     * @param {object} _data
     * @param {bollean} thumb
     * @return {element} IMG
     * -----------------------------------------------------------------------*/
    Plugin.prototype.getContentsElem = function(_data, thumb)
    {
        var img = document.createElement("img");

        if( _data.hasOwnProperty("IMG_INFO") || _data["IMG_INFO"] == "" )
        {
            var img_data     = _data["IMG_INFO"];
            img.dataset.data_info = JSON.stringify(img_data);

            if (img.dataset.data_info == "[]" || img.dataset.data_info == "null")
            {
                return document.createElement("SPAN");
            }

            img.dataset.type      = "cglist";
            img.className         = "show_media_contents";
            img.onerror           = function ()
            {
                this.src = "/assets/img/no_image_150x100.gif";
            }
            if (typeof(img_data["THUMB_INFO"]) != "undefined" && thumb) {
                img.src = static_path + img_data["THUMB_INFO"]["FILE_PATH"];
            }
            else {
                img.src = static_path + img_data["FILE_PATH"]+img_data["FILE_NAME"];
            }
        }
        else
        {
            img.src = "/assets/img/no_image_150x100.gif";
            img.className    = "image_none";
        }
        return img;
    }

    /** * ----------------------------------------------------------------------
     * Return requested parameters from url / url에서 원하는 파라미터 반환
     * @param {string} name
     * @return {param} string
     * -----------------------------------------------------------------------*/
    Plugin.prototype.getUrlParams = function(name) {
        if (this.project_seq)
        {
            return this.project_seq;
        }

        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        if (results) {
            this.project_seq = results[1];
            return results[1] || 0;
        }
    }

    Plugin.prototype.closeLayer = function() {
        if ($(".jsheet-dimmed").length > 0)
        {
            $(".jsheet-dimmed").remove();
        }
    }

    Plugin.prototype.editTaskMember = function(s_cell) {

        var self          = this,
            info          = s_cell.data("info"),
            team_seq_list = info["TEAM_SEQ_LIST"];

        var form_data =
        {
            "project_seq"   : self.getUrlParams("project_seq"),
            "cglist_seq"    : s_cell.data("cglist_seq"),
            "column_seq"    : s_cell.data("column_seq"),
            "team_seq_list" : team_seq_list,
        };

        var loader_options = {
            target        : ".controll-bar-list",
            type          : "inner",
            float         : "right",
            spin_second   : "0.5s",
            width         : "36px",
            height        : "36px",
            loader_margin : "0px 10px 0px 15px"
        };

        return self.func("ajax", {
            url            : "/works/cglist/task_member_list",
            func           : "setMemberList2TaskLayer",
            data           : form_data,
            loader_options : loader_options,
            target         : {cglist_seq : s_cell.data("cglist_seq"), column_seq: s_cell.data("column_seq")},
        });
    }

    Plugin.prototype.setMemberList2TaskLayer = function(result) {
        if (result == null) return false;

        var self   = this;
        var s_cell = $('TD[data-cglist_seq ="'
                          + result["info"]["target"]["cglist_seq"]
                      +'"][data-column_seq="'
                          + result["info"]["target"]["column_seq"]+'"]');

        if (s_cell.length == 0) return false;

        var html =
         '<div class="panel panel-default">'
        +'  <div class="panel-heading">'
        +'      <h4 class="panel-title" class="task-layer-title" >프로젝트 참여 회원 지정<span class="task-this-scene"></span></h4>'
        +'  </div>'
        +'  <div class="panel-body">'
        +'      <table class="table">'
        +'          <thead style="border:2px solid #DDDDDD;">'
        +'              <tr>'
        +'                  <th>선택</th>'
        +'                  <th>팀</th>'
        +'                  <th>회원 이름(직책)</th>'
        +'              </tr>'
        +'          </thead>'
        +'          <tbody id="task-layer-tbody" ></tbody>'
        +'      </table>'
        +'  </div>'
        +'  <div class="panel-footer" style="text-align: right;border: 1px;">'
        +'      <a class="btn-member-save btn btn-info" id="btn-member-save">저장</a>'
        +'      <a class="btn-member-cancel btn btn-danger" id="btn-member-cancel" style="float: left;">닫기</a>'
        +'  </div>'
        +'</div>';
        if (this.isSetLayer2Body(html, s_cell))
        {
            return (function ()
            { // Defining Events with Immediately Pattern / 이벤트 즉시실행 패턴으로 정의
                (function () { // layer init
                    // Render table elements of task member layer / 업무 회원 팝업의 테이블 요소 렌더링
                    var inner_html = "";
                    $(result).each(function(index, el)
                    {
                        if (el.hasOwnProperty('TASK_SEQ') == false)
                        {
                            var checked    = "";
                            el["TASK_SEQ"] = '';
                        }
                        else
                        {
                            var checked = "checked='true' ";
                        }

                        inner_html +=
                           "<tr>"
                         + "    <td class='mem_check'>"
                         + "    <input class='mem_chk_box' type='checkbox' "+checked
                         + "         data-task_seq='"+el["TASK_SEQ"]+"' value='"+el["SEQ"]+"'"
                         + "         data-name='"+el["NAME"]+"'></td>"
                         + "    <td>"+el["TEAM_NAME"]+"</td>"
                         + "    <td>"+el["NAME"]+"("+el["TITLE_NAME"]+")</td>"
                         + "</tr>";
                    });
                    $("#task-layer-tbody").html(inner_html);
                })();

                //check box toggle logic
                $(".mem_check").parents("tr").on("click", function (e) {
                    e.stopImmediatePropagation();
                    e.stopPropagation();

                    //체크박스 상태 확인 후 checked or unchecked로 상태 변환
                    $(this).find("input[type='checkbox']").prop('checked',function(){
                        return !$(this).prop('checked');
                    });
                });
                $(".mem_chk_box").on("click", function (e) {
                    e.stopImmediatePropagation();
                    e.stopPropagation();

                    //체크박스 상태 확인 후 checked or unchecked로 상태 변환
                    $(this).find("input[type='checkbox']").prop('checked',function(){
                        return !$(this).prop('checked');
                    });
                });

                $("#btn-member-save").on("click", function ()
                {
                    var task_info      = $(".jsheet-layer").data("info"),
                        task_tr        = $("#task-layer-tbody > tr"),
                        checked_member = [],
                        task_type_seq  = task_info["TASK_TYPE_SEQ"];

                    $(task_tr).each(function(index, el) {
                        var chk_box     = $(el).find(".mem_chk_box").prop('checked');
                        var task_seq    = $(el).find(".mem_chk_box").attr("data-task_seq");
                        var member_seq  = $(el).find(".mem_chk_box").val();
                        var member_name = $(el).find(".mem_chk_box").attr("data-name");

                        //chk_box => 선택 여부 체크, task_seq => task_seq 유무 체크
                        // 체크 되었거나 체크되었으면서 task_seq가 있을때
                        if (chk_box === true || (chk_box === true && task_seq != ""))
                        {
                            var tmp_member_data = {};

                            /*
                             * member_info_list
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
                             (task_seq != "") ? tmp_member_data.task_seq = task_seq : false;
                        }
                        //task_seq만 있을때
                        else if (task_seq != "")
                        {
                            var tmp_member_data = {};

                            tmp_member_data.member_name = member_name;
                            tmp_member_data.use_yn = "N";
                            tmp_member_data.history_yn = "Y";
                            tmp_member_data.member_seq = member_seq;
                            tmp_member_data.task_type_seq = task_type_seq;
                            tmp_member_data.task_seq = task_seq;
                        }
                        if ("undefined" != typeof(tmp_member_data))
                        {
                            checked_member.push(tmp_member_data);
                        }
                    });

                    var form_data = {
                        cglist_seq      : $(".jsheet-layer").data("cglist_seq"),
                        column_seq      : $(".jsheet-layer").data("column_seq"),
                        member_info_list: checked_member,
                        project_seq     : self.getUrlParams("project_seq"),
                    };
                    var loader_options = {
                        target        : ".panel-title",
                        type          : "inner",
                        float         : "right",
                        spin_second   : "0.5s",
                        width         : "10px",
                        height        : "10px",
                        loader_margin : "0px"
                    };

                    return self.func("ajax", {
                        url            : "/works/cglist/task_create_process",
                        func           : "cellDataCI",
                        data           : form_data,
                        loader_options : loader_options,
                        target         : {cglist_seq : form_data["cglist_seq"], column_seq: form_data["column_seq"]},
                        type_code      : 3,
                    });
                });
                $("#btn-member-cancel").on("click", function () {
                    self.closeLayer();
                });
            })();
        }
        return ;
    }

    // column event "select"
    Plugin.prototype.changeSelectBox = function(s_cell) {
        if (s_cell)
        {
            /*
            // custom - select
            if (this._select)
            {
                var select = document.createElement("SELECT");
                select.className = "form-control cell-selector";

                for (var o_idx in this._select) {
                    var o       = document.createElement("OPTION");
                    o.value     = this._select[o_idx]["SEQ"];
                    o.innerHTML = this._select[o_idx]["NAME"];

                    select.appendChild(o);
                }
            }
            */
        }
    }

    // column event "link"
    Plugin.prototype.changeLink = function(s_cell) {
        var self = this;
        var path = "";
        if (typeof($(s_cell).find("a").data("info")) != "undefined")
        {
            path = $(s_cell).find("a").data("info");
        }

        path = prompt("파일 또는 폴더 경로를 입력해주세요.", path);

        if (path == null) return false;

        var form_data  = new FormData();
        form_data.append('project_seq', self.getUrlParams("project_seq"));
        form_data.append('cglist_seq', s_cell.data("cglist_seq"));
        form_data.append('column_seq', s_cell.data("column_seq"));
        form_data.append('history_yn', "Y");

        if ("" != path.trim())
        {
            form_data.append('cell_data', path);
        }
        else
        {
            alert("경로가 입력되지 않았습니다. 링크를 삭제합니다.");
            form_data.append('cell_data', "");
        }
        var loader_options = {
            target        : ".controll-bar-list",
            type          : "inner",
            float         : "right",
            spin_second   : "0.5s",
            width         : "36px",
            height        : "36px",
            loader_margin : "0px 10px 0px 15px"
        };

        return self.func("ajax", {
            url            : "/works/cglist/cell_save_process",
            func           : "cellDataCI",
            data           : form_data,
            loader_options : loader_options,
            target         : {cglist_seq : s_cell.data("cglist_seq"), column_seq: s_cell.data("column_seq")},
            type_code      : 2,
        });

    }

    // column event "media"
    Plugin.prototype.changeImage = function(s_cell) {
        var self = this;

        $(".temp_input_for_change_img").remove();

        var i = document.createElement("INPUT");
        document.body.appendChild(i);

        $(i).on("change", function ()
        {
            var imageObject = this.files[0];
            if( confirm('해당 이미지 파일을 변경하시겠습니까?'))
            {
                var form_data = new FormData();
                form_data.append('media_file', imageObject);
                form_data.append('cglist_seq', s_cell.attr("data-cglist_seq"));
                form_data.append('column_seq', s_cell.attr("data-column_seq"));
                form_data.append('project_seq', self.getUrlParams("project_seq"));
                form_data.append('history_yn', "Y");

                var loader_options = {
                    target        : ".controll-bar-list",
                    type          : "inner",
                    spin_second   : "0.5s",
                    width         : "36px",
                    height        : "36px",
                    loader_margin : "0px 10px 0px 15px"
                };

                return self.func("ajax", {
                    url            : "/works/cglist/media_upload_process",
                    func           : "cellDataCI",
                    data           : form_data,
                    loader_options : loader_options,
                    target         : {cglist_seq : s_cell.attr("data-cglist_seq"), column_seq: s_cell.attr("data-column_seq")},
                    type_code      : 1,
                });
            }
        }).attr("class", "temp_input_for_change_img").attr("type", "file").trigger('click');
    }

    /** * ----------------------------------------------------------------------
     * Return requested parameters from url / url에서 원하는 파라미터 반환
     * @param {boolean} updated / 텍스트를 생성 혹은 삭제할 지 구별자
     * -----------------------------------------------------------------------*/
    Plugin.prototype.textUpdated = function(updated) {
        var self = this;
        $(".text-updated").remove();

        if (updated)
        {
            var s           = document.createElement("SPAN");
            s.className     = "text-updated";
            s.innerHTML     = "수정된 셀이 있습니다.";
            s.onclick       = function ()
            {
                self.allSave();
            };
            $(".controll-bar-list").append(s);
        }
    };

    // column default event "text"
    Plugin.prototype.edit = function(cell_id) {
        var self = this;

        //init
        self.func("cancel");

        if ($("TD#"+cell_id).hasClass('edition') || $("TD#"+cell_id).length == 0) { return ; }

        //start edit
        var s_cell = $("TD#"+cell_id);

        if (s_cell.hasClass('disable'))
        {   // custom cell event
            switch (s_cell.data("type")) {
                case "textarea":
                    self.editFileText(s_cell);
                    break;
                case "member":
                    self.editTaskMember(s_cell);
                    break;
                case "media":
                    self.changeImage(s_cell);
                    break;
                case "link":
                    self.changeLink(s_cell);
                    break;
                case "select":
                    self.changeSelectBox(s_cell);
                    break;
            }
        }
        else
        {   // text
            var origin_val = s_cell
                .html()
                .replace(/\<br\>/g, "\n")
                .replace(/\<br \/\>/g, "\n");

            var textarea       = document.createElement("TEXTAREA");
            textarea.className = "jsheet-text";
            textarea.value     = origin_val;
            $(textarea).attr("data-ori-text", JSON.stringify(origin_val));

            if ('Netscape' == navigator.appName  &&
                -1         != navigator.userAgent.search('Trident'))
            {
                $(textarea).css("height", (s_cell.height()+10));
                s_cell.css("min-height", (s_cell.height()+10));
            }

            s_cell
                .addClass('edition')
                .html(textarea)
                .find("textarea")
                .css("height", (s_cell.height()+10))
                .focus();

            // s_cell.addClass('edition')
            // .html
            // (
            //     $("<TEXTAREA></TEXTAREA>")
            //         .addClass('jsheet-text')
            //         .val(origin_val)
            //         .attr("data-ori-text", JSON.stringify(origin_val))
            //         .css("height", (s_cell.height()+10))
            // ).find("textarea").focus();
        }

    };

    Plugin.prototype.closeContextMenu = function() {
        if ($(".context-menu-div").length > 0)
        {
            $(".context-menu-div").remove();
        }
    };

    Plugin.prototype.contextMenuEvent = function(evt, cell_id) {
        if (!$("TD#"+cell_id)) return false;

        var s_cell       = $("TD#"+cell_id);
        var context_info = {
            menu_list : this.func("getMenuList", s_cell),
            evt       : evt
        }

        this.func("openContextMenu", context_info);
    };

    /** * ----------------------------------------------------------------------
     * Open context menu / 컨텍스트 메뉴 열기
     * 전달 받은 메뉴 리스트에 따라 컨텍스트 메뉴를 구성하고 화면에 렌더링
     * @param {array} context_info
     * -----------------------------------------------------------------------*/
    Plugin.prototype.openContextMenu = function(context_info) {
        this.closeContextMenu();

        var list = context_info["menu_list"]

        var offsetX           = context_info["evt"].pageX;
        var offsetY           = context_info["evt"].pageY;

        var context_div       = document.createElement("DIV");
        context_div.className = "context-menu-div";
        context_div.oncontextmenu = function(){ return false; };

        var m_ul              = document.createElement("UL");
        m_ul.className        = "context-ul";

        try { // append menu items
            context_info["menu_list"].forEach(function(menu_item)
            {
                var m_li          = document.createElement("LI");
                m_li.className    = "context-li " + menu_item.type;
                m_li.dataset.name = menu_item.itemName;
                m_li.innerHTML    = menu_item.comment;
                m_li.onclick      = menu_item.func;
                m_ul.appendChild(m_li);
            }, this);
        } catch (e) { }

        context_div.appendChild(m_ul);
        document.body.appendChild(context_div);

        // 컨텍스트 박스 위치 조정(마우스 기준)
        var context_menu_div_width  = $(".context-menu-div").width();
        var context_menu_div_height = $(".context-menu-div").height();

        // 컨텍스트 박스의 위치가 화면보다 크다면 화면 안쪽으로 조정
        if ((context_menu_div_width + offsetX) > document.body.offsetWidth) {
            offsetX -= ((context_menu_div_width + offsetX) - document.body.offsetWidth) + 16;
        }
        if ((context_menu_div_height + offsetY) > document.documentElement.clientHeight) {
            offsetY -= ((context_menu_div_height + offsetY) - document.documentElement.clientHeight) + 16;
        }

        return $(context_div).offset({
            top  : offsetY,
            left : offsetX
        });
    };

    /** * ----------------------------------------------------------------------
     * Control role functions for rows / 행에 대한 제어 역할 함수
     * 행 추가, 삭제
     * @param {object} s_cell
     * @param {int} e_type

     * @return {function} Return function addRow2Table() or removeRowFromTable()
     * -----------------------------------------------------------------------*/
    Plugin.prototype.rowController = function(s_cell, e_type) {
        // detail init / 현재 디테일뷰 팝업이 열려 있을 시 닫기.
        this.detailViewClose();

        // Edit init / 현재 편집중인 셀이 있으면 저장.
        this.save($(".selected").attr("id"));

        var self        = this;
        var tr          = $(s_cell).closest("TR");
        var cglist_seq  = $(s_cell).data("cglist_seq");
        var project_seq = self.getUrlParams("project_seq");
        var form_data   = {};
        var func        = "";
        var url         = "";

        var loader_options = {
            target         : ".controll-bar-list",
            type           : "inner",
            spin_second    : "0.5s",
            width          : "36px",
            height         : "36px",
            loader_margin  : "0px 10px 0px 15px"
        };

        switch (e_type)
        {
            case 0: // 위에 행 추가
                func      = "addRow2Table";
                url       = "/works/cglist/create_row_process";
                form_data = { cglist_seq: cglist_seq, type: "prev", project_seq: project_seq };
                break;
            case 1: // 아래에 행 추가
                func      = "addRow2Table";
                url       = "/works/cglist/create_row_process";
                form_data = { cglist_seq: cglist_seq, type: "next", project_seq: project_seq };
                break;
            case 2: // 행 삭제
                if ($(".jsheet-table-body").find("tr").length == 1)
                {
                    alert("행이 하나일 경우는 삭제할 수 없습니다.");
                    break;
                }
                if (confirm("해당 행을 삭제하시겠습니까?"))
                {
                    func      = "removeRowFromTable";
                    url       = "/works/cglist/delete_row_process";
                    form_data = { cglist_seq: cglist_seq };
                }
                break;
        }
        return self.func("ajax", {
            url            : url,
            func           : func,
            data           : form_data,
            loader_options : loader_options,
            target         : {cglist_seq : cglist_seq},
        });
    };

    /** * ----------------------------------------------------------------------
     * tr의 인덱스를 구한 후 오리지날 테이블과 클론 테이블에 동시에 복제 후 붙여넣기
     * -----------------------------------------------------------------------*/
    Plugin.prototype.addRow2Table = function(result) {
        var self        = this,
            _tr         = $(".jsheet-table-body").find("TD[data-cglist_seq ="+result.info.data.cglist_seq+"]").closest("TR"), // tr
            _clone      = _tr.clone(), // tr clone
            _i          = _tr.index(); // tr index

        var status_seq  = result["cglist_info"]["STATUS_SEQ"],
            status_name = result["cglist_info"]["STATUS_NAME"],
            cglist_seq  = result["cglist_seq"];

        _clone.find("TD").each(function(index, el) {
            var _td = $(el);

            if (_td.data("type") === "select")
            {
                _td.find("select > option").first().prop("selected", true);
            }
            else
            {
                _td.text("");
            }
            _td.attr("data-cglist_seq", cglist_seq);
        });

        // select class init
        $(this.element).find("TD").removeClass('selected');

        if (result.info.data.type == "prev")
        {
            _tr.before(_clone);
        }
        else if (result.info.data.type == "next")
        {
            _tr.after(_clone);
        }

        // 복제 테이블이 있을 경우
        if (this.options.fixedColumn)
        {
            var _c_tr    = $(".jsheet-table-body-fixed").find("TD[data-cglist_seq ="+result.info.data.cglist_seq+"]").closest("TR"); // tr
            var _c_clone = _c_tr.clone();
            var i        = this.options.fixedCount;

            _c_clone.find("TD").each(function(index, el) {
                var _td = $(el);

                if (_td.data("type") === "select")
                {
                    _td.find("select > option").first().prop("selected", true);
                }
                else
                {
                    _td.text("");
                }
                _td.attr("data-cglist_seq", cglist_seq);
            });

            if (result.info.data.type == "prev")
            {
                _c_tr.before(_c_clone);
            }
            else if (result.info.data.type == "next")
            {
                _c_tr.after(_c_clone);
            }

            // 해당 셀 이벤트 부여
            $(_c_clone).find("TD").on({
                click       : function ()
                {
                    self.setSelectCell(this.id);
                },
                contextmenu : function (evt)
                {
                    evt.preventDefault();
                    self.contextMenuEvent(evt, this.id);
                },
                dblclick    : function ()
                {
                    self.edit(this.id);
                }
            });
        }

        // 해당 셀 이벤트 부여
        $(_clone).find("TD").on({
            click       : function ()
            {
                self.setSelectCell(this.id);
            },
            contextmenu : function (evt)
            {
                evt.preventDefault();
                self.contextMenuEvent(evt, this.id);
            },
            dblclick    : function ()
            {
                self.edit(this.id);
            }
        });

        self.cellSequencing(this.element);
        self.setSyncScroll();

        return ;
    };

    Plugin.prototype.removeRowFromTable = function(result) {
        var cglist_seq = result.info.target.cglist_seq;
        if (cglist_seq || result["result"] != false)
        {
            var i = $("TD[data-cglist_seq="+cglist_seq+"]").closest('TR').index();

            var o = $(".jsheet-table-body").find("TR").get(i);
            var c = $(".jsheet-table-body-fixed").find("TR").get(i);
            if (o && c)
            {
                $(o).remove();
                $(c).remove();
            }

            this.cellSequencing(this.element);
        }
    };

    /** * ----------------------------------------------------------------------
    * Save all cells with column type textarea  / 열 타입이 텍스트인 셀 모두 저장
    * -----------------------------------------------------------------------*/
    Plugin.prototype.allSave = function() {
        var r = confirm("전체 데이터를 저장하시겠습니까?");
        if (r == false) return false;

        var self = this;

        // cloned table data to original table
        $(".jsheet-table-body-fixed").find("TD").each(function(index, el)
        {
            var _this      = $(el);
            var _type      = _this.data("type");
            var cglist_seq = _this.data("cglist_seq");
            var column_seq = _this.data("column_seq");
            var row_data = [];

            switch (_type) {
                case "select":
                    $(".jsheet-table-body")
                        .find('TD[data-cglist_seq="'+cglist_seq+'"][data-column_seq="'+column_seq+'"]')
                        .find("select")
                        .val(_this.find("select").val());
                    break;
                case "text":
                    $(".jsheet-table-body")
                        .find('TD[data-cglist_seq="'+cglist_seq+'"][data-column_seq="'+column_seq+'"]')
                        .html(_this.html())
                        break;
            }
        });
        var row_data = [];

        // Save All (Only text and selector)
        $(".jsheet-table-body").find("TR").each(function(index, tr) {
            var td = $(tr).find("td");
            var cglist_seq = td.first().attr("data-cglist_seq");
            var col_data = [];

            $(td).each(function(index, td_col) {
                var _td_col = $(td_col);
                var tmp_data = [];

                switch (_td_col.data("type")) {
                    case "link":
                    case "media":
                    case "textarea":
                    case "member": // json data
                        //셀 내에서 실시간 저장 -> 전체 저장에서 제외
                        // col_data.push( { COLUMN_SEQ: _td_col.attr("data-column_seq"), DATA: "" } );
                        break;
                    case "select": // 번호 데이터
                        col_data.push(
                            {
                                COLUMN_SEQ: _td_col.attr("data-column_seq"),
                                DATA: _td_col.find("select option:selected").val()
                            }
                        );
                        break;
                    default: // 다양한 데이터
                        col_data.push(
                            {
                                COLUMN_SEQ: _td_col.attr("data-column_seq"),
                                DATA: _td_col.html()
                                // DATA: data
                            }
                        );
                }
            });
            row_data.push({CGLIST_SEQ: cglist_seq, CELL_LIST: col_data});
        });
        var json_row_data = JSON.stringify(row_data);
        // var form_data = {JSON_CGLIST_LIST: json_row_data, PROJECT_SEQ: self.getUrlParams("project_seq")};
        var form_data = {json_cglist_list: json_row_data, project_seq: self.getUrlParams("project_seq")};
        var loader_options = {
            target        : ".panel-heading",
            type          : "inner",
            spin_second   : "0.5s",
            width         : "10px",
            height        : "10px",
            loader_margin : "0px 10px 0px 0px"
        };

        return self.func("ajax", {
            url            : "/works/cglist/save_process",
            func           : "allSaveConfirm",
            data           : form_data,
            loader_options : loader_options,
            type_code      : 0,
        });
    };

    Plugin.prototype.allSaveConfirm = function(result) {
        if (result["result"])
        {
            alert("데이터가 저장되었습니다.");
            $(".text-updated").remove();
        }
        else
        {
            console.log(result);
            alert("데이터를 저장하는데에 실패하였습니다. 개발팀에 문의해주세요.");
        }
    };

    /** * ----------------------------------------------------------------------
    * Create Detailview and Bind Events / 자세히보기 생성 및 이벤트 바인딩
    * -----------------------------------------------------------------------*/
    Plugin.prototype.detailView = function(s_cell) {
        var self       = this;

        // detail init
        self.detailViewClose();

        if (s_cell == null) return false;

        var cglist_seq = $(s_cell).data("cglist_seq"),
            column_seq = $(s_cell).data("column_seq"),
            i          = $(s_cell).closest("TR").index(),
            origin     = $(".jsheet-table-body").find("TR").get(i),
            clone      = $(".jsheet-table-body-fixed").find("TR").get(i);

        // $("TD").removeClass('selected');
        $(origin).addClass('active');
        $(clone).addClass('active');

        // detail-view 구조 생성
        var detail_wapper_div = document.createElement("DIV");
        detail_wapper_div.className = "detail-wapper-div";

        var detail_div = document.createElement("DIV");
        detail_div.className = "detail-div";
        detail_div.dataset.cglist_seq = cglist_seq;
        detail_div.dataset.column_seq = column_seq;

        var detail_header_div = document.createElement("DIV");
        detail_header_div.className = "detail-header-div";

        var detail_header_left_span = document.createElement("SPAN");
        detail_header_left_span.className = "pull-left detail-header-left-span";
        detail_header_left_span.innerHTML = "상세화면을 로드하고 있습니다.";

        var detail_header_right_span_remove = document.createElement("SPAN");
        detail_header_right_span_remove.className = "span_remove pull-right";
        detail_header_right_span_remove.innerHTML = '<span class="detail-close-btn glyphicon glyphicon-remove" aria-hidden="true"></span>';
        detail_header_right_span_remove.onclick = function() {
            self.detailViewClose();
        }

        detail_header_div.appendChild(detail_header_left_span);
        detail_header_div.appendChild(detail_header_right_span_remove);

        var detail_body_div = document.createElement("DIV");
        detail_body_div.className = "detail-body-div";

        detail_div.appendChild(detail_header_div);
        detail_div.appendChild(detail_body_div);
        detail_wapper_div.appendChild(detail_div);

        document.body.appendChild(detail_wapper_div);

        // jquery UI - resizable 이벤트 지정
        $('.detail-wapper-div').resizable({
            handles: 'w',
            minWidth: 750,
            maxWidth: 1300,
            helper: "ui-resizable-helper",
            stop: function(e, ui) {
                ui.element.css('left', '');
            }
        });

        // resize 브라우저 이벤트 지정
        $(window).resize(function() {
            $(".detail-wapper-div")
                .css('right', '0')
                .css('left', '')
                .css('display', 'fixed');
        })

        var loader_options = {
            target: ".detail-body-div",
            type: "outer",
            spin_second: "0.5s",
            border: "15px",
            width: "20px",
            height: "20px",
            in_color: "#838383",
            out_color: "rgba(255, 255, 255, 0.7)",
            dim_top: "0",
            dim_color: "#E0E0E0",
            loader_margin: "0px 0px 0px 0px"
        };

        return self.func("ajax", {
            url            : "/works/cglist/cglist_info",
            func           : "detailViewOpen",
            data           : {cglist_seq: cglist_seq},
            loader_options : loader_options,
        });
    };

    Plugin.prototype.detailViewOpen = function(cglist_info) {
        var self = this;

        if (!cglist_info)
            return this.detailViewClose();

        self.setDetailStruct(cglist_info);
        self.setDetailHeader(cglist_info);
        self.setDetailBody(); //default info
    };

    // 레이어가 중첩되어 있을 경우 우선순위에 따라 레이어 제거
    Plugin.prototype.closeCI = function() {
        if ($(".div_media_dim").length > 0)
        {
            window.mediaView.mediaClose();
            return ;
        }
        else if ($(".jsheet-text").length > 0)
        {
            this.cancel();
            return ;
        }
        else if ($(".jsheet-dimmed").length > 0)
        {
            this.closeLayer();
            return ;
        }
        else if ($(".detail-wapper-div").length > 0)
        {
            this.detailViewClose();
            return ;
        }
    }

    Plugin.prototype.setDetailStruct = function(cglist_info) {
        var self = this;

        // create structure
        var title = cglist_info["CUT"];
        var header_div = document.createElement("DIV");
        header_div.className = "header-div";
        var header_left_div = document.createElement("DIV");
        header_left_div.className = "header-left-div";
        var header_right_div = document.createElement("DIV");
        header_right_div.className = "header-right-div";
        var body_div = document.createElement("DIV");
        body_div.className = "body-div";
        var body_tab_menu_div = document.createElement("DIV");
        body_tab_menu_div.className = "body-tab-menu-div";
        var body_tab_body_div = document.createElement("DIV");
        body_tab_body_div.className = "body-tab-body-div";

        //set tab menu bar
        var body_tab_menu_div       = document.createElement("DIV");
        body_tab_menu_div.className = "tab-menu";

        var tab_info       = document.createElement("DIV");
        tab_info.className = "tab-menu-item";
        tab_info.id        = "setTabInfo";
        tab_info.innerHTML = "Info";
        tab_info.onclick   = function() {
            self.setDetailBody();
        };

        var tab_activity       = document.createElement("DIV");
        tab_activity.className = "tab-menu-item";
        tab_activity.id        = "setTabActivity";
        tab_activity.innerHTML = "Activity";
        tab_activity.onclick   = function() {
            self.setDetailBody("setTabActivity", "cglist_activity_list");
        };

        var tab_feedback       = document.createElement("DIV");
        tab_feedback.className = "tab-menu-item";
        tab_feedback.id        = "setTabFeedback";
        tab_feedback.innerHTML = "FeedBack";
        tab_feedback.onclick   = function() {
            self.setDetailBody("setTabFeedback", "cglist_task_list");
        };

        body_tab_menu_div.appendChild(tab_info);
        body_tab_menu_div.appendChild(tab_activity);
        body_tab_menu_div.appendChild(tab_feedback);

        header_div.appendChild(header_left_div);
        header_div.appendChild(header_right_div);
        body_div.appendChild(body_tab_menu_div);
        body_div.appendChild(body_tab_body_div);

        return $(".detail-body-div").html("").append(header_div).append(body_div);
    };

    Plugin.prototype.setDetailHeader = function(cglist_info) {
        // set title
        $(".detail-header-left-span").html(cglist_info["SCENE"]+" / "+cglist_info["CUT"]);

        // set thumn image
        var image      = document.createElement("IMG");
        var media_path = '/assets/img/no_image_150x100.gif';
        var media_info = {};

        try
        {
            media_info = jQuery.parseJSON(cglist_info["CUT_IMG"]);
            media_path = '/data/'+media_info["FILE_PATH"]+media_info["FILE_NAME"];
        } catch (e) { }

        $(image)
            .prop("src", media_path)
            .attr("data-data_info", cglist_info["CUT_IMG"])
            .attr("onerror", "this.src='/assets/img/no_image_150x100.gif';this.className='image_none'")
            .prop("class", "show_media_contents")
            .css ("width", "150px")
            .css ("height", "100px")
            .attr("data-data_info", cglist_info["CUT_IMG"]);

        $(".header-left-div").html(image);

        var body_html = '<table class="table">'
        // Plate Frame In / Vender / Plate Frame Out / Retime / Scale
        + '  <tbody>'
        + '    <tr class="header-table-tr">'
        + '      <td>Roll</td>'
        + '      <td>'+cglist_info["SCENE"]+'</td>'
        + '      <td>Plate Frame In</td>'
        + '      <td>1001</td>'
        + '      <td>Lens</td>'
        + '      <td>'+cglist_info["INFO_LENS"]+'</td>'
        + '    </tr>'
        + '    <tr class="header-table-tr">'
        + '      <td>Cut</td>'
        + '      <td>'+cglist_info["CUT"]+'</td>'
        + '      <td>Plate Frame Out</td>'
        + '      <td>1064</td>'
        + '      <td>Degree</td>'
        + '      <td>'+cglist_info["INFO_SHUTTER_DEGREE"]+'</td>'
        + '    </tr>'
        + '    <tr class="header-table-tr">'
        + '      <td>Vender</td>'
        + '      <td>cocoa</td>'
        + '      <td>Plate Duration</td>'
        + '      <td>64</td>'
        + '      <td>Shutter</td>'
        + '      <td>'+cglist_info["INFO_SHUTTER"]+'</td>'
        + '    </tr>'
        + '    <tr class="header-table-tr">'
        + '      <td>Status</td>'
        + '      <td>'+cglist_info["STATUS_NAME"]+'</td>'
        + '      <td>Edit Duration</td>'
        + '      <td>'+cglist_info["INFO_DURATION"]+'</td>'
        + '      <td>ASA</td>'
        + '      <td>'+cglist_info["INFO_ASA"]+'</td>'
        + '    </tr>'
        + '    <tr class="header-table-tr">'
        + '      <td>Place</td>'
        + '      <td>'+cglist_info["PLACE"]+'</td>'
        + '      <td>Retime</td>'
        + '      <td>0</td>'
        + '      <td>Wpoint</td>'
        + '      <td>'+cglist_info["INFO_WHITEPOINT"]+'</td>'
        + '    </tr>'
        + '    <tr class="header-table-tr">'
        + '      <td>Clip Name</td>'
        + '      <td>'+cglist_info["CLIP_NUMBER"]+'</td>'
        + '      <td>Scale</td>'
        + '      <td>0</td>'
        + '      <td>Time Code</td>'
        + '      <td>'+cglist_info["TIME_CODE_01"]+'</td>'
        + '    </tr>'
        + '  </tbody>'
        + '</table>';

        $(".header-right-div").html(body_html);
    };

    Plugin.prototype.setDetailBody = function(mathod, url)
    {
        if (mathod == null) mathod = "setTabInfo";
        if (url == null) url = "cglist_info";

        var self = this;

        if (self.socket)
        {
            // init socket
            self.socket.disconnect();
            delete self["socket"];
        }

        if ($(".body-tab-body-div").length > 0)
        {
            $(".tab-menu-item").removeClass('active');
            $("#"+mathod).addClass('active');

            var loader_options = {
                target        : ".body-tab-body-div",
                type          : "outer",
                spin_second   : "0.5s",
                border        : "15px",
                width         : "20px",
                height        : "20px",
                in_color      : "#838383",
                out_color     : "rgba(255, 255, 255, 0.7)",
                dim_top       : "0",
                dim_color     : "#E0E0E0",
                loader_margin : "0px 0px 0px 0px"
            };
            return this.func("ajax", {
                url            : "/works/cglist/"+url,
                func           : mathod,
                data           : {
                    cglist_seq : $(".detail-div").data("cglist_seq"),
                    project_seq: this.getUrlParams("project_seq"),
                    // column_seq : $(".detail-div").data("column_seq")
                 },
                loader_options : loader_options,
            });
        }
        return false;
    };

    Plugin.prototype.getImageElem = function(img_data) {
        var img        = document.createElement("IMG");
        var image_path = '/assets/img/no_image_150x100.gif';
        try {
            if (!img_data.hasOwnProperty("IMG_INFO"))
            {
                img_data = jQuery.parseJSON( img_data );
            }
            img_data = img_data["IMG_INFO"];

            if (img_data.hasOwnProperty("FILE_PATH"))
            {

                image_path = img_data["FILE_PATH"]+img_data["FILE_NAME"];
            }
            if (img_data.hasOwnProperty("THUMB_INFO"))
            {
                image_path = img_data["THUMB_INFO"]["FILE_PATH"];
            }

            $(img)
                .attr("onerror",        "this.src='/assets/img/no_image_150x100.gif';this.className='image_none'")
                .prop("class",          "show_media_contents")
                .prop("src",            media_path+image_path)
                .attr("data-data_info", JSON.stringify(img_data));

        } catch (e) {
            $(img)
                .prop("class",          "image_none")
                .prop("src",            media_path+image_path)
                .css("max-width",       "150px")
                .css("max-height",      "100px")
                .attr("data-data_info", JSON.stringify(img_data));
        }

        return img;
    }

    /** * ----------------------------------------------------------------------
     * Set Info Tab in Deatail - View
     * 디테일뷰 - 탭 - INFO UI 구성 및 이벤트 부여
     * @param {object} detail_body_info_data
     * -----------------------------------------------------------------------*/
    Plugin.prototype.setTabInfo = function(detail_body_info_data) {
        var descript_html = "";
        var set_tab_info_html = "";

        if (detail_body_info_data["DESCRIPTION"] != "")
        {
            var de_description = jQuery.parseJSON( detail_body_info_data["DESCRIPTION"] );
            var image_info = de_description["IMG_INFO"];

            var img = this.getImageElem(de_description);
            img.dataset.type = "";

            var image_html = $(img).get(0).outerHTML;
            descript_html += image_html+"<br />";
            descript_html += de_description["CELL_DATA"];
        }

        // Edit Version / Plate Version / Source Comment / Director Confirm Date / Final Out Version / Create By / Updated By
        set_tab_info_html += '<table class="table table-striped" style="margin-top: 15px;">';
        set_tab_info_html += '  <tbody>';
        set_tab_info_html += '    <tr>';
        set_tab_info_html += '      <td style="width:200px">Description</td>';
        set_tab_info_html += '      <td>'+descript_html+'</td>';
        set_tab_info_html += '    </tr>';
        set_tab_info_html += '    <tr>';
        set_tab_info_html += '      <td style="width:200px">Checks matter</td>';
        set_tab_info_html += '      <td>'+detail_body_info_data["CHECKS_MATTER"]+'</td>';
        set_tab_info_html += '    </tr>';
        set_tab_info_html += '    <tr>';
        set_tab_info_html += '      <td style="width:200px">Edit Version</td>';
        set_tab_info_html += '      <td>Edit_0510_f</td>';
        set_tab_info_html += '    </tr>';
        set_tab_info_html += '    <tr>';
        set_tab_info_html += '      <td style="width:200px">Edit Comparison</td>';
        set_tab_info_html += '      <td>앞 1f 추가 / 뒤 5f 삭제 / 58 -> 54</td>';
        set_tab_info_html += '    </tr>';
        set_tab_info_html += '    <tr>';
        set_tab_info_html += '      <td style="width:200px">Plate Version</td>';
        set_tab_info_html += '      <td>Plate v002</td>';
        set_tab_info_html += '    </tr>';
        set_tab_info_html += '    <tr>';
        set_tab_info_html += '      <td style="width:200px">Source Comment</td>';
        set_tab_info_html += '      <td>001 폴더 : 또또 사진 소스 <br /> 002 폴더 : 투명 모니터 합성 소스</td>';
        set_tab_info_html += '    </tr>';
        set_tab_info_html += '    <tr>';
        set_tab_info_html += '      <td style="width:200px">Director Confirm Date</td>';
        set_tab_info_html += '      <td>2017/02/10</td>';
        set_tab_info_html += '    </tr>';
        set_tab_info_html += '    <tr>';
        set_tab_info_html += '      <td style="width:200px">Director Confirm Version</td>';
        set_tab_info_html += '      <td>v002</td>';
        set_tab_info_html += '    </tr>';
        set_tab_info_html += '    <tr>';
        set_tab_info_html += '      <td style="width:200px">Final Out Date</td>';
        set_tab_info_html += '      <td>'+detail_body_info_data["CHECKS_MATTER"]+'</td>';
        set_tab_info_html += '    </tr>';
        set_tab_info_html += '    <tr>';
        set_tab_info_html += '      <td style="width:200px">Final Out Version</td>';
        set_tab_info_html += '      <td>v002</td>';
        set_tab_info_html += '    </tr>';
        set_tab_info_html += '    <tr>';
        set_tab_info_html += '      <td style="width:200px">Create By</td>';
        set_tab_info_html += '      <td>옥소담</td>';
        set_tab_info_html += '    </tr>';
        set_tab_info_html += '    <tr>';
        set_tab_info_html += '      <td style="width:200px">Updated By</td>';
        set_tab_info_html += '      <td>김지혜</td>';
        set_tab_info_html += '    </tr>';
        set_tab_info_html += '    <tr>';
        set_tab_info_html += '      <td style="width:200px">Date Updated</td>';
        set_tab_info_html += '      <td>2017/02/15 02:52pm</td>';
        set_tab_info_html += '    </tr>';
        set_tab_info_html += '  </tbody>';
        set_tab_info_html += '</table>';

        $(".body-tab-body-div").html(set_tab_info_html);

        return (function () {
            window.mediaView.init();
        })();
    };

    /** * ----------------------------------------------------------------------
     * make profile image element
     * @param {string} JSON
     * @return {element} profile image
     * -----------------------------------------------------------------------*/
    Plugin.prototype.getProfileImage = function(json_img) {
        var img = document.createElement("IMG");
        img.className = "user_img";

        try {
            var img_info = JSON.parse(json_img);
            img.src = media_path+img_info["FILE_PATH"]+img_info["FILE_NAME"];
        } catch (e) {
            img.src = "/assets/img/profile_blank.png";
        }
        img.onerror = function ()
        {
            img.src = "/assets/img/profile_blank.png";
        }
        return img;
    }

    /** * ----------------------------------------------------------------------
     * Generate feedback message DIV / 탭 - 피드백 메시지 DIV 생성
     * @param {string} JSON
     * @return {element} Message DIV
     * -----------------------------------------------------------------------*/
    Plugin.prototype.getMsgContents = function(json_contents) {
        var div = document.createElement("DIV");

        try {
            var c_info = JSON.parse(json_contents);

            if (c_info.hasOwnProperty("IMG_INFO"))
            {
                var img = this.getImageElem(c_info);
                img.onerror = function ()
                {
                    img.src = "/assets/img/no_image_150x100.gif";
                }
                img.dataset.type = "";
                div.appendChild(img);
            }
            if (c_info.hasOwnProperty("CELL_DATA"))
            {
                var p = document.createElement("P");
                p.innerHTML = c_info["CELL_DATA"];
                div.appendChild(p);
            }
            div.dataset.m_type = c_info["M_TYPE"];

            switch (c_info["M_TYPE"])
            {
                case 1:
                    div.className = "msg-item-contents system";
                    break;
                case 2:
                    div.className = "msg-item-contents director";
                    break;
                default:
                    div.className = "msg-item-contents normal";
            }
        } catch (e) {
            console.log(e);
        }
        return div;
    }

    /** * ----------------------------------------------------------------------
     * Generate Activity Item DIV / 탭 - 액티비티 아이템 DIV 생성
     * @param {object} a_item
     * @return {element} Activity-item DIV
     * -----------------------------------------------------------------------*/
    Plugin.prototype.makeActivityItem = function(a_item) {
        if (a_item["MEMBER_NAME"] == null)
        {
            a_item["MEMBER_NAME"] = "시스템 알림";
        }

        // contents
        var contents_div       = document.createElement("DIV");
        contents_div.className = "item-body-contents";

        var contents = this.getMsgContents(a_item["CONTENTS"]);

        // item
        var a_i           = document.createElement("DIV");
        a_i.className     = "activity-item";

        var i_h           = document.createElement("DIV");
        i_h.className     = "activity-item-header";

        var i_h_s_l       = document.createElement("DIV");
        i_h_s_l.className = "item-name pull-left";

        switch (parseInt(contents.dataset.m_type)) {
            /* 0 - 일반메세지 1 - 시스템메세지 2 - 감독피드백 */
            case 1:
                i_h_s_l.innerHTML = a_item["MEMBER_NAME"]+"<div class='mark red'></div>";
                break;
            case 2:
                i_h_s_l.innerHTML = a_item["MEMBER_NAME"]+"<div class='mark yellow'></div>";
                break;
            default:
                i_h_s_l.innerHTML = a_item["MEMBER_NAME"]+"<div class='mark'></div>";
        }

        var i_h_s_r       = document.createElement("SPAN");
        i_h_s_r.className = "item-date pull-right";
        i_h_s_r.innerHTML = a_item["ADD_DATE"];

        var i_b             = document.createElement("DIV");
        i_b.className       = "activity-item-body";

        // user profile
        var thumb_div       = document.createElement("DIV");
        thumb_div.className = "item-body-thum";

        var img = this.getProfileImage(a_item["PROFILE_IMG_INFO"]);



        i_h.appendChild(i_h_s_l);
        i_h.appendChild(i_h_s_r);

        thumb_div.appendChild(img);
        i_b.appendChild(thumb_div);

        contents_div.appendChild(contents);

        i_b.appendChild(contents_div);

        a_i.appendChild(i_h);
        a_i.appendChild(i_b);

        if (a_item.hasOwnProperty("SEQ"))
        {
            a_i.dataset.seq = a_item["SEQ"];
        }

        return a_i;
    }

    /** * ----------------------------------------------------------------------
     * Set Activity Tab in Deatail-View
     * 디테일뷰 - 탭 - Activity UI 구성 및 이벤트 부여
     * @param {object} activity_data
     * -----------------------------------------------------------------------*/
    Plugin.prototype.setTabActivity = function(activity_data) {
        var self = this;

        var activity_buttons       = document.createElement("DIV");
        activity_buttons.className = "activity-buttons btn-group btn-group-justified";

        var btn_all       = document.createElement("DIV");
        btn_all.className = "btn btn-secondary btn-sm";
        btn_all.innerHTML = "전체";
        btn_all.onclick   = function ()
        {
            $(".activity-item").show();
            $(".activity-list").scrollTop(0);
        }

        var btn_dir       = document.createElement("DIV");
        btn_dir.className = "btn btn-warning btn-sm";
        btn_dir.innerHTML = "감독 피드백";
        btn_dir.onclick   = function ()
        {
            $(".activity-item").hide();
            $(".director").closest(".activity-item").show();
            $(".activity-list").scrollTop(0);
        }

        var btn_normal       = document.createElement("DIV");
        btn_normal.className = "btn btn-info btn-sm";
        btn_normal.innerHTML = "일반 피드백";
        btn_normal.onclick   = function ()
        {
            $(".activity-item").hide();
            $(".normal").closest(".activity-item").show();
            $(".activity-list").scrollTop(0);
        }

        var btn_sys       = document.createElement("DIV");
        btn_sys.className = "btn btn-danger btn-sm";
        btn_sys.innerHTML = "시스템";
        btn_sys.onclick   = function ()
        {
            $(".activity-item").hide();
            $(".system").closest(".activity-item").show();
            $(".activity-list").scrollTop(0);
        }

        activity_buttons.appendChild(btn_all);
        activity_buttons.appendChild(btn_dir);
        activity_buttons.appendChild(btn_normal);
        activity_buttons.appendChild(btn_sys);

        var activity_list       = document.createElement("DIV");
        activity_list.className = "activity-list";

        delete activity_data["THIS_MEMBER_SEQ"];
        delete activity_data["info"];

        for (var i in activity_data) {
            var a_item = self.makeActivityItem(activity_data[i]);
            activity_list.appendChild(a_item);
        }

        if (activity_data.length == 0)
        {
            activity_list.innerHTML = "데이터가 없습니다.";
        }

        var msg_form       = document.createElement("DIV");
        msg_form.className = "activity-msg-form";
        // send_message_form
        msg_form.innerHTML =
            '<form id="send-message-form" name="send-message-form" onsubmit="return false;" data-id="message-form">' +
            '  <div class="input-group">' +
            '      <span class="input-group-btn">' +
            '          <div id="btn-open-form" class="btn btn-default btn-sm">' +
            '      <span class="glyphicon glyphicon-paperclip"></span></div></span>' +
            '      <input type="text" class="form-control input-sm" name="message" id="text-upload-input" placeholder="메세지를 입력해주세요.">' +
            '      <span class="input-group-btn">' +
            '          <a id="btn-send-msg" class="btn btn-primary btn-sm">&nbsp;Send&nbsp;</a>' +
            '      </span>' +
            '  </div>' +
            '</form>';

        $(".body-tab-body-div")
            .html("")
            .append(activity_buttons)
            .append(activity_list)
            .append(msg_form);

        return (function ()
        {
            // activity event start
            $("#btn-open-form").on("click", function () {
                self.detailMsgEditor({
                    cglist_seq : $(".detail-div").data("cglist_seq"),
                    tab        : "activity",
                });
            });

            $("#btn-send-msg").on("click", function () {
                var contents  = $("#text-upload-input").val();
                if (contents != "")
                {
                    var form_data = new FormData();
                    form_data.append('contents', contents);

                    self.sendMessage("activity", form_data);
                }
                else
                {
                    alert("메세지를 입력해주세요.")
                }
                $("#text-upload-input").val("");
            });

            $(".activity-item").on("contextmenu", function (event) {
                event.preventDefault();

                var seq = this.dataset.seq;

                var item_list = [
                    {
                        itemName : "DesignDirectorFeed",
                        comment  : "감독 피드백으로 지정",
                        type     : "basic",
                        func     : function ()
                        {
                            self.DesignDirectorFeed(seq);
                        },
                    }];

                var context_info = {
                    menu_list : item_list,
                    evt       : event
                }

                self.func("openContextMenu", context_info);
            });

            $("#send-message-form").submit(function() {
                $("#btn-send-msg").trigger('click');
            });

            window.mediaView.init();
            // activity event end
        })();
    };

    // 감독 피드백 지정 로직
    Plugin.prototype.DesignDirectorFeed = function(item_seq) {
        if (typeof(item_seq) == "object" && item_seq.hasOwnProperty("result"))
        {
            alert("감독 피드백으로 지정되었습니다.");

            $(".activity-item[data-seq="+item_seq.info.data.cglist_activity_seq+"]")
                .find(".msg-item-contents")
                .removeClass()
                .addClass('msg-item-contents')
                .addClass('director');

            $(".activity-item[data-seq="+item_seq.info.data.cglist_activity_seq+"]")
                .find(".mark")
                .addClass('yellow');
            return ;
        }

        if (typeof(item_seq) == "string" && confirm("감독 피드백으로 지정하시겠습니까?"))
        {
            var form_data =
            {
                cglist_activity_seq : item_seq,
                column_seq          : $(".detail-div").data("column_seq"),
                cglist_seq          : $(".detail-div").data("cglist_seq"),
                project_seq         : this.getUrlParams("project_seq"),
            };

            var loader_options = {
                target        : ".tab_menu",
                type          : "inner",
                float         : "right",
                spin_second   : "0.5s",
                width         : "33px",
                height        : "33px",
                loader_margin : "0px",
            };

            this.func("ajax", {
                func           : "DesignDirectorFeed",
                url            : "/works/cglist/activity_designation_cell_save_process",
                data           : form_data,
                loader_options : loader_options,
            });
        }
    }

    /** * ----------------------------------------------------------------------
     * Send Message / 메세지 보내기
     * @param {string} mathod
     * @param {object} form_data
     *
     * @return {function} receiveMessage()
     * -----------------------------------------------------------------------*/
    Plugin.prototype.sendMessage = function(mathod, form_data) {
        if (mathod == "activity")
        {
            var url          = "/works/cglist/cglist_activity_insert";
            form_data.mathod = mathod;
            form_data.append('project_seq', this.getUrlParams("project_seq"));
            form_data.append('cglist_seq',  $(".detail-div").data("cglist_seq"));
            form_data.append('column_seq',  $(".detail-div").data("column_seq"));
        }
        if (mathod == "feedback")
        {
            var url          = "/works/cglist/task_feedback_insert";
            form_data.mathod = mathod;
            form_data.append('project_seq', this.getUrlParams("project_seq"));
            form_data.append('task_seq',  $(".feedback-item.active").data("task_seq"));
        }

        var loader_options = {
            target        : "div.tab-menu",
            type          : "inner",
            float         : "right",
            spin_second   : "0.5s",
            width         : "23px",
            height        : "23px",
            loader_margin : "5px",
        };

        return this.func("ajax", {
            url            : url,
            func           : "receiveMessage",
            data           : form_data,
            loader_options : loader_options,
        });
    }

    /** * ----------------------------------------------------------------------
     * Receive Message (+Socket) / 메세지 받기
     * @param {object} receive_data
     * -----------------------------------------------------------------------*/
    Plugin.prototype.receiveMessage = function(receive_data) {
        var self = this;

        switch (receive_data.info.data.mathod)
        {
            case "activity":
                var a_item = this.makeActivityItem(receive_data);
                $(a_item).on("contextmenu", function (event) {
                    event.preventDefault();

                    var seq = this.dataset.seq;

                    var item_list = [
                        {
                            itemName : "DesignDirectorFeed",
                            comment  : "감독 피드백으로 지정",
                            type     : "basic",
                            func     : function ()
                            {
                                self.DesignDirectorFeed(seq);
                            },
                        }];
                    var context_info = {
                        menu_list : item_list,
                        evt       : event
                    }
                    self.func("openContextMenu", context_info);
                });
                $(".activity-list")
                    .append(a_item)
                    .animate({
                        scrollTop: $(".activity-list")[0].scrollHeight
                    })
                    .focus();
                break;
            case "feedback":
                var chat_li = self.makeMsgItem(receive_data);
                $(".feedback-chat-list > ul").append(chat_li);
                $(".feedback-chat-list")
                    .animate({
                        scrollTop: $(".feedback-chat-list > ul")[0].scrollHeight
                    })
                    .focus();

                self.socket.emit('user', {
                    type: 10,
                    name: this_member_info["NAME"] + " " + this_member_info["MEMBER_TITLE_NAME"],
                });
                break;
        }
        window.mediaView.init();
    }

    /** * ----------------------------------------------------------------------
     * Connect Socket server and Set Socket Events / 소켓서버 접속 및 관련 이벤트 지정
     * @param {object} sock_info
     * -----------------------------------------------------------------------*/
    Plugin.prototype.connectSocketServer = function(sock_info) {
        var self = this;

        if (self.socket)
        {
            // init socket
            self.socket.disconnect();
            delete self["socket"];
        }

        //소켓 접속
        self.socket = io.connect("192.168.0.101:4450");

        // 소켓 접속 완료 시 이벤트
        self.socket.on('connection', function(data) {
            if (data.type === 'connected') {
                self.socket.emit('connection', sock_info);
            }
        });

        // 소켓 통신 중 시스템 이벤트 감지 시
        self.socket.on('system', function(data) {
            console.log(data);
            // self.socket.emit('user', { name: "SERVER", message: this_member_info["NAME"] + " " + this_member_info["MEMBER_TITLE_NAME"] + "님이 채팅에 접속 하였습니다.", });
        });

        // 소켓 통신 중 메세지 이벤트 감지
        self.socket.on('message', function(data) {
            self.socketMsgDetection(data);
        });
    }

    Plugin.prototype.socketMsgDetection = function(socket_data) {
        if (!socket_data) return false;

        var form_data = {},
            func      = "",
            url       = "";

        switch (socket_data.type) {
            case 10:    //feedback chat msg append
                if ($(".feedback-chat-list").length > 0) {
                    var last_item = $(".chat-item-div").last().data("seq") || "";

                    url       = "/works/cglist/task_feedback_append_list";
                    func      = "socketMsgFeedbackAppend";
                    form_data = {
                        project_seq       : this.getUrlParams("project_seq"),
                        mathod            : "feedback",
                        task_seq          : $(".feedback-item.active").data("task_seq"),
                        task_feedback_seq : last_item,
                    };
                }
                break;
        }

        var loader_options = {
            target        : "div.tab-menu",
            type          : "inner",
            float         : "right",
            spin_second   : "0.5s",
            width         : "23px",
            height        : "23px",
            loader_margin : "5px",
        };

        return this.func("ajax", {
            url            : url,
            func           : func,
            data           : form_data,
            loader_options : loader_options,
        });

    }

    /** * ----------------------------------------------------------------------
     * Add item when socket feedback event occurs / 소켓 피드백 이벤트 발생 시 아이템 추가
     * @param {object} chat_data
     * -----------------------------------------------------------------------*/
    Plugin.prototype.socketMsgFeedbackAppend = function(chat_data) {
        if (!chat_data.hasOwnProperty("THIS_MEMBER_SEQ")) return false;

        delete chat_data["info"];
        delete chat_data["THIS_MEMBER_SEQ"];

        var ul = $(".feedback-chat-list").find("UL");

        for (var i in chat_data) {
            var chat_li = this.makeMsgItem(chat_data[i]);
            ul.append(chat_li);
        }

        $(".feedback-chat-list")
            .animate({
                scrollTop: $(".feedback-chat-list > ul")[0].scrollHeight
            })
            .focus();
        return window.mediaView.init();
    }

    /** * ----------------------------------------------------------------------
     * Set Feedback Tab in Deatail-View
     * 디테일뷰 - 탭 - Feedback UI 구성 및 이벤트 부여
     * @param {object} task_list_data
     * -----------------------------------------------------------------------*/
    Plugin.prototype.setTabFeedback = function(task_list_data) {
        var self = this;
        var info = task_list_data.info;

        delete task_list_data["info"];

        var feedback_list = document.createElement("DIV");
        feedback_list.className = "feedback-list";

        var feedback_item_list = document.createElement("DIV");
        feedback_item_list.className = "feedback-item-list";

        task_list_data.forEach(function(task) {
            var task_item = self.makeFeedbackItem(task);
            feedback_item_list.appendChild(task_item);
        });

        var feedback_chat         = document.createElement("DIV");
        feedback_chat.className   = "feedback-chat";
        feedback_chat.dataset.seq = "";
        feedback_chat.innerHTML   = "데이터가 없습니다.";

        feedback_list.appendChild(feedback_item_list);
        feedback_list.appendChild(feedback_chat);

        $(".body-tab-body-div")
            .html("")
            .append(feedback_list);
    };

    // feedback chat
    Plugin.prototype.setChatView = function(chat_data) {
        var self = this;

        delete chat_data["info"];
        delete chat_data["THIS_MEMBER_SEQ"];

        var feedback_chat_list = document.createElement("DIV");
        feedback_chat_list.className = "feedback-chat-list";

        var msg_ul = document.createElement("UL");

        if (chat_data.length != 0)
        {
            for (var i in chat_data) {
                var chat_li = this.makeMsgItem(chat_data[i]);
                msg_ul.appendChild(chat_li);
            }
        }

        feedback_chat_list.appendChild(msg_ul);

        var feedback_chat_input = document.createElement("DIV");
        feedback_chat_input.className = "feedback-chat-input";
        feedback_chat_input.innerHTML =
            '<form id="send-message-form" name="send-message-form" onsubmit="return false;" data-id="message-form">' +
            '  <div class="input-group">' +
            '      <span class="input-group-btn">' +
            '          <div id="btn-open-form" class="btn btn-default btn-sm">' +
            '      <span class="glyphicon glyphicon-paperclip"></span></div></span>' +
            '      <input type="text" class="form-control input-sm" name="message" id="text-upload-input" placeholder="메세지를 입력해주세요.">' +
            '      <span class="input-group-btn">' +
            '          <a id="btn-send-msg" class="btn btn-primary btn-sm">&nbsp;Send&nbsp;</a>' +
            '      </span>' +
            '  </div>' +
            '</form>';

        $(".feedback-chat")
            .html("")
            .append(feedback_chat_list)
            .append(feedback_chat_input);

        return (function () {
            // feedback event start
            $("#btn-open-form").on("click", function () {
                self.detailMsgEditor({
                    cglist_seq : $(".detail-div").data("cglist_seq"),
                    tab        : "feedback",
                });
            });

            $("#btn-send-msg").on("click", function () {
                var contents  = $("#text-upload-input").val();
                if (contents != "")
                {
                    var form_data = new FormData();
                    form_data.append('contents', contents);
                    self.sendMessage("feedback", form_data);
                }
                else
                {
                    alert("메세지를 입력해주세요.")
                }
                $("#text-upload-input").val("");
            });

            $("#send-message-form").submit(function() {
                $("#btn-send-msg").trigger('click');
            });

            var sock_info = {
                type: "join",
                name: this_member_info["NAME"] + " " + this_member_info["MEMBER_TITLE_NAME"],
                room: $(".feedback-item.active").data("task_seq"),
            };

            window.mediaView.init();

            self.connectSocketServer(sock_info);
            // feedback event end
        })();
    }

    /** * ----------------------------------------------------------------------
     * Generate Feedback Item / 피드백 아이템 생성
     * @param {object} chat_item
     * @return {element} item DIV
     * -----------------------------------------------------------------------*/
    Plugin.prototype.makeMsgItem = function(chat_item) {
        if (chat_item.length == 0) return false;

        if (!chat_item.hasOwnProperty("SEQ"))
        {   // socket event
            var chat_item = chat_item[0];
        }

        //member_seq
        var chat_li           = document.createElement("LI");
        var div               = document.createElement("DIV");
        div.className         = "chat-item-div";
        div.dataset.seq       = chat_item["SEQ"];

        var fixed             = document.createElement("DIV");
        fixed.className       = "chat-item-div-fixed";

        var variable          = document.createElement("DIV");
        variable.className    = "chat-item-div-var";

        var profile_div       = document.createElement("DIV");
        profile_div.className = "chat-item-thum";

        var img               = this.getProfileImage(chat_item["PROFILE_IMG_INFO"]);

        profile_div.appendChild(img);
        fixed.appendChild(profile_div);

        var msg_header       = document.createElement("DIV");
        msg_header.className = "msg-header";

        var name             = document.createElement("SPAN");
        name.className       = "name";
        name.innerHTML       = chat_item["MEMBER_NAME"];

        var date             = document.createElement("SPAN");
        date.className       = "date";
        date.innerHTML       = chat_item["ADD_DATE"];

        msg_header.appendChild(name);
        msg_header.appendChild(date);

        var msg_body            = document.createElement("DIV");
        msg_body.className      = "msg-body";

        var text                = document.createElement("DIV");
        try {
            var data            = JSON.parse(chat_item["CONTENTS"]);
            var cell_data       = document.createElement("P");
            cell_data.innerHTML = data["CELL_DATA"];
            if (data.hasOwnProperty("IMG_INFO"))
            {
                var img = this.getContentsElem(data);
                img.dataset.type = "";
                text.appendChild(img);
            }
            text.appendChild(cell_data);
        } catch (e) {
            text.innerHTML = "";
        }

        msg_body.appendChild(text);

        variable.appendChild(msg_header);
        variable.appendChild(msg_body);

        if (member_seq == chat_item["MEMBER_SEQ"])
        {   // right
            name.className       = "name pull-right";
            name.style.float     = "right";
            text.style.textAlign = "right";
            div.appendChild(variable);
            div.appendChild(fixed);
        }
        else
        {   // left
            date.className   = "date";
            date.style.float = "right";
            div.appendChild(fixed);
            div.appendChild(variable);
        }
        chat_li.appendChild(div);

        return chat_li;
    }

    /** * ----------------------------------------------------------------------
     * Create feedback task list element / 피드백 업무 리스트 엘리먼트 생성
     * @param {array} f_item
     * @return {element} list-item DIV
     * -----------------------------------------------------------------------*/
    Plugin.prototype.makeFeedbackItem = function(f_item) {
        var self = this;
        /* makes feedback - task member box contents */
        var task_item              = document.createElement("DIV");
        task_item.className        = "feedback-item";
        task_item.dataset.task_seq = f_item["SEQ"];
        task_item.onclick          = function ()
        {
            $(".feedback-item").removeClass('active');
            $(this).addClass('active');

            var loader_options = {
                target       : ".feedback-chat",
                type         : "outer",
                spin_second  : "0.5s",
                border       : "15px",
                width        : "20px",
                height       : "20px",
                in_color     : "#838383",
                out_color    : "rgba(255, 255, 255, 0.7)",
                dim_color    : "white",
            };

            return self.func("ajax", {
                url             : "/works/cglist/task_feedback_list",
                func            : "setChatView",
                data            : {
                    task_seq    : $(this).data("task_seq"),
                    project_seq : self.getUrlParams("project_seq"),
                },
                loader_options  : loader_options,
            });
        };

        var item_left        = document.createElement("DIV");
        item_left.className  = "feedback-item-left";

        var item_right       = document.createElement("DIV");
        item_right.className = "feedback-item-right";

        /* box left contents */
        var img_div          = document.createElement("DIV");
        img_div.className    = "item-thumb-div";

        // var img           = this.getContentsElem(f_item);
        var img              = document.createElement("IMG");
        img.className        = "item-thumb";
        img.src              = "/assets/img/no_image_150x100.gif";

        /* box right contents */
        var p_info       = document.createElement("P");
        p_info.innerHTML = "SCENE / "+f_item["MEMBER_NAME"];
        var p_date       = document.createElement("P");
        if (f_item["TASK_STATUS_SEQ"] == 1) // RDY 대기
        {
            p_date.innerHTML = f_item["TASK_TYPE_NAME"];
        }
        else
        {
            p_date.innerHTML = f_item["TASK_TYPE_NAME"]+"<br/>2017-06-11~2017-08-22";
        }
        var progress       = document.createElement("DIV");
        progress.className = "progress"
        progress.innerHTML   = '<div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" '
        +'aria-valuemax="100" style="font-size: 11px;width:20%;">0%</div>';

        /* append contents */
        img_div   .appendChild(img);
        item_left .appendChild(img_div);

        item_right.appendChild(p_info);
        item_right.appendChild(p_date);
        item_right.appendChild(progress);

        task_item .appendChild(item_left);
        task_item .appendChild(item_right);

        return task_item;
    }

    Plugin.prototype.detailViewClose = function() {
        if ($(".detail-wapper-div").length > 0)
        {
            $(".detail-wapper-div").remove();
            $("TR").removeClass('active');

            // socket disconnect
            if (this.socket)
            {
                this.socket.disconnect();
                delete this["socket"];
            }
        }
    };

    // Get ContextMenu List / 컨텍스트메뉴 리스트 얻기
    Plugin.prototype.getMenuList = function(s_cell) {
        var self      = this;
        var type      = s_cell.data("type");
        var item_list = [
            {
                itemName : "addRowTop",
                comment  : "위에 행 추가",
                type     : "basic",
                func     : function ()
                {
                    self.rowController(s_cell, 0);
                },
            },
            {
                itemName : "addRowBottom",
                comment  : "아래에 행 추가",
                type     : "basic",
                func     : function ()
                {
                    self.rowController(s_cell, 1);
                },
            },
            {
                itemName : "removeRow",
                comment  : "행 삭제",
                type     : "basic",
                func     : function ()
                {
                    self.rowController(s_cell, 2);
                },
            },
            {
                itemName : "allSave",
                comment  : "저장하기",
                type     : "basic",
                func     : function ()
                {
                    self.allSave();
                },
            },
            {
                itemName : "detailView",
                comment  : "자세히 보기",
                type     : "basic",
                func     : function ()
                {
                    self.detailView(s_cell, "open");
                },
            },
        ];
        // column type menu / 컬럼 타입에 따라 컨텍스트 메뉴 추가
        switch (type) {
            case "textarea":
                item_list.push({
                    itemName : "editFileText",
                    comment  : "파일 & 텍스트 수정",
                    type     : "col-event",
                    func     : function ()
                    {
                        self.editFileText(s_cell);
                    }
                });
                break;
            case "member":
                item_list.push({
                    itemName : "editTaskMember",
                    comment  : "업무회원 변경",
                    type     : "col-event",
                    func     : function ()
                    {
                        self.editTaskMember(s_cell);
                    }
                });
                break;
            case "link":
                item_list.push({
                    itemName : "changeLink",
                    comment  : "링크 변경",
                    type     : "col-event",
                    func     : function ()
                    {
                        self.changeLink(s_cell);
                    }
                });
                break;
            case "media":
                item_list.push({
                    itemName : "changeImage",
                    comment  : "이미지 변경",
                    type     : "col-event",
                    func     : function ()
                    {
                        self.changeImage(s_cell);
                    }
                });
                break;
        }

        return item_list;
    };
    /** * ----------------------------------------------------------------------
     * Cell Selector (Core function)
     * 해당 셀에 클릭 또는 방향키 이벤트가 발생 시 셀의 CSS 및 스크롤 위치를 조정.
     * @param {string} cell_id
     * -----------------------------------------------------------------------*/
    Plugin.prototype.setSelectCell = function(cell_id) {
        var s_cell     = $("TD#"+cell_id);

        if ($(".jsheet-text").length > 0)
        {
            this.func("save",$(".selected").attr("id"));
        }

        // select class init
        $(this.element).find("TD").removeClass('selected');

        if (s_cell.length > 0)
        {
            //select this cell
            s_cell.addClass('selected');

            // Adjust the scroll position according to cell focus / 셀 좌표에 따라 스크롤 위치 조정
            var table                = $(".jsheet-table-body"),
                c_table_w            = $(".jsheet-table-body-fixed").width(),
                el_outer_size        = 15,
                scroll               = 0,
                cell_offset          = s_cell.offset(),
                cell_position        = s_cell.position(),
                table_scroll_top     = table.scrollTop(),
                table_scroll_left    = table.scrollLeft(),
                table_height         = parseInt(table.outerHeight()) - el_outer_size,
                scroll_left          = parseInt(table.width()-cell_offset.left);

            // arrow top
            if (cell_position.top < 0)
            {
                scroll = table_scroll_top + cell_position.top - 1;
                table.scrollTop(scroll);
            }
            // arrow bottom
            if (cell_position.top + s_cell.outerHeight() > table_height)
            {
                scroll = table_scroll_top + (cell_position.top + s_cell.outerHeight() - table_height) + 1;
                table.scrollTop(scroll);
            }
            // arrow right
            if (scroll_left < s_cell.outerWidth())
            {
                scroll = (table_scroll_left + (scroll_left*(-1))+el_outer_size)+s_cell.outerWidth() + 1;
                table.scrollLeft(scroll);
            }
            // arrow left
            if (scroll_left > (table.width()-c_table_w))
            {
                scroll = table_scroll_left + ((table.width()-c_table_w) - scroll_left) - 1;
                table.scrollLeft(scroll);
            }
        }
    };

    /** * ----------------------------------------------------------------------
    * Scroll Sync / 스크롤 동기화
    * -----------------------------------------------------------------------*/
    Plugin.prototype.setSyncScroll = function() {
        // table horizontal&vertical 스크롤 동기화(scroll sync)
        $(".jsheet-table-body").scroll(function(event) { // origin => clone
            $(".jsheet-table-header").scrollLeft($(this).scrollLeft());
            $(".jsheet-table-body-fixed").scrollTop($(this).scrollTop());
        });
        $(".jsheet-table-body-fixed").on('mousewheel DOMMouseScroll', function(event) { // clone => origin
             var E      = event.originalEvent;
             var scroll = $(this).scrollTop();
             var delta  = (E.wheelDelta)*(-1);
             return $(".jsheet-table-body").scrollTop(scroll+delta);
        });

        // table cell height 동기화 (original - cloned table)
        $(".jsheet-table-body").find("tr").each(function(index, el) {
            $(".jsheet-table-body-fixed")
                .find("tr:nth-child("+(index+1)+")")
                .outerHeight($(el).outerHeight());
            // $( ".fixed-cell:nth-child("+index+")" ).outerHeight($(el).outerHeight());
        });
    };

    /** * ----------------------------------------------------------------------
     * AJAX
     * 플러그인 AJAX 함수
     * @param {object} info
     *
     * @return {function} Return Calling functions within plugin and result data
     * -----------------------------------------------------------------------*/
    Plugin.prototype.ajax = function(info) {
        // if (typeof(info.url) == "undefined") return false;

        var _plugin = this;

        var ajax_options = {
            type      : "POST",
            dataType  : this.options.dataType,
            url       : info.url,
            data      : info.data,
            beforeSend: function() {
                window.loader.create(info.loader_options);
            },
            success   : function(result) {
                if (typeof(result) != "object")
                {
                    result = { result : result, info : info, }
                }
                if (info.hasOwnProperty("func"))
                {
                    result["info"] = info;
                    _plugin.func(info.func, result);
                }
            },
            complete  : function() {
                window.loader.remove();
            },
        };

        // form data 일 경우
        if (info.data != null && info.data.constructor.name == "FormData")
        {
            ajax_options = $.extend({}, ajax_options,
                {
                    processData: false,
                    contentType: false,
                    dataType    : "json",
                }
            );
        }

        // IE11 일 경우 동기식으로 변경 / 크로스브라우징
        if (
            'Netscape'          == navigator.appName  &&
            -1                  != navigator.userAgent.search('Trident') &&
            "[object FormData]" == info["data"].toString()
           )
        {
            ajax_options = $.extend( true,
                ajax_options, {
                    async       : false,
                    processData : false,
                    contentType : false,
                }
            );
        };

        // excute AJAX
        $.ajax(ajax_options);
    };

    /** * ----------------------------------------------------------------------
     * Functions for function calls in plugin
     * How to use(사용법) - this.func(funcionName, data)
     * @param {string} funcName
     * @param {object} data
     *
     * @return {function} Return Calling functions within plugin
     * -----------------------------------------------------------------------*/
    Plugin.prototype.func = function(funcName, data) {
        return this[funcName](data);
    };

    /** * ----------------------------------------------------------------------
     * 생성자(예. new Plugin()) 주변에 여러개의 인스턴스 생성을 방지하기 위해
     * 가벼운 플러그인 래퍼를 설정합니다.
     * data 메소드를 이용하여 cache 해 두게 됩니다.
     * (한번 생성된 인스턴스는 더이상 같은 인스턴스를 생성하지 않도록 하기 위함입니다.)
     * -----------------------------------------------------------------------*/
    $.fn[pluginName] = function(options) {
        return this.each(function() {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                    new Plugin(this, options));
            }
        });
    }

})(jQuery, window, document);