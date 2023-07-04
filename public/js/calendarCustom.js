// Date generated
const date = new Date().toLocaleString();
document.getElementById("current_date").innerHTML = date;


// Getting current date in yyyy-mm-dd format
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth() + 1; //January is 0!
var yyyy = today.getFullYear();
if (dd < 10) {
    dd = '0' + dd;
 }
 
 if (mm < 10) {
    mm = '0' + mm;
} 
 today = yyyy + '-' + mm + '-' + dd;

// Applying constraints
$("#start_date").change(function() {
    var selectedDate = $(this).val();
    $("#end_date").attr("min", selectedDate);
});
$("#start_date").attr("max", today);
$("#end_date").attr("max", today);


// Disable submit button
$("#submitbtn").prop("disabled", true);

// Enable if both have value
$("#start_date, #end_date").change(function() {
    if ($("#start_date").val() !== "" && $("#end_date").val() !== "") {
        $("#submitbtn").prop("disabled", false);
    } else {
        $("#submitbtn").prop("disabled", true);
    }
});