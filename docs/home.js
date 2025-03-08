document.addEventListener("DOMContentLoaded", function() {
    const dropdownBtn = document.querySelector(".dropdown-btn");
    const dropdownContent = document.querySelector(".dropdown-content");

    dropdownBtn.addEventListener("click", function(event) {
        dropdownContent.classList.toggle("show");
        event.stopPropagation(); // Prevents closing when clicking inside
    });

    document.addEventListener("click", function(event) {
        if (!dropdownContent.contains(event.target) && event.target !== dropdownBtn) {
            dropdownContent.classList.remove("show");
        }
    });
});
