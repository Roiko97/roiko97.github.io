// Example: Change header style on scroll
window.onscroll = function() {
    var header = document.querySelector('header');
    var windowPosition = window.scrollY > 0;
    header.classList.toggle('active', windowPosition);
};
