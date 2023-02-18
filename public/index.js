const button = document.querySelector(".button");

button.addEventListener("click", (e) => {
  if (!e.target.classList.contains("btn")) return;
  window.location = `./${e.target.id}.html`;
});
