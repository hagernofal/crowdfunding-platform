const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");
const urlParams = new URLSearchParams(window.location.search);
const campaignId = parseInt(urlParams.get("campaignId"));

const donateForm = document.getElementById("donate-form");
const donateMessage = document.getElementById("donate-message");

if (!user || !token) {
  alert("You must log in to donate!");
  window.location.href = "login.html";
}

async function loadCampaign() {
  try {
    const res = await fetch(`http://localhost:3000/campaigns/${campaignId}`);
    const campaign = await res.json();

    document.getElementById("campaign-title").textContent = campaign.title;
    document.getElementById("campaign-goal").textContent = `$${campaign.goal}`;
  } catch (error) {
    console.error("Error loading campaign:", error);
    donateMessage.style.color = "red";
    donateMessage.textContent = "Failed to load campaign info.";
  }
}

loadCampaign();

donateForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const amount = parseFloat(document.getElementById("amount").value);

  if (amount <= 0) {
    donateMessage.style.color = "red";
    donateMessage.textContent = "Enter a valid donation amount.";
    return;
  }

const pledge = {
  userId: user.id,
  campaignId: campaignId,
  amount: amount,
  date: new Date().toISOString() 
};


  try {
    const res = await fetch("http://localhost:3000/pledges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(pledge)
    });

    if (res.ok) {
      donateMessage.style.color = "green";
      donateMessage.textContent = `Thank you for donating $${amount}!`;
      donateForm.reset();
    } else {
      donateMessage.style.color = "red";
      donateMessage.textContent = "Failed to process donation.";
    }
  } catch (error) {
    console.error(error);
    donateMessage.style.color = "red";
    donateMessage.textContent = "Error occurred. Try again later.";
  }
});
