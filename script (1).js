document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("feedbackForm");

    form.addEventListener("submit", sendFeedback);

});

function sendFeedback(event) {

    event.preventDefault();

    const submitBtn = document.querySelector(".submit-btn");

    const email = document.getElementById("sender_email").value.trim();

    const suggestions = document.getElementById("feedbackComment").value.trim();

    const selectedRating = document.querySelector('input[name="rating"]:checked');

    if (!selectedRating) {

        alert("Please select a rating.");

        return;

    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    const templateParams = {
        
        feedback: "📝 iSeeScan Feedback Report",

        email: email,

        rating: selectedRating.value,

        suggestions: suggestions

    };

    emailjs.send(
        "service_l9kz9ak",
        "template_p9qfmno",
        templateParams
    )

    .then(function () {

        alert("✅ Thank you! Your review has been sent.");

        document.getElementById("feedbackForm").reset();

        if (typeof toggleOverlay === "function") {

            toggleOverlay();

        }

    })

    .catch(function (error) {

        console.error(error);

        alert(
            "❌ Failed to send email.\n\n" +
            JSON.stringify(error)
        );

    })

    .finally(function () {

        submitBtn.disabled = false;

        submitBtn.textContent = "Submit Review";

    });

}