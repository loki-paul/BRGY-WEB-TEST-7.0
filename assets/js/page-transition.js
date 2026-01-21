function smoothSlide(url, direction) {
    // Disable animation for mobile (screen width < 768)
    if (window.innerWidth < 768) {
        window.location.href = url;
        return;
    }

    // Desktop animation
    document.body.classList.add(direction);
    setTimeout(() => {
        window.location.href = url;
    }, 470);
}

document.addEventListener("DOMContentLoaded", () => {

    // Go to Signup (slide LEFT)
    const signupLink = document.querySelector("a[href='signup.html']");
    if (signupLink) {
        signupLink.addEventListener("click", (e) => {
            e.preventDefault();
            smoothSlide("signup.html", "slide-left");
        });
    }

    // Go to Login (slide RIGHT)
    const loginLink = document.querySelector("a[href='index.html']");
    if (loginLink) {
        loginLink.addEventListener("click", (e) => {
            e.preventDefault();
            smoothSlide("index.html", "slide-right");
        });
    }

});
