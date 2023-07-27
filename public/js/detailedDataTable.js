
$(document).ready( function () {
    $('#report-table').DataTable({
        paging: true,
        drawCallback: function(settings){
            var api = this.api();
            var info = api.page.info();
            var pageCount = info.pages;
            var currPage = info.page;

            if (currPage == pageCount -1){
                var totalRows = api.data().length;
                var totalCols = api.columns().nodes().length;
                var rows = api.rows().nodes();
                var last = rows[totalRows -1];

                $(last).after(
                    "<tr id='report_end'><td colspan='"+ totalCols +"'><h5><b>-END OF REPORT-</b></h5></td></tr>"
                );
            }else{
                $('#report_end').remove();
            }
        }
    });
} );