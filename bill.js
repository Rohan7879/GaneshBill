// This code runs only when the input form (index.html) is loaded
document.addEventListener("DOMContentLoaded", function () {
  if (document.body.contains(document.getElementById("estimateForm"))) {
    const bharelaInput = document.getElementById("bharela");
    const khaliInput = document.getElementById("khali");
    const totalBardanLabel = document.getElementById("totalBardanLabel");

    function updateTotalBags() {
      const bharela = parseInt(bharelaInput.value) || 0;
      const khali = parseInt(khaliInput.value) || 0;
      totalBardanLabel.textContent = bharela + khali;
    }

    bharelaInput.addEventListener("input", updateTotalBags);
    khaliInput.addEventListener("input", updateTotalBags);
  }
});

// Custom rounding function
function customRound(num) {
  let decimal = num - Math.floor(num);
  return decimal > 0.5 ? Math.ceil(num) : Math.floor(num);
}

// Main function to collect data and perform calculations
function collectData() {
  const form = document.getElementById("estimateForm");
  const formData = new FormData(form);

  let data = {};
  formData.forEach((value, key) => {
    // Keep name and broker as strings, convert others to numbers
    if (key === "customer_name" || key === "broker_name") {
      data[key] = value;
    } else {
      data[key] = Number(value) || 0;
    }
  });

  // Automatically capture and format the current date
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  data.bill_datetime = `${dd}/${mm}/${yyyy}`;

  // Destructure data for easier use
  let {
    ભરેલા: bharela,
    ખાલી: khali,
    "ભાવ ૧": b1,
    "ભાવ ૨": b2,
    "ભાવ ૩": b3,
    "ભાવ ૪": b4,
    "ભાવ ૫": b5,
    વેબ્રીજ_વજન: weight,
  } = data;

  // Perform all calculations
  let totalBardan = bharela + khali;
  let Bardan = customRound(totalBardan * 0.6);
  let katta_kasar = customRound(weight * 0.003);
  let net_vajan = customRound(weight - katta_kasar - Bardan);

  let katta = data["કટ્ટા ૧"] + data["કટ્ટા ૨"] + data["કટ્ટા ૩"] + data["કટ્ટા ૪"] + data["કટ્ટા ૫"] + khali;

  let perUnitWeight = bharela ? net_vajan / bharela : 0;

  const vakalKattaKeys = ["કટ્ટા ૧", "કટ્ટા ૨", "કટ્ટા ૩", "કટ્ટા ૪", "કટ્ટા ૫"];
  const vakalKiloKeys = ["કિલો ૧", "કિલો ૨", "કિલો ૩", "કિલો ૪", "કિલો ૫"];
  const kiloValues = {};
  let calculatedKilosSum = 0;

  let lastActiveVakalIndex = -1;
  for (let i = vakalKattaKeys.length - 1; i >= 0; i--) {
    if (data[vakalKattaKeys[i]] > 0) {
      lastActiveVakalIndex = i;
      break;
    }
  }

  for (let i = 0; i < vakalKattaKeys.length; i++) {
    const key = vakalKattaKeys[i];
    const kiloKey = vakalKiloKeys[i];
    if (data[key] > 0) {
      if (i === lastActiveVakalIndex) {
        kiloValues[kiloKey] = net_vajan - calculatedKilosSum;
      } else {
        const calculatedKilo = customRound(perUnitWeight * data[key]);
        kiloValues[kiloKey] = calculatedKilo;
        calculatedKilosSum += calculatedKilo;
      }
    } else {
      kiloValues[kiloKey] = 0;
    }
  }

  let kilo1 = kiloValues["કિલો ૧"];
  let kilo2 = kiloValues["કિલો ૨"];
  let kilo3 = kiloValues["કિલો ૩"];
  let kilo4 = kiloValues["કિલો ૪"];
  let kilo5 = kiloValues["કિલો ૫"];

  let totalKilo = kilo1 + kilo2 + kilo3 + kilo4 + kilo5;

  let bhav1 = customRound((kilo1 / 20) * b1 || 0);
  let bhav2 = customRound((kilo2 / 20) * b2 || 0);
  let bhav3 = customRound((kilo3 / 20) * b3 || 0);
  let bhav4 = customRound((kilo4 / 20) * b4 || 0);
  let bhav5 = customRound((kilo5 / 20) * b5 || 0);
  let total = bhav1 + bhav2 + bhav3 + bhav4 + bhav5;

  let utrai = customRound(bharela * 3.5);
  let diff = (total % 10) - (utrai % 10);
  let finalutrai;

  if (diff > 5) {
    finalutrai = utrai + diff - 10;
  } else if (diff < -5) {
    finalutrai = utrai + diff + 10;
  } else if (diff === 5 || diff === -5) {
    finalutrai = utrai - 5;
  } else {
    finalutrai = utrai + diff;
  }

  let finaltotal = total - finalutrai;

  const weightMatch = totalKilo === net_vajan;
  const kattaMatch = totalBardan === katta;
  const isMatchValid = weightMatch && kattaMatch;

  let matchMessage;
  if (isMatchValid) {
    matchMessage = `✅ મેળ ખાય છે`;
  } else {
    matchMessage = `❌ મેળ ખાતો નથી!`;
  }

  Object.assign(data, {
    is_match_valid: isMatchValid,
    ટોટલ_બારદાન: totalBardan,
    વેબ્રીજ_વજન: weight,
    કાંટા_કસર: katta_kasar,
    બારદાન: Bardan,
    નેટ_વજન: net_vajan,
    "કિલો ૧": kilo1,
    "કિલો ૨": kilo2,
    "કિલો ૩": kilo3,
    "કિલો ૪": kilo4,
    "કિલો ૫": kilo5,
    રૂપિયા_૧: bhav1,
    રૂપિયા_૨: bhav2,
    રૂપિયા_૩: bhav3,
    રૂપિયા_૪: bhav4,
    રૂપિયા_૫: bhav5,
    ટોટલ_રુપિયા: total,
    ઉતરાઈ: finalutrai,
    ફાઇનલ: finaltotal,
    મેચ: matchMessage,
  });

  localStorage.setItem("estimateData", JSON.stringify(data));
  window.location.href = "final.html";
}

// Function to display data on the final.html page
function displayData() {
  let storedData = localStorage.getItem("estimateData");
  if (!storedData) {
    console.error("No data found!");
    return;
  }
  let data = JSON.parse(storedData);

  function setValue(id, value) {
    let element = document.getElementById(id);
    if (element) element.innerHTML = value;
  }

  const fieldMapping = {
    bill_datetime_display: "bill_datetime",
    customer_name_display: "customer_name",
    broker_name_display: "broker_name",
    વેબ્રીજ_વજન: "વેબ્રીજ_વજન",
    કાંટા_કસર: "કાંટા_કસર",
    બારદાન: "બારદાન",
    નેટ_વજન: "નેટ_વજન",
    કટ્ટા_૧: "કટ્ટા ૧",
    કિલો_૧: "કિલો ૧",
    ભાવ_૧: "ભાવ ૧",
    રૂપિયા_૧: "રૂપિયા_૧",
    કટ્ટા_૨: "કટ્ટા ૨",
    કિલો_૨: "કિલો ૨",
    ભાવ_૨: "ભાવ ૨",
    રૂપિયા_૨: "રૂપિયા_૨",
    કટ્ટા_૩: "કટ્ટા ૩",
    કિલો_૩: "કિલો ૩",
    ભાવ_૩: "ભાવ ૩",
    રૂપિયા_૩: "રૂપિયા_૩",
    કટ્ટા_૪: "કટ્ટા ૪",
    કિલો_૪: "કિલો ૪",
    ભાવ_૪: "ભાવ ૪",
    રૂપિયા_૪: "રૂપિયા_૪",
    કટ્ટા_૫: "કટ્ટા ૫",
    કિલો_૫: "કિલો ૫",
    ભાવ_૫: "ભાવ ૫",
    રૂપિયા_૫: "રૂપિયા_૫",
    ટોટલ_રૂ: "ટોટલ_રુપિયા",
    ઉતરાઈ: "ઉતરાઈ",
    ફાઈનલ: "ફાઇનલ",
    મેચ: "મેચ",
  };

  Object.entries(fieldMapping).forEach(([id, key]) => setValue(id, data[key] !== undefined ? data[key] : "N/A"));

  const printButton = document.getElementById("printButton");
  if (printButton) {
    if (!data.is_match_valid) {
      printButton.disabled = true;
    } else {
      printButton.disabled = false;
    }
  }

  const originalContainer = document.getElementById("container-original");
  const copyContainer = document.getElementById("container-copy");
  if (originalContainer && copyContainer) {
    const contentToCopy = originalContainer.cloneNode(true);
    contentToCopy.querySelector(".button-container").remove();
    copyContainer.innerHTML = contentToCopy.innerHTML;
  }
}

if (window.location.pathname.includes("final.html")) {
  window.onload = displayData;
}
