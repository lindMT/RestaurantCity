const removeDishBtn = document.getElementById('removeDishBtn');

function deleteRow() {
  const selectedCheckboxes = document.querySelectorAll('#dishTable .select:checked');
  selectedCheckboxes.forEach(checkbox => {
    const row = checkbox.closest('tr');
    row.remove();
  });

  // Check if any checkboxes are selected
  const checkboxes = document.querySelectorAll('#dishTable .select');
  const disableButton = selectedCheckboxes.length === 0;

  // Disable or enable the button based on the selection
  removeDishBtn.disabled = disableButton;
}

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