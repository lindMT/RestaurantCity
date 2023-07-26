// Disable submit button
$("#submitbtn").prop("disabled", true);

// Date generated
const date = new Date().toLocaleString();
document.getElementById("current_date").innerHTML = date;

// Report Type
function reportType(value) {
  // Disable if reportType was changed
  $("#filterTypeId").change(function() {
    $('#calendar').val('');
    $("#submitbtn").prop("disabled", true);
  });

  // Enable if value is found
  $("#calendar").change(function() {
    var selectedid  = $(".id option:selected").val();
    
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

$('a').attr('href','/detailedReport/<%= ingre._id %>/'+selectedid);
// DAILY
function dayRange() {
  $('#calendar').off("changeDate");
  $('#calendar').datepicker("destroy");
  $('#calendar').datepicker({
    autoclose: true,
    format :'mm/dd/yyyy',
    forceParse :false,
    // DB Implementation: starting date should be up until oldest record only then insert here (distinct years + 1)
    startDate: "-3y"
  })
}

// WEEKLY
function weeklyRange() {
  $('#calendar').off("changeDate");
  $('#calendar').datepicker("destroy");
  var startDate, endDate;
  $('#calendar').datepicker({
    autoclose: true,
    format :'mm/dd/yyyy',
    forceParse :false,
    // DB Implementation: starting date should be up until oldest record only then insert here (distinct years + 1)
    startDate: "-3y"
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
  $('#calendar').off("changeDate");
  $('#calendar').datepicker("destroy");
  $('#calendar').datepicker( {
    autoclose: true,
    format: "mm-yyyy",
    startView: "months", 
    minViewMode: "months",
    // DB Implementation: starting date should be up until oldest record only then insert here (distinct years + 1)
    startDate: "-3y"
  });
}

// ANNUALLY
function yearlyRange() {
  $('#calendar').off("changeDate");
  $('#calendar').datepicker("destroy");
  $('#calendar').datepicker( {
    autoclose: true,
    format: "mm-yyyy",
    startView: "years", 
    minViewMode: "years",
    // DB Implementation: starting date should be up until oldest record only then insert here (distinct years + 1)
    startDate: "-3y"
  }).on("changeDate", function(e) {
    var date = e.date;
    var dateYear = date.getFullYear();
    $('#calendar').innerHTML = dateYear;
  });

  // Work-around for showing year only: drop-down

//   const parentDiv = document.getElementById('calendar-div');
//   const form = document.getElementById('calendar');
//   form.remove();
//   let yearForm = document.createElement('select');
//   yearForm.setAttribute('id', 'calendar');
//   yearForm.classList.add('form-select');
//   yearForm.classList.add('form-select-md');

//   parentDiv.appendChild(yearForm);

// // value & text will be the existing, distinct years in the db
//   var years = [{value: '1', text: '2021'},
//                {value: '2', text: '2022'},
//                {value: '3', text: '2023'}];

//   years.forEach(function (year) {
//   var optionElement = document.createElement('option');
//   optionElement.appendChild(document.createTextNode(year.text));
//   optionElement.setAttribute('value', year.value);
//   yearForm.appendChild(optionElement);
// });
}