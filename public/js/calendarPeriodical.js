// Disable submit button
$("#submitbtn").prop("disabled", true);




// Date generated
const date = new Date().toLocaleString();
document.getElementById("current_date").innerHTML = date;
document.getElementById("current_date2").innerHTML = date;

// Report Type
function reportType(value) {
  // Disable if reportType was changed
  $("#filterTypeId").change(function() {
    $('#calendar').val('');
    $("#submitbtn").prop("disabled", true);
  });

  // Enable if value is found
  $("#calendar").change(function() {
    if ($("#calendar").val() !== "") {
      $("#submitbtn").prop("disabled", false);
  } else {
      $("#submitbtn").prop("disabled", true);
  }
  });
  switch(value) {
    case "1":
      dayRange();
      break;
    case "2":
      weeklyRange();
      break;
    case "3":
      monthlyRange();
      break;
    case "4":
      yearlyRange();
      break;
    default:
  }
 
 
}

// DAILY
function dayRange() {
  $('#calendar').off("changeDate");
  $('#calendar').datepicker("destroy");
  $('#calendar').datepicker({
    autoclose: true,
    format :'mm/dd/yyyy',
    forceParse :false
  })
}

// WEEKLY
function weeklyRange() {
  $('#calendar').datepicker("destroy");
  var startDate, endDate;
  $('#calendar').datepicker({
    autoclose: true,
    format :'mm/dd/yyyy',
    forceParse :false
  }).on("changeDate", function(e) {
      //console.log(e.date);
      var date = e.date;
      startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
      endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay()+6);
      //$('#calendar').datepicker("setDate", startDate);
      $('#calendar').datepicker('update', startDate);
      $('#calendar').val((startDate.getMonth() + 1) + '/' + startDate.getDate() + '/' +  startDate.getFullYear() + ' - ' + (endDate.getMonth() + 1) + '/' + endDate.getDate() + '/' +  endDate.getFullYear());
  });
}

// MONTHLY
function monthlyRange() {
  $('#calendar').datepicker("destroy");
  $('#calendar').datepicker( {
    autoclose: true,
    format: "mm-yyyy",
    startView: "months", 
    minViewMode: "months"
  });
}

// ANNUALLY
function yearlyRange() {
  $('#calendar').datepicker("destroy");
  $('#calendar').datepicker( {
    autoclose: true,
    formatDate: "yyyy",
    startView: "years", 
    minViewMode: "years"
  }).on("changeDate", function(e) {
    var date = e.date;
    var dateYear = date.getFullYear();
    $('#calendar').innerHTML = dateYear;
  });
}