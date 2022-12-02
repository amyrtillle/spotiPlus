function toggleMenu() {
  let menu = document.getElementById("menu");
  let logo = document.querySelector(".logo");
  let body = document.querySelector("main");
  let footer = document.querySelector("footer");

  if (document.getElementById("checkBox").checked == true) {
    menu.style.transform = "translateY(600px)";
    body.style.filter = "blur(5px)";
    footer.style.filter = "blur(5px)";
    logo.style.transform = "translateX(-100px)";
  } else {
    menu.style.transform = "translateY(0px)";
    body.style.filter = "blur(0)";
    footer.style.filter = "blur(0)";
    logo.style.transform = "translateX(0px)";
  }
}

function togglePlayer() {
  let extender = document.getElementById("extendPlayer");
  let player = document.querySelector("footer");
  let albumImage = document.getElementById("albumImage");
  let body = document.querySelector("main");

  if (document.getElementById("footerCheckBox").checked == true) {
    extender.style.transform = "rotate(90deg)";
    player.style.height = "70%";
    albumImage.style.height = "150px";
    albumImage.style.margin = "20px auto";
    body.style.filter = "blur(5px)";
  } else {
    player.style.height = "150px";
    extender.style.transform = "rotate(-90deg)";
    albumImage.style.height = "0";
    albumImage.style.margin = "0 auto";
    body.style.filter = "blur(0px)";
  }
}
