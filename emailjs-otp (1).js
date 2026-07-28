/* ========================================================
   EMAILJS & OTP SERVICE (emailjs-otp.js)
   ======================================================== */

// 1. CONFIGURATION - Replace with your actual EmailJS Keys
const EMAILJS_PUBLIC_KEY  = "vtWQlgJVYx-WCGNHC";  // e.g., "user_xxxxxx"
const EMAILJS_SERVICE_ID  = "service_5ib3tid";         // e.g., "service_xxxxxx"
const EMAILJS_TEMPLATE_ID = "template_q9s57ud";        // e.g., "template_xxxxxx"

// 2. GLOBAL STATE VARIABLES
let generatedOTP = null;
let otpExpirationTimestamp = null;
let pendingUserData = null;
let externalSignUpCallback = null; // Holds reference to main auth signup function

// Initialize EmailJS when script loads
if (window.emailjs) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
} else {
    console.error("EmailJS SDK is missing! Ensure the EmailJS script tag is loaded in <head> before emailjs-otp.js");
}

/* ========================================================
   HELPER FUNCTIONS
   ======================================================== */

// Generate a random 6-digit OTP code string
function generate6DigitOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Get formatted expiration time string (e.g. "04:15 PM")
function getFormattedExpirationTime(minutesToAdd = 15) {
    const targetDate = new Date(Date.now() + minutesToAdd * 60 * 1000);
    return targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Send Email via EmailJS SDK
async function sendOTPEmail(targetEmail, otpCode, timeString) {
    const templateParams = {
        email: targetEmail,
        passcode: otpCode,
        time: timeString
    };
    return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
}

/* ========================================================
   MAIN OTP ACTION HANDLERS
   ======================================================== */

/**
 * Call this from your main sign-up function (e.g. performNavAuth)
 * @param {Object} userData - { email, password, username }
 * @param {Function} signUpCallback - Async function to execute upon successful OTP verification (e.g., signUpUser)
 */
async function initiateOTPFlow(userData, signUpCallback) {
    pendingUserData = userData;
    externalSignUpCallback = signUpCallback;

    const submitBtn = document.getElementById("navSubmitBtn");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending OTP Email...";
    }

    generatedOTP = generate6DigitOTP();
    const timeString = getFormattedExpirationTime(15);
    otpExpirationTimestamp = Date.now() + (15 * 60 * 1000);

    try {
        await sendOTPEmail(userData.email, generatedOTP, timeString);

        // Show Modal and update UI elements
        const recipientEmailSpan = document.getElementById("otpRecipientEmail");
        const otpModal = document.getElementById("otpModal");
        const otpError = document.getElementById("otpError");
        const otpInput = document.getElementById("otpInput");

        if (recipientEmailSpan) recipientEmailSpan.textContent = userData.email;
        if (otpError) otpError.textContent = "";
        if (otpInput) otpInput.value = "";
        if (otpModal) otpModal.style.display = "block";
        if (submitBtn) submitBtn.style.display = "none";

    } catch (err) {
        alert("⚠️ Failed to send OTP email: " + (err.text || err.message || err));
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Sign Up";
        }
    }
}

// Handler for the "Verify & Complete Sign Up" button
async function verifyAndCreateAccount() {
    const otpInput = document.getElementById("otpInput");
    const otpError = document.getElementById("otpError");
    const verifyBtn = document.getElementById("verifyOtpBtn");

    const userEnteredOTP = otpInput ? otpInput.value.trim() : "";

    if (!userEnteredOTP) {
        if (otpError) otpError.textContent = "⚠️ Please enter the 6-digit code.";
        return;
    }

    if (Date.now() > otpExpirationTimestamp) {
        if (otpError) otpError.textContent = "❌ OTP expired (15-minute limit). Click 'Resend OTP'.";
        return;
    }

    if (userEnteredOTP !== generatedOTP) {
        if (otpError) otpError.textContent = "❌ Incorrect OTP code.";
        return;
    }

    try {
        if (verifyBtn) {
            verifyBtn.disabled = true;
            verifyBtn.textContent = "Creating Account...";
        }

        // Execute the sign-up callback provided from main auth script
        if (typeof externalSignUpCallback === "function") {
            const { email, password, username } = pendingUserData;
            await externalSignUpCallback(email, password, username);
        } else {
            console.warn("No sign-up callback function was provided to initiateOTPFlow.");
        }

        // Hide modals and reset buttons on success
        const otpModal = document.getElementById("otpModal");
        const navLoginModal = document.getElementById("navLoginModal");
        const submitBtn = document.getElementById("navSubmitBtn");

        if (otpModal) otpModal.style.display = "none";
        if (navLoginModal) navLoginModal.style.display = "none";
        if (submitBtn) {
            submitBtn.style.display = "block";
            submitBtn.disabled = false;
            submitBtn.textContent = "Sign Up";
        }

        alert("🎉 Email successfully verified! Welcome!");
    } catch (err) {
        if (otpError) otpError.textContent = "⚠️ " + (err.message || err);
        if (verifyBtn) {
            verifyBtn.disabled = false;
            verifyBtn.textContent = "Verify & Complete Sign Up";
        }
    }
}

// Handler for the "Resend OTP" button
async function resendOTPCode() {
    const otpError = document.getElementById("otpError");
    const resendBtn = document.getElementById("resendOtpBtn");

    if (!pendingUserData) return;

    if (resendBtn) {
        resendBtn.disabled = true;
        resendBtn.textContent = "Sending new code...";
    }

    generatedOTP = generate6DigitOTP();
    const timeString = getFormattedExpirationTime(15);
    otpExpirationTimestamp = Date.now() + (15 * 60 * 1000);

    try {
        await sendOTPEmail(pendingUserData.email, generatedOTP, timeString);
        if (otpError) {
            otpError.style.color = "#00ff88";
            otpError.textContent = "✓ A new OTP was sent!";
            setTimeout(() => { 
                otpError.style.color = "#ff6b6b"; 
                otpError.textContent = ""; 
            }, 4000);
        }
    } catch (err) {
        if (otpError) {
            otpError.style.color = "#ff6b6b";
            otpError.textContent = "⚠️ Failed to resend: " + (err.text || err.message || err);
        }
    }

    if (resendBtn) {
        resendBtn.disabled = false;
        resendBtn.textContent = "Didn't receive code? Resend OTP";
    }
}

/* ========================================================
   EVENT LISTENERS SETUP
   ======================================================== */
document.addEventListener("DOMContentLoaded", function () {
    const verifyBtn = document.getElementById("verifyOtpBtn");
    const resendBtn = document.getElementById("resendOtpBtn");

    if (verifyBtn) verifyBtn.addEventListener("click", verifyAndCreateAccount);
    if (resendBtn) resendBtn.addEventListener("click", resendOTPCode);
});