// let a = ""

// function btnClick(message){
//    a += message
//    console.log(a)
// }

// function calculaate (){
//      let answer = eval(a)
//      console.log(answer)
// }

  let display = document.getElementById("display");

    function appendValue(value) {
      if (display.innerText === "0") {
        display.innerText = value;
      } else {
        display.innerText += value;
      }
    }

    function clearDisplay() {
      display.innerText = "0";
    }

    function calculate() {
      try {
        display.innerText = eval(display.innerText);
      } catch (error) {
        display.innerText = "Error";
      }
    }