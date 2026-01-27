
const form = document.getElementById("create-campaign-form");
const message = document.getElementById("campaign-message");


const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

if (!user || !token) {
    alert("You must be logged in to create a campaign");
    window.location.href = "login.html";
}

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const goal = document.getElementById("goal").value;
    const deadline = document.getElementById("deadline").value;
    const imageFile = document.getElementById("image").files[0];

    let imageBase64 = "";
    if (imageFile) {
        imageBase64 = await toBase64(imageFile);
    }
const campaign = {
    title,
    description,
    goal,
    deadline,
    image: imageBase64,
    category: document.getElementById("category").value,

    creatorId: user.id,
    isApproved: false
};


    try {
        const response = await fetch("http://localhost:3000/campaigns", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(campaign)
        });

        if (response.ok) {
            message.style.color = "green";
            message.textContent = "Campaign created! Waiting for admin approval.";
            form.reset();
            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000);
        } else {
            message.style.color = "red";
            message.textContent = "Failed to create campaign.";
        }
    } catch (error) {
        console.error(error);
        message.style.color = "red";
        message.textContent = "Error occurred. Try again later.";
    }
});
