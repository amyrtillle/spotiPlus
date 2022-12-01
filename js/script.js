function toggleMenu() {
  let menu = document.getElementById("menu");
  let logo = document.querySelector(".logo");
  let body = document.querySelector("main");

  if (document.getElementById("checkBox").checked == true) {
    menu.style.transform = "translateY(600px)";
    body.style.filter = "blur(5px)";
    logo.style.transform = "translateX(-100px)";
  } else {
    menu.style.transform = "translateY(0px)";
    body.style.filter = "blur(0)";
    logo.style.transform = "translateX(0px)";
  }
}
