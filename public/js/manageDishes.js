const removeDishBtn = document.getElementById('removeDishBtn');

// Checks if the checkbox is selected, if there are no checkboxes, the Remove Button is DISABLED
function handleCheckboxClick() {
  const checkedCheckboxes = document.querySelectorAll('#dishTable .select:checked');
  const disableButton = checkedCheckboxes.length === 0;
  removeDishBtn.disabled = disableButton;

  // Changes the color if the button is disabled or enabled
  removeDishBtn.classList.toggle('btn-secondary', disableButton);
  removeDishBtn.classList.toggle('btn-danger', !disableButton);
}

// Listen for checkbox change events
document.querySelectorAll('#dishTable .select').forEach(checkbox => {
  checkbox.addEventListener('change', handleCheckboxClick);
});