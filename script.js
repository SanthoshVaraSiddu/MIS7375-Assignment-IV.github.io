// Program name: script.js
// Author: Your Name Here
// Date created: 10/20/2025
// Date last edited: 11/29/2025
// Version: 4.0
// Description: External JavaScript for Patient Registration Form - Homework 4

let formErrors = {};
let ssnActualValue = "";
let lastSSNMaskedLength = 0;
let sessionSecondsRemaining = 600;
let sessionTimerId = null;

function showCurrentDate() {
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const now = new Date();
    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const day = now.getDate();
    const year = now.getFullYear();
    const formatted = dayName + ", " + monthName + " " + day + ", " + year;
    const el = document.getElementById("current-date");
    if (el) {
        el.textContent = formatted;
    }
}

function startLiveClock() {
    const el = document.getElementById("live-time");
    if (!el) return;
    function updateClock() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2,"0");
        const m = String(now.getMinutes()).padStart(2,"0");
        const s = String(now.getSeconds()).padStart(2,"0");
        el.textContent = "Current time: " + h + ":" + m + ":" + s;
    }
    updateClock();
    setInterval(updateClock, 1000);
}

function setDateLimits() {
    const today = new Date();
    const maxDate = today.toISOString().split("T")[0];
    const minDateObj = new Date();
    minDateObj.setFullYear(today.getFullYear() - 120);
    const minDate = minDateObj.toISOString().split("T")[0];
    const dobField = document.getElementById("dob");
    if (dobField) {
        dobField.setAttribute("max", maxDate);
        dobField.setAttribute("min", minDate);
    }
}

function showError(fieldName, message) {
    formErrors[fieldName] = message;
    const errorSpan = document.getElementById(fieldName + "-error");
    if (errorSpan) {
        errorSpan.textContent = message;
        errorSpan.style.display = "block";
    }
    updateSubmitButton();
}

function clearError(fieldName) {
    delete formErrors[fieldName];
    const errorSpan = document.getElementById(fieldName + "-error");
    if (errorSpan) {
        errorSpan.textContent = "";
        errorSpan.style.display = "none";
    }
    updateSubmitButton();
}

function updateSubmitButton() {
    const submitBtn = document.getElementById("submit-btn");
    const errorCount = Object.keys(formErrors).length;
    const allRequiredFieldsFilled = checkAllRequiredFields();
    if (submitBtn) {
        if (errorCount > 0 || !allRequiredFieldsFilled) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.5";
            submitBtn.style.cursor = "not-allowed";
            submitBtn.title = "Please fill all required fields correctly before submitting";
        } else {
            submitBtn.disabled = false;
            submitBtn.style.opacity = "1";
            submitBtn.style.cursor = "pointer";
            submitBtn.title = "Submit the form";
        }
    }
}

function checkAllRequiredFields() {
    const form = document.getElementById("patient-form");
    if (!form) return false;

    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const dob = form.dob.value;
    const email = form.email.value.trim();
    const phone = form.phone.value.replace(/[^0-9]/g, "");
    const address1 = form.address1.value.trim();
    const city = form.city.value.trim();
    const state = form.state.value;
    const zip = form.zip.value.replace(/[^0-9]/g, "");
    const userId = form.userId.value.trim();
    const password = form.password.value;
    const repassword = form.repassword.value;
    const genderChecked = form.querySelector("input[name='gender']:checked");

    return (
        firstName &&
        lastName &&
        dob &&
        ssnActualValue.length === 9 &&
        email &&
        phone.length === 10 &&
        address1 &&
        city &&
        state &&
        zip.length === 5 &&
        userId &&
        password &&
        repassword &&
        genderChecked !== null
    );
}

function formatSSN(input) {
    let currentValue = input.value;
    let currentLength = currentValue.length;

    if (currentLength > lastSSNMaskedLength) {
        const newChar = currentValue.charAt(currentLength - 1);
        if (/[0-9]/.test(newChar)) {
            if (ssnActualValue.length < 9) {
                ssnActualValue += newChar;
            }
        }
    } else if (currentLength < lastSSNMaskedLength) {
        ssnActualValue = ssnActualValue.slice(0, -1);
    }

    let maskedValue = "";
    for (let i = 0; i < ssnActualValue.length; i++) {
        maskedValue += "X";
        if (i === 2 || i === 4) {
            maskedValue += "-";
        }
    }

    input.value = maskedValue;
    lastSSNMaskedLength = maskedValue.length;
    validateSSN();
}

function validateSSN() {
    if (!ssnActualValue) {
        showError("ssn", "Social Security Number is required (9 digits).");
        return false;
    }
    if (ssnActualValue.length !== 9) {
        showError("ssn", "SSN must be exactly 9 digits.");
        return false;
    }
    if (!/^[0-9]{9}$/.test(ssnActualValue)) {
        showError("ssn", "SSN must contain only numbers.");
        return false;
    }
    clearError("ssn");
    return true;
}

function validateFirstName() {
    const field = document.querySelector("input[name='firstName']");
    const value = field.value.trim();
    if (!value) {
        showError("firstName", "First Name is required.");
        return false;
    }
    if (value.length < 1 || value.length > 30) {
        showError("firstName", "First Name must be 1-30 characters.");
        return false;
    }
    if (!/^[A-Za-z'-]+$/.test(value)) {
        showError("firstName", "First Name can only contain letters, hyphens, and apostrophes.");
        return false;
    }
    clearError("firstName");
    saveFieldToLocalStorage("firstName", value);
    return true;
}

function validateMiddleInitial() {
    const field = document.querySelector("input[name='middleInitial']");
    const value = field.value.trim();
    if (!value) {
        clearError("middleInitial");
        saveFieldToLocalStorage("middleInitial", "");
        return true;
    }
    if (value.length !== 1) {
        showError("middleInitial", "Middle Initial must be only 1 character.");
        return false;
    }
    if (!/^[A-Za-z]$/.test(value)) {
        showError("middleInitial", "Middle Initial must be a letter.");
        return false;
    }
    clearError("middleInitial");
    saveFieldToLocalStorage("middleInitial", value);
    return true;
}

function validateLastName() {
    const field = document.querySelector("input[name='lastName']");
    const value = field.value.trim();
    if (!value) {
        showError("lastName", "Last Name is required.");
        return false;
    }
    if (value.length < 1 || value.length > 30) {
        showError("lastName", "Last Name must be 1-30 characters.");
        return false;
    }
    if (!/^[A-Za-z'-2-5]+$/.test(value)) {
        showError("lastName", "Last Name can only contain letters, hyphens, apostrophes, and numbers 2-5.");
        return false;
    }
    clearError("lastName");
    saveFieldToLocalStorage("lastName", value);
    return true;
}

function validateDOB() {
    const field = document.getElementById("dob");
    const value = field.value;
    if (!value) {
        showError("dob", "Date of Birth is required.");
        return false;
    }
    const dob = new Date(value);
    const today = new Date();
    const maxAge = new Date();
    maxAge.setFullYear(today.getFullYear() - 120);
    if (dob > today) {
        showError("dob", "Date of Birth cannot be in the future.");
        return false;
    }
    if (dob < maxAge) {
        showError("dob", "Date of Birth cannot be more than 120 years ago.");
        return false;
    }
    clearError("dob");
    saveFieldToLocalStorage("dob", value);
    return true;
}

function validateEmail() {
    const field = document.querySelector("input[name='email']");
    let value = field.value.trim().toLowerCase();
    field.value = value;
    if (!value) {
        showError("email", "Email is required.");
        return false;
    }
    if (value.length > 50) {
        showError("email", "Email cannot exceed 50 characters.");
        return false;
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
        showError("email", "Email must be in format name@domain.tld.");
        return false;
    }
    clearError("email");
    saveFieldToLocalStorage("email", value);
    return true;
}

function validatePhone() {
    const field = document.getElementById("phone");
    const value = field.value;
    const digits = value.replace(/[^0-9]/g, "");
    if (!value) {
        showError("phone", "Phone Number is required.");
        return false;
    }
    if (digits.length !== 10) {
        showError("phone", "Phone Number must be exactly 10 digits.");
        return false;
    }
    if (!/^\d{3}-\d{3}-\d{4}$/.test(value)) {
        showError("phone", "Phone must be in format XXX-XXX-XXXX.");
        return false;
    }
    clearError("phone");
    saveFieldToLocalStorage("phone", value);
    return true;
}

function formatPhoneNumber(value) {
    const numbers = value.replace(/[^0-9]/g, "");
    if (numbers.length <= 3) {
        return numbers;
    } else if (numbers.length <= 6) {
        return numbers.slice(0, 3) + "-" + numbers.slice(3);
    } else {
        return (
            numbers.slice(0, 3) +
            "-" +
            numbers.slice(3, 6) +
            "-" +
            numbers.slice(6, 10)
        );
    }
}

function setupPhoneFormatting() {
    const phoneField = document.getElementById("phone");
    if (phoneField) {
        phoneField.addEventListener("input", function () {
            const cursorPosition = this.selectionStart;
            const oldLength = this.value.length;
            const oldValue = this.value;
            this.value = formatPhoneNumber(this.value);
            if (oldValue !== this.value) {
                const newLength = this.value.length;
                const newCursorPos = cursorPosition + (newLength - oldLength);
                this.setSelectionRange(newCursorPos, newCursorPos);
            }
            validatePhone();
        });
        phoneField.addEventListener("blur", validatePhone);
    }
}

function validateAddress1() {
    const field = document.querySelector("input[name='address1']");
    const value = field.value.trim();
    if (!value) {
        showError("address1", "Address Line 1 is required.");
        return false;
    }
    if (value.length < 2 || value.length > 30) {
        showError("address1", "Address Line 1 must be 2-30 characters.");
        return false;
    }
    clearError("address1");
    saveFieldToLocalStorage("address1", value);
    return true;
}

function validateAddress2() {
    const field = document.querySelector("input[name='address2']");
    const value = field.value.trim();
    if (!value) {
        clearError("address2");
        saveFieldToLocalStorage("address2", "");
        return true;
    }
    if (value.length < 2 || value.length > 30) {
        showError("address2", "Address Line 2 must be 2-30 characters if provided.");
        return false;
    }
    clearError("address2");
    saveFieldToLocalStorage("address2", value);
    return true;
}

function validateCity() {
    const field = document.querySelector("input[name='city']");
    const value = field.value.trim();
    if (!value) {
        showError("city", "City is required.");
        return false;
    }
    if (value.length < 2 || value.length > 30) {
        showError("city", "City must be 2-30 characters.");
        return false;
    }
    if (!/^[A-Za-z' -]+$/.test(value)) {
        showError("city", "City can only contain letters, spaces, hyphens, and apostrophes.");
        return false;
    }
    clearError("city");
    saveFieldToLocalStorage("city", value);
    return true;
}

function validateState() {
    const field = document.querySelector("select[name='state']");
    const value = field.value;
    if (!value) {
        showError("state", "State is required - please select from dropdown.");
        return false;
    }
    clearError("state");
    saveFieldToLocalStorage("state", value);
    return true;
}

function validateZip() {
    const field = document.getElementById("zip");
    const value = field.value;
    const digits = value.replace(/[^0-9]/g, "");
    if (!value) {
        showError("zip", "ZIP Code is required.");
        return false;
    }
    if (digits.length !== 5) {
        showError("zip", "ZIP Code must be exactly 5 digits.");
        return false;
    }
    if (!/^[0-9]{5}$/.test(digits)) {
        showError("zip", "ZIP Code must contain only numbers.");
        return false;
    }
    clearError("zip");
    saveFieldToLocalStorage("zip", digits);
    return true;
}

function formatZipCode(value) {
    const numbers = value.replace(/[^0-9]/g, "");
    return numbers.slice(0, 5);
}

function setupZipFormatting() {
    const zipField = document.getElementById("zip");
    if (zipField) {
        zipField.addEventListener("input", function () {
            const cursorPosition = this.selectionStart;
            const oldLength = this.value.length;
            this.value = formatZipCode(this.value);
            const newLength = this.value.length;
            const diff = newLength - oldLength;
            this.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
            validateZip();
        });
        zipField.addEventListener("blur", validateZip);
    }
}

function validateSymptoms() {
    clearError("symptoms");
    const form = document.getElementById("patient-form");
    if (form) {
        saveFieldToLocalStorage("symptoms", form.symptoms.value.trim());
    }
    return true;
}

function validateGender() {
    const genderChecked = document.querySelector("input[name='gender']:checked");
    if (!genderChecked) {
        showError("gender", "Gender selection is required.");
        return false;
    }
    clearError("gender");
    const form = document.getElementById("patient-form");
    if (form) {
        saveFieldToLocalStorage("gender", genderChecked.value);
    }
    return true;
}

function validateUserId() {
    const field = document.getElementById("userId");
    let value = field.value.trim();
    value = value.toLowerCase();
    field.value = value;
    if (!value) {
        showError("userId", "User ID is required.");
        return false;
    }
    if (value.length < 5 || value.length > 20) {
        showError("userId", "User ID must be 5-20 characters.");
        return false;
    }
    if (/^[0-9]/.test(value)) {
        showError("userId", "User ID cannot start with a number.");
        return false;
    }
    if (!/^[a-z0-9_-]+$/.test(value)) {
        showError("userId", "User ID can only contain letters, numbers, underscore, and dash (no spaces).");
        return false;
    }
    if (/\s/.test(value)) {
        showError("userId", "User ID cannot contain spaces.");
        return false;
    }
    clearError("userId");
    saveFieldToLocalStorage("userId", value);
    return true;
}

function validatePassword() {
    const field = document.getElementById("password");
    const value = field.value;
    const userId = document.getElementById("userId").value.toLowerCase();
    const firstName = document.querySelector("input[name='firstName']").value.toLowerCase();
    const lastName = document.querySelector("input[name='lastName']").value.toLowerCase();

    if (!value) {
        showError("password", "Password is required.");
        return false;
    }
    if (value.length < 8 || value.length > 30) {
        showError("password", "Password must be 8-30 characters.");
        return false;
    }
    if (!/[a-z]/.test(value)) {
        showError("password", "Password must include at least 1 lowercase letter.");
        return false;
    }
    if (!/[A-Z]/.test(value)) {
        showError("password", "Password must include at least 1 uppercase letter.");
        return false;
    }
    if (!/[0-9]/.test(value)) {
        showError("password", "Password must include at least 1 number.");
        return false;
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) {
        showError("password", "Password must include at least 1 special character.");
        return false;
    }
    if (/['"]/.test(value)) {
        showError("password", "Password cannot contain quotes.");
        return false;
    }
    if (value.toLowerCase() === userId) {
        showError("password", "Password cannot be the same as User ID.");
        return false;
    }
    if (value.toLowerCase() === firstName || value.toLowerCase() === lastName) {
        showError("password", "Password cannot be the same as your name.");
        return false;
    }
    clearError("password");
    return true;
}

function validateRePassword() {
    const passwordField = document.getElementById("password");
    const repasswordField = document.getElementById("repassword");
    const password = passwordField.value;
    const repassword = repasswordField.value;

    if (!repassword) {
        showError("repassword", "Please re-enter your password.");
        return false;
    }
    if (password !== repassword) {
        showError("repassword", "Passwords do not match.");
        return false;
    }
    clearError("repassword");
    return true;
}

function updateHealthScore() {
    const slider = document.getElementById("healthscore");
    const scoreDisplay = document.getElementById("score");
    if (slider && scoreDisplay) {
        slider.addEventListener("input", function () {
            scoreDisplay.textContent = this.value;
            saveFieldToLocalStorage("healthscore", this.value);
        });
    }
}

function reviewForm() {
    const isValid = validateAllFields();
    if (!isValid) {
        alert("Please fix all errors before reviewing the form.");
        return;
    }

    const form = document.getElementById("patient-form");
    const reviewContainer = document.getElementById("review-container");
    const reviewContent = document.getElementById("review-content");

    const firstName = form.firstName.value.trim();
    const middleInitial = form.middleInitial.value.trim();
    const lastName = form.lastName.value.trim();
    const dob = form.dob.value;
    const ssn = ssnActualValue;
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const address1 = form.address1.value.trim();
    const address2 = form.address2.value.trim();
    const city = form.city.value.trim();
    const state = form.state.value;
    const zip = form.zip.value.trim();
    const symptoms = form.symptoms.value.trim();

    const historyBoxes = form.querySelectorAll("input[name='history']:checked");
    const historyArray = Array.from(historyBoxes).map((box) => box.value);
    const historyText = historyArray.length > 0 ? historyArray.join(", ") : "None";

    const gender = form.querySelector("input[name='gender']:checked")?.value || "Not specified";
    const vaccinated = form.querySelector("input[name='vaccinated']:checked")?.value || "Not specified";
    const insurance = form.querySelector("input[name='insurance']:checked")?.value || "Not specified";
    const healthscore = form.healthscore.value;
    const userId = form.userId.value.trim();
    const password = form.password.value;

    let html = "";

    html += '<div class="review-section">';
    html += "<h3>Personal Information</h3>";
    html += '<div class="review-row"><span class="review-label">First Name</span><span class="review-value">' + firstName + '</span><span class="review-status pass">OK</span></div>';
    if (middleInitial) {
        html += '<div class="review-row"><span class="review-label">Middle Initial</span><span class="review-value">' + middleInitial + '</span><span class="review-status pass">OK</span></div>';
    }
    html += '<div class="review-row"><span class="review-label">Last Name</span><span class="review-value">' + lastName + '</span><span class="review-status pass">OK</span></div>';
    html += '<div class="review-row"><span class="review-label">Date of Birth</span><span class="review-value">' + dob + '</span><span class="review-status pass">OK</span></div>';
    html += '<div class="review-row"><span class="review-label">SSN</span><span class="review-value">***-**-' + ssn.slice(-4) + '</span><span class="review-status pass">OK</span></div>';
    html += "</div>";

    html += '<div class="review-section">';
    html += "<h3>Contact Information</h3>";
    html += '<div class="review-row"><span class="review-label">Email</span><span class="review-value">' + email + '</span><span class="review-status pass">OK</span></div>';
    html += '<div class="review-row"><span class="review-label">Phone</span><span class="review-value">' + phone + '</span><span class="review-status pass">OK</span></div>';
    html += '<div class="review-row"><span class="review-label">Address Line 1</span><span class="review-value">' + address1 + '</span><span class="review-status pass">OK</span></div>';
    if (address2) {
        html += '<div class="review-row"><span class="review-label">Address Line 2</span><span class="review-value">' + address2 + '</span><span class="review-status pass">OK</span></div>';
    }
    html += '<div class="review-row"><span class="review-label">City</span><span class="review-value">' + city + '</span><span class="review-status pass">OK</span></div>';
    html += '<div class="review-row"><span class="review-label">State</span><span class="review-value">' + state + '</span><span class="review-status pass">OK</span></div>';
    html += '<div class="review-row"><span class="review-label">ZIP Code</span><span class="review-value">' + zip + '</span><span class="review-status pass">OK</span></div>';
    html += "</div>";

    html += '<div class="review-section">';
    html += "<h3>Medical Information</h3>";
    html += '<div class="review-row"><span class="review-label">Medical History</span><span class="review-value">' + historyText + '</span><span class="review-status pass">OK</span></div>';
    html += '<div class="review-row"><span class="review-label">Gender</span><span class="review-value">' + gender + '</span><span class="review-status pass">OK</span></div>';
    html += '<div class="review-row"><span class="review-label">Vaccinated</span><span class="review-value">' + vaccinated + '</span><span class="review-status pass">OK</span></div>';
    html += '<div class="review-row"><span class="review-label">Insurance</span><span class="review-value">' + insurance + '</span><span class="review-status pass">OK</span></div>';
    html += '<div class="review-row"><span class="review-label">Health Score</span><span class="review-value">' + healthscore + '/10</span><span class="review-status pass">OK</span></div>';
    html += '<div class="review-row"><span class="review-label">Symptoms</span><span class="review-value">' + (symptoms || "None provided") + '</span><span class="review-status pass">OK</span></div>';
    html += "</div>";

    html += '<div class="review-section">';
    html += "<h3>User Credentials</h3>";
    html += '<div class="review-row"><span class="review-label">User ID</span><span class="review-value">' + userId + '</span><span class="review-status pass">OK</span></div>';
    html += '<div class="review-row"><span class="review-label">Password</span><span class="review-value">' + "*".repeat(password.length) + '</span><span class="review-status pass">OK</span></div>';
    html += "</div>";

    reviewContent.innerHTML = html;
    reviewContainer.style.display = "block";
    reviewContainer.scrollIntoView({ behavior: "smooth", block: "start" });
}

function validateAllFields() {
    let allValid = true;
    formErrors = {};

    if (!validateFirstName()) allValid = false;
    if (!validateMiddleInitial()) allValid = false;
    if (!validateLastName()) allValid = false;
    if (!validateDOB()) allValid = false;
    if (!validateSSN()) allValid = false;
    if (!validateEmail()) allValid = false;
    if (!validatePhone()) allValid = false;
    if (!validateAddress1()) allValid = false;
    if (!validateAddress2()) allValid = false;
    if (!validateCity()) allValid = false;
    if (!validateState()) allValid = false;
    if (!validateZip()) allValid = false;
    if (!validateGender()) allValid = false;
    if (!validateUserId()) allValid = false;
    if (!validatePassword()) allValid = false;
    if (!validateRePassword()) allValid = false;

    updateSubmitButton();
    return allValid;
}

function clearForm() {
    if (confirm("Are you sure you want to clear all form data?")) {
        document.getElementById("patient-form").reset();
        const reviewContainer = document.getElementById("review-container");
        if (reviewContainer) {
            reviewContainer.style.display = "none";
        }
        const scoreEl = document.getElementById("score");
        if (scoreEl) scoreEl.textContent = "5";
        ssnActualValue = "";
        lastSSNMaskedLength = 0;
        formErrors = {};
        const errorSpans = document.querySelectorAll(".error-message");
        errorSpans.forEach((span) => {
            span.textContent = "";
            span.style.display = "none";
        });
        updateSubmitButton();
        clearAllLocalStorageData();
    }
}

function validateFormOnSubmit(event) {
    const allValid = validateAllFields();
    if (!allValid) {
        event.preventDefault();
        alert("Please fix all errors before submitting the form.");
        return false;
    }
    handleRememberMeOnSubmit();
    return true;
}

function setupFieldValidators() {
    const firstNameField = document.querySelector("input[name='firstName']");
    if (firstNameField) {
        firstNameField.addEventListener("input", validateFirstName);
        firstNameField.addEventListener("blur", validateFirstName);
    }

    const middleInitialField = document.querySelector("input[name='middleInitial']");
    if (middleInitialField) {
        middleInitialField.addEventListener("input", validateMiddleInitial);
        middleInitialField.addEventListener("blur", validateMiddleInitial);
    }

    const lastNameField = document.querySelector("input[name='lastName']");
    if (lastNameField) {
        lastNameField.addEventListener("input", validateLastName);
        lastNameField.addEventListener("blur", validateLastName);
    }

    const dobField = document.getElementById("dob");
    if (dobField) {
        dobField.addEventListener("change", validateDOB);
        dobField.addEventListener("blur", validateDOB);
    }

    const emailField = document.querySelector("input[name='email']");
    if (emailField) {
        emailField.addEventListener("input", validateEmail);
        emailField.addEventListener("blur", validateEmail);
    }

    const address1Field = document.querySelector("input[name='address1']");
    if (address1Field) {
        address1Field.addEventListener("input", validateAddress1);
        address1Field.addEventListener("blur", validateAddress1);
    }

    const address2Field = document.querySelector("input[name='address2']");
    if (address2Field) {
        address2Field.addEventListener("input", validateAddress2);
        address2Field.addEventListener("blur", validateAddress2);
    }

    const cityField = document.querySelector("input[name='city']");
    if (cityField) {
        cityField.addEventListener("input", validateCity);
        cityField.addEventListener("blur", validateCity);
    }

    const stateField = document.querySelector("select[name='state']");
    if (stateField) {
        stateField.addEventListener("change", validateState);
        stateField.addEventListener("blur", validateState);
    }

    const genderRadios = document.querySelectorAll("input[name='gender']");
    genderRadios.forEach((radio) => {
        radio.addEventListener("change", validateGender);
    });

    const userIdField = document.getElementById("userId");
    if (userIdField) {
        userIdField.addEventListener("input", function () {
            this.value = this.value.toLowerCase();
            validateUserId();
        });
        userIdField.addEventListener("blur", validateUserId);
    }

    const passwordField = document.getElementById("password");
    if (passwordField) {
        passwordField.addEventListener("input", validatePassword);
        passwordField.addEventListener("blur", validatePassword);
    }

    const repasswordField = document.getElementById("repassword");
    if (repasswordField) {
        repasswordField.addEventListener("input", validateRePassword);
        repasswordField.addEventListener("blur", validateRePassword);
    }

    const symptomsField = document.querySelector("textarea[name='symptoms']");
    if (symptomsField) {
        symptomsField.addEventListener("blur", validateSymptoms);
    }

    const historyContainer = document.getElementById("medical-history-container");
    if (historyContainer) {
        historyContainer.addEventListener("change", function () {
            const form = document.getElementById("patient-form");
            if (!form) return;
            const historyBoxes = form.querySelectorAll("input[name='history']:checked");
            const historyArray = Array.from(historyBoxes).map((box) => box.value);
            saveFieldToLocalStorage("history", JSON.stringify(historyArray));
        });
    }

    const vaccinatedRadios = document.querySelectorAll("input[name='vaccinated']");
    vaccinatedRadios.forEach((radio) => {
        radio.addEventListener("change", function () {
            saveFieldToLocalStorage("vaccinated", this.value);
        });
    });

    const insuranceRadios = document.querySelectorAll("input[name='insurance']");
    insuranceRadios.forEach((radio) => {
        radio.addEventListener("change", function () {
            saveFieldToLocalStorage("insurance", this.value);
        });
    });

    const rememberMe = document.getElementById("rememberMe");
    if (rememberMe) {
        rememberMe.addEventListener("change", function () {
            if (!this.checked) {
                // When unchecked, delete cookie and localStorage
                eraseNameCookie();
                clearAllLocalStorageData();
                alert("Your data will not be remembered on this device.");
            } else {
                // When re-checked, save current first name to cookie if valid
                const firstNameField = document.querySelector("input[name='firstName']");
                const firstName = firstNameField ? firstNameField.value.trim() : "";
                if (firstName && /^[A-Za-z'-]+$/.test(firstName)) {
                    setNameCookie(firstName);
                    alert("Your data will be remembered on this device for up to 48 hours.");
                }
            }
        });
    }
}

function startSessionTimer() {
    const display = document.getElementById("time-remaining");
    if (!display) return;

    function updateTimer() {
        sessionSecondsRemaining--;
        if (sessionSecondsRemaining <= 0) {
            clearInterval(sessionTimerId);
            alert("Your session has expired. The form will be cleared.");
            clearForm();
            sessionSecondsRemaining = 600;
            startSessionTimer();
            return;
        }
        const minutes = Math.floor(sessionSecondsRemaining / 60);
        const seconds = sessionSecondsRemaining % 60;
        display.textContent =
            String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
    }

    if (sessionTimerId) {
        clearInterval(sessionTimerId);
    }
    display.textContent = "10:00";
    sessionTimerId = setInterval(updateTimer, 1000);
}

/* Cookie Helpers */

function setNameCookie(firstName) {
    const days = 2;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + date.toUTCString();
    const expiryTime = date.getTime();

    // Try to set cookie
    document.cookie = "gp_firstname=" + encodeURIComponent(firstName) + ";" + expires + ";path=/";
    console.log("Cookie set: gp_firstname=" + firstName + ", expires=" + expires);

    // Also save to localStorage as fallback (for file:// protocol)
    try {
        localStorage.setItem("gp_cookie_firstname", firstName);
        localStorage.setItem("gp_cookie_expiry", expiryTime);
        console.log("Also saved to localStorage as fallback");
    } catch (e) {
        console.error("Could not save to localStorage: " + e);
    }
}

function getNameCookie() {
    const name = "gp_firstname=";
    const decodedCookie = decodeURIComponent(document.cookie);
    console.log("All cookies: " + decodedCookie);

    // First try to get from actual cookie
    const ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(name) === 0) {
            const value = c.substring(name.length, c.length);
            console.log("Found cookie: " + value);
            return value;
        }
    }

    // If no cookie found, try localStorage fallback (for file:// protocol)
    try {
        const storedName = localStorage.getItem("gp_cookie_firstname");
        const storedExpiry = localStorage.getItem("gp_cookie_expiry");

        if (storedName && storedExpiry) {
            const now = new Date().getTime();
            if (now < parseInt(storedExpiry)) {
                console.log("Found in localStorage (cookie fallback): " + storedName);
                return storedName;
            } else {
                console.log("localStorage cookie expired");
                localStorage.removeItem("gp_cookie_firstname");
                localStorage.removeItem("gp_cookie_expiry");
            }
        }
    } catch (e) {
        console.error("Could not read from localStorage: " + e);
    }

    console.log("No cookie found");
    return "";
}

function eraseNameCookie() {
    document.cookie = "gp_firstname=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    console.log("Cookie erased");

    // Also remove from localStorage fallback
    try {
        localStorage.removeItem("gp_cookie_firstname");
        localStorage.removeItem("gp_cookie_expiry");
        console.log("Also removed from localStorage");
    } catch (e) {
        console.error("Could not remove from localStorage: " + e);
    }
}

function saveFieldToLocalStorage(key, value) {
    try {
        localStorage.setItem("gp_" + key, value);
    } catch (e) {}
}

function getFieldFromLocalStorage(key) {
    try {
        return localStorage.getItem("gp_" + key);
    } catch (e) {
        return null;
    }
}

function clearAllLocalStorageData() {
    const keysToRemove = [
        "firstName","middleInitial","lastName","dob","email","phone",
        "address1","address2","city","state","zip","symptoms",
        "gender","vaccinated","insurance","healthscore",
        "userId","history"
    ];
    keysToRemove.forEach((key) => {
        try {
            localStorage.removeItem("gp_" + key);
        } catch (e) {}
    });
}

function populateFormFromLocalStorage() {
    const form = document.getElementById("patient-form");
    if (!form) return;

    const firstName = getFieldFromLocalStorage("firstName");
    if (firstName !== null) form.firstName.value = firstName;

    const middleInitial = getFieldFromLocalStorage("middleInitial");
    if (middleInitial !== null) form.middleInitial.value = middleInitial;

    const lastName = getFieldFromLocalStorage("lastName");
    if (lastName !== null) form.lastName.value = lastName;

    const dob = getFieldFromLocalStorage("dob");
    if (dob !== null) form.dob.value = dob;

    const email = getFieldFromLocalStorage("email");
    if (email !== null) form.email.value = email;

    const phone = getFieldFromLocalStorage("phone");
    if (phone !== null) form.phone.value = phone;

    const address1 = getFieldFromLocalStorage("address1");
    if (address1 !== null) form.address1.value = address1;

    const address2 = getFieldFromLocalStorage("address2");
    if (address2 !== null) form.address2.value = address2;

    const city = getFieldFromLocalStorage("city");
    if (city !== null) form.city.value = city;

    const state = getFieldFromLocalStorage("state");
    if (state !== null) form.state.value = state;

    const zip = getFieldFromLocalStorage("zip");
    if (zip !== null) form.zip.value = zip;

    const symptoms = getFieldFromLocalStorage("symptoms");
    if (symptoms !== null) form.symptoms.value = symptoms;

    const gender = getFieldFromLocalStorage("gender");
    if (gender !== null) {
        const radio = form.querySelector("input[name='gender'][value='" + gender + "']");
        if (radio) radio.checked = true;
    }

    const vaccinated = getFieldFromLocalStorage("vaccinated");
    if (vaccinated !== null) {
        const radio = form.querySelector("input[name='vaccinated'][value='" + vaccinated + "']");
        if (radio) radio.checked = true;
    }

    const insurance = getFieldFromLocalStorage("insurance");
    if (insurance !== null) {
        const radio = form.querySelector("input[name='insurance'][value='" + insurance + "']");
        if (radio) radio.checked = true;
    }

    const healthscore = getFieldFromLocalStorage("healthscore");
    if (healthscore !== null) {
        form.healthscore.value = healthscore;
        const scoreEl = document.getElementById("score");
        if (scoreEl) scoreEl.textContent = healthscore;
    }

    const userId = getFieldFromLocalStorage("userId");
    if (userId !== null) form.userId.value = userId;

    const history = getFieldFromLocalStorage("history");
    if (history !== null) {
        try {
            const arr = JSON.parse(history);
            arr.forEach((val) => {
                const checkbox = form.querySelector("input[name='history'][value='" + val + "']");
                if (checkbox) checkbox.checked = true;
            });
        } catch (e) {}
    }
}

function handleWelcomeAndCookie() {
    const welcomeSpan = document.getElementById("welcome-message");
    const notYouContainer = document.getElementById("not-you-container");
    const storedName = getNameCookie();

    if (storedName) {
        welcomeSpan.textContent = "Welcome back, " + storedName;
        notYouContainer.innerHTML = "";
        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = "notYou";
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(" Not " + storedName + "? Click here to start as a NEW USER."));
        notYouContainer.appendChild(label);

        checkbox.addEventListener("change", function () {
            if (this.checked) {
                // Erase cookie and clear all data
                eraseNameCookie();
                clearAllLocalStorageData();

                // Clear form without confirmation
                const form = document.getElementById("patient-form");
                if (form) {
                    form.reset();
                    const reviewContainer = document.getElementById("review-container");
                    if (reviewContainer) {
                        reviewContainer.style.display = "none";
                    }
                    const scoreEl = document.getElementById("score");
                    if (scoreEl) scoreEl.textContent = "5";
                    ssnActualValue = "";
                    lastSSNMaskedLength = 0;
                    formErrors = {};
                    const errorSpans = document.querySelectorAll(".error-message");
                    errorSpans.forEach((span) => {
                        span.textContent = "";
                        span.style.display = "none";
                    });
                    updateSubmitButton();
                }

                // Update UI
                welcomeSpan.textContent = "Welcome new user";
                notYouContainer.innerHTML = "";
            }
        });
    } else {
        welcomeSpan.textContent = "Welcome new user";
        notYouContainer.innerHTML = "";
    }

    // ALWAYS populate from localStorage (whether cookie exists or not)
    // This ensures form data is restored even if user didn't submit yet
    populateFormFromLocalStorage();
}

function handleRememberMeOnSubmit() {
    const rememberMe = document.getElementById("rememberMe");
    const firstNameField = document.querySelector("input[name='firstName']");
    const firstName = firstNameField ? firstNameField.value.trim() : "";

    console.log("handleRememberMeOnSubmit called");
    console.log("Remember Me checked: " + (rememberMe ? rememberMe.checked : "not found"));
    console.log("First Name: " + firstName);

    // Always save if Remember Me is checked (which is default)
    if (rememberMe && rememberMe.checked && firstName) {
        console.log("Saving cookie and localStorage");
        setNameCookie(firstName);
        saveFieldToLocalStorage("firstName", firstName);
    } else if (!rememberMe || !rememberMe.checked) {
        // Only clear if Remember Me is explicitly unchecked
        console.log("Clearing cookie and localStorage");
        eraseNameCookie();
        clearAllLocalStorageData();
    }
}

/* Fetch API: load states and condition checkboxes from external files */

async function loadStatesWithFetch() {
    const select = document.getElementById("state");
    if (!select) return;
    try {
        const response = await fetch("states.txt");
        if (!response.ok) throw new Error("Network response was not ok");
        const text = await response.text();
        const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
        select.innerHTML = '<option value="">Select State</option>';
        lines.forEach((line) => {
            const parts = line.split("|");
            if (parts.length === 2) {
                const opt = document.createElement("option");
                opt.value = parts[0];
                opt.textContent = parts[1];
                select.appendChild(opt);
            }
        });
    } catch (e) {
        select.innerHTML = '<option value="">Select State</option>';
        const fallback = [
            ["TX","Texas"],
            ["CA","California"],
            ["NY","New York"],
            ["FL","Florida"]
        ];
        fallback.forEach(([code, name]) => {
            const opt = document.createElement("option");
            opt.value = code;
            opt.textContent = name;
            select.appendChild(opt);
        });
    }
}

async function loadMedicalHistoryWithFetch() {
    const container = document.getElementById("medical-history-container");
    if (!container) return;
    try {
        const response = await fetch("conditions.txt");
        if (!response.ok) throw new Error("Network response was not ok");
        const text = await response.text();
        const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
        container.innerHTML = "";
        lines.forEach((line, idx) => {
            const id = "history_" + idx;
            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.name = "history";
            checkbox.value = line.trim();
            checkbox.id = id;
            label.htmlFor = id;
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(" " + line.trim() + " "));
            container.appendChild(label);
        });
    } catch (e) {
        container.innerHTML = "";
        const fallback = ["Chicken Pox","Measles","Covid-19","Small Pox","Tetanus"];
        fallback.forEach((cond, idx) => {
            const id = "history_fallback_" + idx;
            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.name = "history";
            checkbox.value = cond;
            checkbox.id = id;
            label.htmlFor = id;
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(" " + cond + " "));
            container.appendChild(label);
        });
    }
}

window.addEventListener("DOMContentLoaded", async function () {
    showCurrentDate();
    startLiveClock();
    setDateLimits();
    updateHealthScore();
    setupPhoneFormatting();
    setupZipFormatting();
    setupFieldValidators();
    updateSubmitButton();

    // Load data from files first (await to ensure they complete)
    await loadStatesWithFetch();
    await loadMedicalHistoryWithFetch();

    // Then populate form and handle cookie (after checkboxes exist)
    handleWelcomeAndCookie();
    startSessionTimer();

    const form = document.getElementById("patient-form");
    if (form) {
        form.addEventListener("submit", validateFormOnSubmit);
    }
});
