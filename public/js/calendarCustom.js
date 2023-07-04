
$("#start_date").datepicker({
    autoclose: true,
    format :'mm/dd/yyyy',
    forceParse :false
});


$("#end_date").datepicker({
    autoclose: true,
    format :'mm/dd/yyyy',
    forceParse :false
});


// $('#start_date').change(function() {
//     startDate = $(this).datepicker('getDate');
//     $("#end_date").datepicker("option", "minDate", startDate);
// })

// $('#end_date').change(function() {
//     endDate = $(this).datepicker('getDate');
//     $("#start_date").datepicker("option", "maxDate", endDate);
// })