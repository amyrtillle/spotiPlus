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

function togglePlayer() {
  let extender = document.getElementById("extendPlayer");
  let player = document.querySelector("footer");
  let control = document.getElementById("controlContainer");
  let info = document.getElementById("musicInfo");
  let albumImage = document.getElementById("albumImage");
  let tracktime = document.getElementById("trackTime");
  let body = document.querySelector("main");

  if (document.getElementById("footerCheckBox").checked == true) {
    // extender.style.transform = "translateY(-100px)";
    extender.style.transform = "rotate(90deg)";
    // player.style.transform = "translateY(-100px)";
    // control.style.transform = "translateY(-100px)";
    // info.style.transform = "translateY(-100px)";
    // albumImage.style.transform = "translateY(-100px)";
    // tracktime.style.transform = "translateY(-100px)";
    player.style.height = "70%";
    // albumImage.style.display = "block";
    albumImage.style.height = "150px";
    albumImage.style.margin = "20px auto";
    body.style.filter = "blur(5px)";
  } else {
    // extender.style.transform = "translateY(0px)";
    // player.style.transform = "translateY(0px)";
    // control.style.transform = "translateY(0px)";
    // info.style.transform = "translateY(0px)";
    // albumImage.style.transform = "translateY(0px)";
    // tracktime.style.transform = "translateY(0px)";
    player.style.height = "150px";
    extender.style.transform = "rotate(-90deg)";
    // albumImage.style.display = "none";
    albumImage.style.height = "0";
    albumImage.style.margin = "0 auto";
    body.style.filter = "blur(0px)";
  }
}
