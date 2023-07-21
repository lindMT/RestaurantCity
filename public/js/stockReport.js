let minDate, maxDate;
 
// Custom filtering function which will search data in column four between two values
DataTable.ext.search.push(function (settings, data, dataIndex) {
    let min = minDate.val();
    let max = maxDate.val();
    let date = new Date(data[4]);
 
    if (
        (min === null && max === null) ||
        (min === null && date <= max) ||
        (min <= date && max === null) ||
        (min <= date && date <= max)
    ) {
        return true;
    }
    return false;
});
 
// Create date inputs
minDate = new DateTime('#start_date', {
    format: 'MMMM Do YYYY'
});
maxDate = new DateTime('#end_date', {
    format: 'MMMM Do YYYY'
});
 
// DataTables initialisation
let table = new DataTable('#custom-report');
 
// Refilter the table
document.querySelectorAll('#start_date, #end_date').forEach((el) => {
    el.addEventListener('change', () => table.draw());
});