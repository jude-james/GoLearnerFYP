const errorMessage = document.querySelector(".error-message");

document.getElementById("dismiss-button").addEventListener("click", () => {
    errorMessage.classList.remove("error-visible");
});

/**
 * Displays the generic error window and updates the message.
 * @param {string} message - The error message to be displayed
 */
export function displayError(message) {
    document.querySelector('.error-message p').textContent = `Error: ${message}`;
    errorMessage.classList.add("error-visible");
}