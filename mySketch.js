/*
This is a project for SIGBOVIK 2025 that also fits with this week's
WCCChallenge theme of "morph"! Take photos, and have them merge
with each other, to produce the kinds of jank you'd see in old panoramas.

Video about the project: https://www.youtube.com/watch?v=g_HUEF2XZ-E
Paper for SIGBOVIK: https://davepagurek.github.io/pandemonium/panorama.pdf
*/

let font;

OPC.slider({
  name: 'maxR',
  label: 'Smear',
  min: 0.01,
  max: 0.25,
  value: 0.1
});
OPC.slider({
  name: 'distort',
  label: 'Distort',
  min: 0,
  max: 1,
  value: 0.1
});
OPC.button('myButton', 'Save Image');

let cam;
let tapped = false;
let first = true;
let doStamp = false;

function preload() {
  font = loadFont('https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf');
}

const pandemonium = new Pandemonium();

async function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);
  const isMobile = window.navigator.userAgent && /Mobi|Android/i.test(window.navigator.userAgent);
  
  cam = createCapture(isMobile ? {
    audio: false,
    video: {
      facingMode: {
        exact: "environment"
      }
    },
  } : VIDEO, { flipped: !isMobile });
  cam.hide();

  await pandemonium.setup(1920, 1080);
}

let seed = 0;

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  if (!pandemonium.ready()) return;

  if (doStamp) {
    pandemonium.snapshot(cam, { first });
    doStamp = false;
    first = false;
    seed++;
  }

  pandemonium.run(cam, { distort, smear: maxR, seed, first: !tapped });

  clear();
  imageMode(CORNER);

  // ✅ 카메라를 전체 화면에 맞게 출력 (WEBGL 좌표계 기준으로 -width/2, -height/2 위치에)
  image(cam, -width / 2, -height / 2, width, height);

  // ✅ Pandemonium 결과는 별도 스케일로 덧입히기
  push();
  translate(-width / 2, -height / 2); // WEBGL 좌표 보정
  scale(width / pandemonium.width(), height / pandemonium.height());
  pandemonium.draw();
  pop();

  // ✅ 안내 텍스트는 중앙에 고정
  if (!tapped) {
    push();
    noStroke();
    fill(0, 100);
    rectMode(CENTER);
    rect(0, 0, 300, 50);

    textFont(font);
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(30);
    text('Tap to stamp', 0, -4);
    pop();
  }
}

function mouseClicked() {
  tapped = true;
  doStamp = true;
}

function buttonReleased() {
  pandemonium.save();
}
