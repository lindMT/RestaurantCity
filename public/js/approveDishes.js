// const rejectDishBtn = document.getElementById('rejectDishBtn');
// const approveDishBtn = document.getElementById('approveDishBtn');

// // Checks if the checkbox is selected, if there are no checkboxes, the Remove Button is DISABLED
// function handleCheckboxClick() {
//   const checkedCheckboxes = document.querySelectorAll('#dishTable .select:checked');
//   const disableButton = checkedCheckboxes.length === 0;
//   rejectDishBtn.disabled = disableButton;
//   approveDishBtn.disabled = disableButton;

//   // Changes the color if the button is disabled or enabled
//   rejectDishBtn.classList.toggle('btn-secondary', disableButton);
//   rejectDishBtn.classList.toggle('btn-danger', !disableButton);

//   approveDishBtn.classList.toggle('btn-secondary', disableButton);
//   approveDishBtn.classList.toggle('btn-success', !disableButton);
// }

// // Listen for checkbox change events
// document.querySelectorAll('#dishTable .select').forEach(checkbox => {
//   checkbox.addEventListener('change', handleCheckboxClick);
// });