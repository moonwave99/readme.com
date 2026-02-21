const menuToggler = document.getElementById("menu-toggle");

document.querySelectorAll("nav a").forEach((el) =>
  el.addEventListener("click", (event) => {
    event.preventDefault();
    document
      .getElementById(el.href.split("#").pop())
      .scrollIntoView({ behavior: "smooth" });
    menuToggler.click();
  })
);
