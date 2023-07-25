function addInputFields(){
    
}

const parentDiv = document.getElementById('form-row');

function duplicateForm() {
  let formRow = document.createElement('div');
  formRow.className = 'form-row';

  let formRowContent = document.getElementById('form-row-content').cloneNode(true);

  // Remove all label elements
  const labels = formRowContent.querySelectorAll('label');
  labels.forEach((label) => {
    label.remove();
  });

  formRow.appendChild(formRowContent);

  parentDiv.appendChild(formRow);

  // To have a margin when adding new Ingredient form
  formRow.style.marginTop = '10px';

}

function removeForm(button) {
    // Find the parent form row element
    const formRow = button.closest('.form-row');
  
    // Remove the form row element
    formRow.remove();
  }

  // ----- Make the forms sticky ------
  const inputElements = document.querySelectorAll('.form-control');
  const selectElements = document.querySelectorAll('select.form-select');

  inputElements.forEach((inputElement) => {
    inputElement.addEventListener('input', () => {
      const inputValue = inputElement.value;
      const inputName = inputElement.name;
      localStorage.setItem(inputName, inputValue);
    });
  });

  selectElements.forEach((selectElement) => {
    selectElement.addEventListener('change', () => {
      const selectedValue = selectElement.value;
      const selectName = selectElement.name;
      localStorage.setItem(selectName, selectedValue);
    });
  });

  // Load the form data from localStorage when the page loads
  window.addEventListener('load', () => {
    inputElements.forEach((inputElement) => {
      const inputName = inputElement.name;
      const storedValue = localStorage.getItem(inputName);
      if (storedValue !== null) {
        inputElement.value = storedValue;
      }
    });

    selectElements.forEach((selectElement) => {
      const selectName = selectElement.name;
      const storedValue = localStorage.getItem(selectName);
      if (storedValue !== null) {
        selectElement.value = storedValue;
      }
    });
  });

  // Remove event listeners after form submission to prevent further updates to localStorage
  const form = document.querySelector('.user-form');
  form.addEventListener('submit', () => {
    inputElements.forEach((inputElement) => {
      inputElement.removeEventListener('input', updateLocalStorage);
    });

    selectElements.forEach((selectElement) => {
      selectElement.removeEventListener('change', updateLocalStorage);
    });
  });
// -- End of form sticky --- 