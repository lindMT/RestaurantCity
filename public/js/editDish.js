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

  function generateRow(ingredients, units) {
    // Create the HTML/EJS code using a template literal

    const code = `
      <div id="form-row">
        <div id="form-row-content" style="display: flex;">
          <div class="form-ingredients">
            <label for="ingredient">Ingredients</label>
            <select class="form-select" id="ingredient" name="ingredient" aria-label="Default select example" required>
              <option disabled selected value>Select Ingredient</option>
              <!-- TODO: Backend -->
              <% if(ingredients.length > 0) {%>
                <% ingredients.forEach(ingredients => { %> 
                    <option style=text-transform:capitalize value="<%= ingredients.name %>"><%= ingredients.name %></option>
                <% }) %> 
              <% } %>
            </select>
          </div>
  
          <div class="form-group" style="margin-left: 13px;">
            <label for="inputAmt">Amount</label>
            <input type="number" class="form-control" name="inputAmount" id="inputAmt" placeholder="1" min="1" required>
          </div>
  
          <div class="form-unit" style="margin-left: 10px;">
            <label for="ingreUnits">Unit</label>
            <select class="form-select" name="selectUnit" id="ingreUnits" aria-label="Default select example" required>
              <option disabled selected value>Select Unit</option>
              <% if(units.length > 0) {%>
                <% units.forEach(units => { %> 
                    <option style=text-transform:capitalize value="<%= units.unitName %>"><%= units.unitName %></option>
                <% }) %> 
              <% } %>
              <!-- TODO: Backend -->
            </select>
          </div>
  
          <div class="form-row-buttons" style="align-items: last baseline;">
            <!-- Remove Ingredient Button -->
            <button class="btn btn-danger" onclick="removeForm(this)" id="removeIngredientBtn"> x </button>
            <!-- Add Ingredient Button -->
            <button class="btn btn-light" id="addIngredientBtn" onclick="duplicateForm();"> + </button>
          </div>
        </div>
      </div>
    `;
  
    return code;
  }