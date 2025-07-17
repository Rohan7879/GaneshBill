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
    data[key] = Number(value) || 0;
  });

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

  // --- DYNAMIC FIX FOR ROUNDING ERROR & DIFFERENCE CALCULATION ---
  const vakalKattaKeys = ["કટ્ટા ૧", "કટ્ટા ૨", "કટ્ટા ૩", "કટ્ટા ૪", "કટ્ટા ૫"];
  const vakalKiloKeys = ["કિલો ૧", "કિલો ૨", "કિલો ૩", "કિલો ૪", "કિલો ૫"];
  const kiloValues = {};
  let calculatedKilosSum = 0;
  let roundingDiff = 0; // Initialize rounding difference

  // Find the last vakal that has a non-zero katta value
  let lastActiveVakalIndex = -1;
  for (let i = vakalKattaKeys.length - 1; i >= 0; i--) {
    if (data[vakalKattaKeys[i]] > 0) {
      lastActiveVakalIndex = i;
      break;
    }
  }

  // Calculate kilos for each vakal
  for (let i = 0; i < vakalKattaKeys.length; i++) {
    const key = vakalKattaKeys[i];
    const kiloKey = vakalKiloKeys[i];

    if (data[key] > 0) {
      if (i === lastActiveVakalIndex) {
        // This is the last active item
        const realLastKilo = customRound(perUnitWeight * data[key]);
        const calculatedLastKilo = net_vajan - calculatedKilosSum;
        kiloValues[kiloKey] = calculatedLastKilo;
        roundingDiff = calculatedLastKilo - realLastKilo; // Calculate the difference
      } else {
        // Not the last item, so calculate and round normally
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
  // --- END OF FIX ---

  let totalKilo = kilo1 + kilo2 + kilo3 + kilo4 + kilo5;

  let bhav1 = customRound((kilo1 / 20) * b1 || 0);
  let bhav2 = customRound((kilo2 / 20) * b2 || 0);
  let bhav3 = customRound((kilo3 / 20) * b3 || 0);
  let bhav4 = customRound((kilo4 / 20) * b4 || 0);
  let bhav5 = customRound((kilo5 / 20) * b5 || 0);
  let total = bhav1 + bhav2 + bhav3 + bhav4 + bhav5;

  // --- NEW, SMARTER UTRAI CALCULATION ---
  let utrai = customRound(bharela * 3.5);
  let diff = (total % 10) - (utrai % 10);
  let finalutrai;

  if (diff > 5) {
    // e.g., diff is 6. It's closer to subtract 4 than add 6.
    finalutrai = utrai + diff - 10;
  } else if (diff < -5) {
    // e.g., diff is -6. It's closer to add 4 than subtract 6.
    finalutrai = utrai + diff + 10;
  } else if (diff === 5) {
    // Tie-breaker: When the difference is exactly 5, always subtract.
    finalutrai = utrai + 5;
  } else {
    // The difference is small (between -5 and 4), so a direct adjustment is best.
    finalutrai = utrai + diff;
  }
  const utraiDiff = finalutrai - utrai;
  // --- END OF UPDATE ---

  let finaltotal = total - finalutrai;

  // --- UPDATED MATCH MESSAGE LOGIC ---
  let matchMessage;
  const weightMatch = totalKilo === net_vajan;
  const kattaMatch = totalBardan === katta;

  if (weightMatch && kattaMatch) {
    matchMessage = `✅ મેળ ખાય છે: વજન ${net_vajan} = ${totalKilo} | કટ્ટા ${totalBardan} = ${katta}`;
  } else {
    let weightMsg = weightMatch ? `વજન ${net_vajan} = ${totalKilo}` : `વજન ${net_vajan} ≠ ${totalKilo}`;
    let kattaMsg = kattaMatch ? `કટ્ટા ${totalBardan} = ${katta}` : `કટ્ટા ${totalBardan} ≠ ${katta}`;
    matchMessage = `❌ મેળ ખાતો નથી! ${weightMsg} | ${kattaMsg}`;
  }
  // --- END OF UPDATE ---

  // Store all computed values back into the data object
  Object.assign(data, {
    ભરેલા: bharela,
    ટોટલ_બારદાન: totalBardan,
    વેબ્રીજ_વજન: weight,
    કાંટા_કસર: katta_kasar,
    બારદાન: Bardan,
    નેટ_વજન: net_vajan,
    avg_weight: perUnitWeight.toFixed(3),
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
    utrai_diff: utraiDiff,
    ફાઇનલ: finaltotal,
    મેચ: matchMessage,
    rounding_diff: roundingDiff,
    last_vakal_index: lastActiveVakalIndex,
  });

  // Save data to localStorage and redirect to the final bill page
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

  // Map element IDs to data keys for easy iteration
  const fieldMapping = {
    વેબ્રીજ_વજન: "વેબ્રીજ_વજન",
    કાંટા_કસર: "કાંટા_કસર",
    બારદાન: "બારદાન",
    નેટ_વજન: "નેટ_વજન",
    avg_weight_display: "avg_weight",
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

  // Iterate and assign values to the corresponding elements
  Object.entries(fieldMapping).forEach(([id, key]) => setValue(id, data[key] !== undefined ? data[key] : 0));

  // Display the rounding difference for kilos
  const roundingDiff = data.rounding_diff;
  const lastVakalIndex = data.last_vakal_index;
  if (roundingDiff !== 0 && lastVakalIndex > -1) {
    const diffSpan = document.getElementById(`rounding_diff_${lastVakalIndex + 1}`);
    if (diffSpan) {
      let sign = roundingDiff > 0 ? "+" : "";
      diffSpan.textContent = ` (${sign}${roundingDiff})`;
      diffSpan.classList.add(roundingDiff > 0 ? "positive" : "negative");
    }
  }

  // Display the utrai difference
  const utraiDiff = data.utrai_diff;
  const utraiDiffSpan = document.getElementById("utrai_diff_display");
  if (utraiDiff !== 0 && utraiDiffSpan) {
    let sign = utraiDiff > 0 ? "+" : "";
    utraiDiffSpan.textContent = ` (${sign}${utraiDiff})`;
    utraiDiffSpan.classList.add("rounding-diff");
    utraiDiffSpan.classList.add(utraiDiff > 0 ? "positive" : "negative");
  }

  // Tooltip Logic
  const infoIcon = document.getElementById("avg_weight_info_icon");
  const tooltip = document.getElementById("avg_weight_tooltip");
  if (infoIcon && tooltip) {
    tooltip.innerHTML = `(${data.નેટ_વજન} / ${data.ભરેલા}) = ${data.avg_weight}`;
    infoIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      tooltip.classList.toggle("show");
    });
  }
}

// Check if the current page is final.html and run displayData on load
if (window.location.pathname.includes("final.html")) {
  window.onload = displayData;
}

// Close tooltip if clicking anywhere else on the page
window.addEventListener("click", function (e) {
  const tooltip = document.getElementById("avg_weight_tooltip");
  if (tooltip && tooltip.classList.contains("show")) {
    tooltip.classList.remove("show");
  }
});
