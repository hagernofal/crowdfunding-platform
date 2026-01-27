const pledgesContainer = document.getElementById("pledges-container");
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

if (!user || !token) {
  alert("You must login first");
  window.location.href = "login.html";
}

async function fetchPledges() {
  try {
    const res = await fetch(`http://localhost:3000/pledges?userId=${user.id}`);
    const pledges = await res.json();

    pledgesContainer.innerHTML = "";

    if (pledges.length === 0) {
      pledgesContainer.innerHTML = "<p>You have not made any pledges yet.</p>";
      return;
    }

    pledges.forEach(p => {
      const card = document.createElement("div");
      card.className = "pledge-card";
      card.innerHTML = `
        <p>Campaign ID: ${p.campaignId}</p>
        <p>Amount: $${p.amount}</p>
        <p>Date: ${p.date || "Unknown"}</p>
      `;
      pledgesContainer.appendChild(card);
    });

  } catch (error) {
    console.error("Error fetching pledges:", error);
    pledgesContainer.innerHTML = "<p>Failed to load pledges.</p>";
  }
}

fetchPledges();
