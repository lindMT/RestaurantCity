function filterReport(){
    var clickedType = document.getElementById("filterType").value;
    var table = document.getElementById("report-table");
    var n = table.rows.length;

    for (var r = 1; r < n; r++) {
        var type = table.rows[r].cells[0].innerHTML;


        if (clickedType === "All" || clickedType === type){
            table.rows[r].style.display = "table-row";
        } else{
            table.rows[r].style.display = "none";
        }
    }
}
